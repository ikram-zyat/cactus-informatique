import { webcrypto, randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { writeFileSync } from "node:fs";

globalThis.crypto ??= webcrypto;
const { hashAdmin } = await import("../src/auth.js");

const rl = createInterface({ input: process.stdin });
const lines = rl[Symbol.asyncIterator]();
const ask = async (q) => { process.stdout.write(q); const { value } = await lines.next(); return value ?? ""; };
const nom = (await ask("Votre nom : ")).trim();
const email = (await ask("E-mail (ce sera votre identifiant) : ")).trim().toLowerCase();
const pw = (await ask("Mot de passe (12 caractères minimum) : ")).trim();
rl.close();

if (!nom || !email.includes("@") || pw.length < 12) {
  console.log("Informations incomplètes ou mot de passe trop court (12 caractères minimum).");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = await hashAdmin(email, pw, salt);
writeFileSync(
  new URL("../src/admin.config.js", import.meta.url),
  `// Compte administrateur : généré par « npm run make-admin ».\nexport const ADMIN = ${JSON.stringify({ nom, email, salt, hash, createdAt: new Date().toISOString().slice(0, 10) }, null, 2)};\n`,
);
console.log("Compte administrateur enregistré dans src/admin.config.js. Vous pouvez vous connecter avec " + email);
