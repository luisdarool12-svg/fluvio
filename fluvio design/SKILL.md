---
name: fluvio-design
description: Use this skill to generate well-branded interfaces and assets for Fluvio (restaurant-management SaaS for Mexico — reservations, clients, reputation, and AI WhatsApp marketing), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (tokens,
`base.css`, `components/`, `guidelines/`, `ui_kits/`, `assets/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and
create static HTML files for the user to view — link `styles.css`, use the component classes
in `base.css`, and pull logos/icons from `assets/` and `ui_kits/fluvio-app/lib.jsx`. If
working on production code, copy assets and read the rules here to become an expert in
designing with this brand.

Core rules to honor every time: the five-color system only (Violet `#6447F5`, Coral `#FF6A38`
used sparingly as the one action color, Plum `#180F2E` never pure black, Margen `#FAF9F5`
warm canvas never pure white, Niebla `#9487B0` for secondary text); Syne for display/numbers,
Outfit for UI/body; elevation is a 1px border, not a shadow; sentence-case Spanish copy;
Lucide-style 1.75px icons. "Todo fluye."

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.
