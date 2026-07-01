/* SteelWolf Empire - domain guard (Cowork-safe, no bash/no cwd-dependency).
 * Discriminatore: cartella-progetto selezionata.
 *  - Cowork: CLAUDE_CODE_WORKSPACE_HOST_PATHS (path host reale).
 *  - CLI:    CLAUDE_PROJECT_DIR / cwd (riflettono il progetto).
 * Ritorna true solo nel dominio SteelWolf. Copyright (c) 2026 Luke SteelWolf. */
module.exports = function inSteelWolfDomain() {
  const cowork = process.env.CLAUDE_CODE_IS_COWORK === "1";
  const hay = cowork
    ? (process.env.CLAUDE_CODE_WORKSPACE_HOST_PATHS || "")
    : (process.env.CLAUDE_PROJECT_DIR || process.cwd() || "");
  return /steelwolf/i.test(hay);
};
