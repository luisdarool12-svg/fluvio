const {
  default: makeWASocket,
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
const pino = require('pino')
const path = require('path')
const fs = require('fs')

// ─── Config ──────────────────────────────────────────────────────────���────────
const BOT_API_URL          = process.env.BOT_API_URL          || 'http://localhost:8001'
const DUBLE_PHONE_NUMBER_ID = process.env.DUBLE_PHONE_NUMBER_ID || 'duble-baileys'
const INTERNAL_JOB_SECRET  = process.env.INTERNAL_JOB_SECRET  || ''
const AUTH_DIR             = path.resolve(__dirname, 'auth_info')

// Los endpoints /internal/* del bot exigen este header en cada request.
axios.defaults.headers.common['X-Internal-Secret'] = INTERNAL_JOB_SECRET
if (!INTERNAL_JOB_SECRET) {
  console.warn('[bot] ADVERTENCIA: INTERNAL_JOB_SECRET no configurado — el bot rechazará las llamadas del bridge')
}

const logger = pino({ level: 'silent' })

// ─── Estado global ────────────────────────────────────────────────────────────
let sock = null
let reconnectTimer = null
let outboxTimer = null
let reminderTimer = null
let confirmationTimer = null

// Deduplicación: evita procesar el mismo mensaje dos veces
const processedIds = new Set()

// ─── Inicio ───────────────────────────────────────────────────────────────────
async function startBot() {
  console.log('[bot] Iniciando Baileys...')

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)

  let version
  try {
    const fetched = await fetchLatestBaileysVersion()
    version = fetched.version
    console.log(`[bot] Versión WA: ${version.join('.')}`)
  } catch {
    console.warn('[bot] No se pudo obtener la versión más reciente de WA')
  }

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    browser: Browsers.macOS('Desktop'),
    markOnlineOnConnect: false,
    syncFullHistory: false,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n[bot] QR recibido — escanea desde el dashboard o terminal:\n')
      qrcode.generate(qr, { small: true })
      return
    }

    if (connection === 'open') {
      const rawId = sock.user?.id ?? ''
      const phone = rawId.split(':')[0] ?? rawId
      console.log(`[bot] ✅ Conectado como ${phone}`)
      // Arrancar pollers con delay para evitar conflictos al inicio
      setTimeout(startOutboxPoller,       3000)
      setTimeout(startReminderPoller,     5000)
      setTimeout(startConfirmationPoller, 7000)
      return
    }

    if (connection === 'close') {
      stopPollers()
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode

      if (code === DisconnectReason.loggedOut) {
        console.log('[bot] Sesión cerrada (loggedOut) — limpiando auth y mostrando QR...')
        sock = null
        // Borrar credenciales viejas para que muestre QR limpio
        try {
          fs.readdirSync(AUTH_DIR).forEach(f => fs.unlinkSync(path.join(AUTH_DIR, f)))
          console.log('[bot] Auth limpiado OK')
        } catch (e) {
          console.warn('[bot] No se pudo limpiar auth:', e.message)
        }
        setTimeout(startBot, 2000)
        return
      }

      scheduleReconnect(code)
    }
  })

  // ─── Mensajes entrantes ───────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      try {
        await processMessage(msg)
      } catch (err) {
        console.error('[bot] Error procesando mensaje:', err.message)
      }
    }
  })
}

async function processMessage(msg) {
  if (msg.key.fromMe) return

  const remoteJid = msg.key.remoteJid ?? ''
  const isDirectChat = remoteJid.endsWith('@s.whatsapp.net') || remoteJid.endsWith('@lid')
  if (!isDirectChat) return

  // Deduplicación por message ID
  const msgId = msg.key.id ?? ''
  if (msgId && processedIds.has(msgId)) {
    console.log(`[bot] Duplicado ignorado: ${msgId}`)
    return
  }
  if (msgId) {
    processedIds.add(msgId)
    if (processedIds.size > 500) {
      processedIds.delete(processedIds.values().next().value)
    }
  }

  const text =
    msg.message?.conversation ??
    msg.message?.extendedTextMessage?.text ??
    null

  if (!text) return

  const phone    = remoteJid.replace(/@s\.whatsapp\.net$|@lid$/, '')
  const pushName = msg.pushName ?? null

  console.log(`[bot] ← ${phone} (${pushName ?? '?'}): "${text}"`)

  try {
    const response = await axios.post(
      `${BOT_API_URL}/internal/process`,
      {
        customer_phone:            phone,
        text,
        business_phone_number_id:  DUBLE_PHONE_NUMBER_ID,
        push_name:                 pushName,
        jid:                       remoteJid,
      },
      { timeout: 30000 }
    )

    const reply = response.data.reply
    if (reply && sock) {
      await sock.sendMessage(remoteJid, { text: reply })
      console.log(`[bot] → ${phone}: "${reply.substring(0, 80)}${reply.length > 80 ? '…' : ''}"`)
    }
  } catch (err) {
    console.error(`[bot] Error procesando ${phone}:`, err.message)
  }
}

// ─── Reconexión ───────────────────────────────────────────────────────────────
function scheduleReconnect(code) {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  const delay = code === 440 ? 15000 : 5000
  console.log(`[bot] Reconectando en ${delay / 1000}s (code=${code})...`)
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    if (sock) { try { sock.end(undefined) } catch {} sock = null }
    startBot()
  }, delay)
}

// ─── Outbox poller (mensajes del operador humano) ─────────────────────────────
function startOutboxPoller() {
  if (outboxTimer) return
  outboxTimer = setInterval(async () => {
    if (!sock) return
    try {
      const res = await axios.get(
        `${BOT_API_URL}/internal/outbox/${DUBLE_PHONE_NUMBER_ID}`,
        { timeout: 5000 }
      )
      for (const item of res.data.items ?? []) {
        try {
          const jid = item.jid ?? `${item.phone}@s.whatsapp.net`
          await sock.sendMessage(jid, { text: item.content })
          await axios.post(`${BOT_API_URL}/internal/outbox/${item.id}/sent`, {}, { timeout: 5000 })
          console.log(`[bot] Outbox → ${item.phone}`)
        } catch (err) {
          console.error(`[bot] Error outbox id=${item.id}:`, err.message)
        }
      }
    } catch (err) {
      if (err.code !== 'ECONNREFUSED') {
        console.error('[bot] Error outbox poller:', err.message)
      }
    }
  }, 3000)
}

// ─── Reminder poller (recordatorio ~2h antes) ─────────────────────────────────
function startReminderPoller() {
  if (reminderTimer) return
  reminderTimer = setInterval(async () => {
    if (!sock) return
    try {
      const res = await axios.get(
        `${BOT_API_URL}/internal/reminders/${DUBLE_PHONE_NUMBER_ID}`,
        { timeout: 5000 }
      )
      for (const r of res.data.items ?? []) {
        const h12 = formatHora12(r.hora)
        const pax = r.personas === 1 ? '1 persona' : `${r.personas} personas`
        const msg =
          `Le recordamos su reservación en Dublé hoy a las ${h12}, ` +
          `a nombre de ${r.nombre}, para ${pax}.\n\n` +
          `Le esperamos en Blvd. Campestre 2416, Bosques del Refugio, León, Gto.\n` +
          `https://www.google.com/maps/search/?api=1&query=Blvd.+Campestre+2416+Le%C3%B3n+Guanajuato`
        try {
          const jid = r.jid ?? `${r.phone}@s.whatsapp.net`
          await sock.sendMessage(jid, { text: msg })
          await axios.post(`${BOT_API_URL}/internal/reminders/${r.id}/sent`, {}, { timeout: 5000 })
          console.log(`[bot] Recordatorio → ${r.phone} (${r.nombre})`)
        } catch (err) {
          console.error(`[bot] Error recordatorio id=${r.id}:`, err.message)
        }
      }
    } catch (err) {
      if (err.code !== 'ECONNREFUSED') {
        console.error('[bot] Error reminder poller:', err.message)
      }
    }
  }, 60000)
}

// ─── Confirmation poller (confirmación 24h antes) ─────────────────────────────
function startConfirmationPoller() {
  if (confirmationTimer) return
  confirmationTimer = setInterval(async () => {
    if (!sock) return
    try {
      const res = await axios.get(
        `${BOT_API_URL}/internal/confirmations/${DUBLE_PHONE_NUMBER_ID}`,
        { timeout: 5000 }
      )
      for (const r of res.data.items ?? []) {
        const h12 = formatHora12(r.hora)
        const pax = r.personas === 1 ? '1 persona' : `${r.personas} personas`
        const msg =
          `Le confirmamos su reservación en Dublé Bistró para mañana ${r.fecha} ` +
          `a las ${h12}, a nombre de ${r.nombre}, para ${pax}.\n\n` +
          `Por favor responda *SI* para confirmar su lugar o *NO* si necesita cancelar. ` +
          `Si tiene cambios, con gusto le ayudamos aquí mismo.`
        try {
          const jid = r.jid ?? `${r.phone}@s.whatsapp.net`
          await sock.sendMessage(jid, { text: msg })
          await axios.post(`${BOT_API_URL}/internal/confirmations/${r.id}/sent`, {}, { timeout: 5000 })
          console.log(`[bot] Confirmación 24h → ${r.phone} (${r.nombre})`)
        } catch (err) {
          console.error(`[bot] Error confirmación id=${r.id}:`, err.message)
        }
      }
    } catch (err) {
      if (err.code !== 'ECONNREFUSED') {
        console.error('[bot] Error confirmation poller:', err.message)
      }
    }
  }, 60000)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatHora12(hora) {
  const [hh, mm] = hora.split(':').map(Number)
  const period = hh >= 12 ? 'pm' : 'am'
  const h12 = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh
  return `${h12}:${String(mm).padStart(2, '0')} ${period}`
}

function stopPollers() {
  if (outboxTimer)       { clearInterval(outboxTimer);       outboxTimer = null }
  if (reminderTimer)     { clearInterval(reminderTimer);     reminderTimer = null }
  if (confirmationTimer) { clearInterval(confirmationTimer); confirmationTimer = null }
}

// ─── Arranque ─────────────────────────────────────────────────────────────────
startBot().catch(err => {
  console.error('[bot] Error fatal al iniciar:', err)
  process.exit(1)
})

process.on('SIGINT',  () => { stopPollers(); console.log('[bot] Detenido'); process.exit(0) })
process.on('SIGTERM', () => { stopPollers(); console.log('[bot] Detenido'); process.exit(0) })
