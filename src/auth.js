// Empreinte SHA-256 : le mot de passe n'est jamais stocké en clair.
// Attention : c'est une simulation pour la démo, pas une vraie sécurité (tout reste dans le navigateur).
export async function hash(email, pw) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`mg:${email.toLowerCase()}:${pw}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Empreinte renforcée (PBKDF2, 200 000 tours) pour le compte administrateur.
export async function hashAdmin(email, pw, salt) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(`${salt}:${email.toLowerCase()}`), iterations: 200000 },
    key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
