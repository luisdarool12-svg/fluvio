import sys
from pathlib import Path

# Permite importar modules.* desde apps/api sin instalar el paquete
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
