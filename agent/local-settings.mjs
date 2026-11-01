import { readFile, writeFile, rename, chmod, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { parseEnv } from "node:util";

export const settingsRoot = fileURLToPath(new URL("./", import.meta.url));
export const managedKeys = ["WORKSHOP_PROVIDER", "AZURE_OPENAI_ENDPOINT", "AZURE_OPENAI_DEPLOYMENT", "AZURE_OPENAI_CONTEXT_WINDOW", "AZURE_OPENAI_API", "AZURE_API_KEY"];
const envFiles = [".env", ".env.development", ".env.local", ".env.development.local"];

// Same precedence as Eve: host environment, then development files (last wins).
export async function loadLocalEnvironment(environment = process.env, root = settingsRoot) {
  const values = {};
  for (const file of envFiles) Object.assign(values, parseEnv(await readOptional(resolve(root, file))));
  for (const [key, value] of Object.entries(values)) {
    if (environment[key] === undefined) environment[key] = value;
  }
  return environment;
}

export async function readSavedSettings(root = settingsRoot) {
  return parseEnv(await readOptional(resolve(root, ".env.local")));
}

export async function saveSettings(settings, root = settingsRoot) {
  const path = resolve(root, ".env.local");
  const previous = await readOptional(path);
  // Consume whole quoted multiline values, preserving all unrelated text verbatim.
  const assignments = /^(?:export[ \t]+)?([\w.-]+)[ \t]*=[ \t]*(?:"[^"]*"|'[^']*'|`[^`]*`|[^\r\n]*)(?:[^\r\n]*)/gm;
  const retained = previous.replace(assignments, (line, key) => managedKeys.includes(key) && Object.hasOwn(settings, key) ? "" : line);
  const entries = Object.entries(settings).filter(([key]) => managedKeys.includes(key));
  const additions = entries.map(([key, value]) => `${key}=${quoteValue(value)}`).join("\n");
  const temporary = `${path}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await writeFile(temporary, `${retained.replace(/\s*$/, "")}\n${additions}\n`, { mode: 0o600, flag: "wx" });
    await rename(temporary, path);
    await chmod(path, 0o600);
  } finally {
    await unlink(temporary).catch((error) => { if (error.code !== "ENOENT") throw error; });
  }
}

function quoteValue(value) {
  if (/[\r\n\0]/.test(value)) throw new Error("Settings must use a single line.");
  const quote = ["'", '"', "`"].find((candidate) => !value.includes(candidate));
  if (!quote) throw new Error("Setting contains unsupported quotation characters.");
  return `${quote}${value}${quote}`;
}

async function readOptional(path) {
  try { return await readFile(path, "utf8"); }
  catch (error) { if (error.code === "ENOENT") return ""; throw error; }
}
