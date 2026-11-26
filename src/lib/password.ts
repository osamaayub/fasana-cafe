import "server-only";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const N = 32768, r = 8, p = 1, LEN = 64;
const opts = { N, r, p, maxmem: 128 * N * r * 2 };

/** Format: scrypt$N$r$p$saltB64$hashB64 */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, LEN, opts);
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [alg, n, rr, pp, saltB64, hashB64] = stored.split("$");
  if (alg !== "scrypt") return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n), r: Number(rr), p: Number(pp), maxmem: 128 * Number(n) * Number(rr) * 2,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Used when the email doesn't exist, so a wrong email takes as long as a wrong password. */
let dummy: string | null = null;
export async function burnTime(password: string) {
  dummy ??= await hashPassword("not-a-real-password");
  await verifyPassword(password, dummy);
}
