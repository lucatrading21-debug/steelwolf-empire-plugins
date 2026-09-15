/* Risoluzione cartella briefing. Un'assenza non e' mai un elenco vuoto. */
import { existsSync, readdirSync, statSync } from "node:fs";
export function resolveBriefings(dir) {
  if (!dir) return { provided: false, exists: false, names: [], dir: null };
  let exists = false;
  try { exists = existsSync(dir) && statSync(dir).isDirectory(); } catch { exists = false; }
  return { provided: true, exists, names: exists ? readdirSync(dir) : [], dir };
}
