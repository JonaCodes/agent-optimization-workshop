import { execFileSync } from 'node:child_process';
import { dirname, isAbsolute, resolve } from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

async function main() {
  try {
    let raw = '';
    for await (const chunk of process.stdin) raw += chunk;
    const event = JSON.parse(raw);
    const branches = effectiveCwds(event).map(currentBranch);
    const branch = branches.find((name) => name === 'solution/optimized-agent' || name === '(detached)') ?? branches[0];
    const reason = denialReason(event, branch);
    if (!reason) return;
    process.stderr.write(`Workshop guardrail: ${reason} Work from local participant files and implement your own changes.\n`);
    process.exitCode = 2;
  } catch {
    process.stderr.write('Workshop guardrail: Could not validate tool input. Retry with a valid tool request.\n');
    process.exitCode = 2;
  }
}

export function denialReason(event, branch = '') {
  const input = JSON.stringify(event.tool_input ?? event.arguments ?? {});
  const text = input.replaceAll('\\\\', '/').replaceAll('\\/', '/');
  const command = event.tool_input?.command ?? event.tool_input?.cmd ?? '';
  if (/(?:^|[^\w])\.(?:git|facilitator)(?:[\/\s"'\\]|$)/i.test(text)) {
    return 'Repository internals and facilitator material are outside the workshop task.';
  }
  if (/solution(?:\/|%2f|\\u002f)optimized-agent/i.test(text)) {
    return 'The workshop solution branch is reserved for the facilitator.';
  }
  if (modifiesGuardrails(event, text, command)) return 'Keep the workshop guardrails in place.';
  if (/(?:github\.com|raw\.githubusercontent\.com|api\.github\.com)[^\s"']*agent-optimization-workshop/i.test(text)
    || (/\"owner\"\s*:\s*\"JonaCodes\"/i.test(text) && /\"repo(?:sitory)?\"\s*:\s*\"agent-optimization-workshop\"/i.test(text))
    || /\bgh\s+(?:api|repo\s+(?:view|clone)|search\s+code)\b/i.test(command)) {
    return 'Retrieve workshop context from the local participant files.';
  }
  if (/\bgit\b/.test(command)) {
    if (/(?:--all|--branches|--remotes|--glob|--reflog|FETCH_HEAD|ORIG_HEAD|HEAD@\{|@\{-\d+\}|:\/|\b[0-9a-f]{7,40}\b)/i.test(command)
      || /\b(?:switch|checkout)\s+-\s*(?:$|[;&|])/i.test(command)
      || /\bcat-file\b/i.test(command)) {
      return 'Broad and indirect history reads are restricted.';
    }
    if (/\b(?:fetch|pull)\b/i.test(command) && !/^\s*git\s+fetch\s+origin\s+main\s*$/.test(command)) {
      return 'Fetch only the participant main branch explicitly.';
    }
  }
  if (branch === 'solution/optimized-agent' || branch === '(detached)') {
    if (!safeOnProtectedCheckout(event, command)) {
      return 'Switch to main before reading or changing workshop files.';
    }
  }
  return null;
}

function modifiesGuardrails(event, text, command) {
  if (!/(?:\.workshop[\/]hooks|\.claude[\/]settings\.json|\.codex[\/](?:hooks\.json|config\.toml))/i.test(text)) return false;
  if (/(?:Write|Edit|apply_patch|update|delete|remove)/i.test(event.tool_name ?? '')) return true;
  if (typeof command !== 'string' || !command) return false;
  // Permit review and the documented tests; treat other shell access conservatively.
  return !/^\s*(?:node\s+--test\s+\.workshop\/hooks\/guard\.test\.mjs|(?:cat|head|tail|less|rg|grep)\s+[^;&|>]+)\s*$/.test(command);
}

function safeOnProtectedCheckout(event, command) {
  if (typeof command !== 'string' || !command) return false;
  return /^\s*git\s+(?:status(?:\s+--short)?|branch\s+--show-current|rev-parse\s+--show-toplevel|(?:switch|checkout)\s+main)\s*$/.test(command);
}

export function effectiveCwd(event) {
  return effectiveCwds(event).at(-1);
}

function effectiveCwds(event) {
  let cwd = event.cwd ?? process.cwd();
  const paths = [cwd];
  const command = event.tool_input?.command ?? event.tool_input?.cmd ?? '';
  // Resolve straightforward shell directory selection without evaluating shell code.
  for (const match of command.matchAll(/(?:\bcd\s+|\bgit\s+-C\s+)(?:"([^"]+)"|'([^']+)'|([^\s;&|]+))/g)) {
    cwd = resolve(cwd, match[1] ?? match[2] ?? match[3]);
    paths.push(cwd);
  }
  collectPaths(event.tool_input ?? event.arguments ?? {}, event.cwd ?? process.cwd(), paths);
  for (const match of command.matchAll(/(?:\b(?:cat|head|tail|less)\s+)(?:\"([^\"]+)\"|'([^']+)'|([^\s;&|]+))/g)) {
    const target = match[1] ?? match[2] ?? match[3];
    if (isAbsolute(target)) paths.push(nearestDirectory(target));
  }
  return paths;
}

function collectPaths(input, cwd, paths) {
  if (!input || typeof input !== 'object') return;
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string' && /^(?:file_?path|path|directory|dir|cwd|root)$/i.test(key)) {
      paths.push(nearestDirectory(resolve(cwd, value)));
    } else if (value && typeof value === 'object') collectPaths(value, cwd, paths);
  }
}

function nearestDirectory(target) {
  while (!existsSync(target)) {
    const parent = dirname(target);
    if (parent === target) return target;
    target = parent;
  }
  return statSync(target).isDirectory() ? target : dirname(target);
}

export function currentBranch(cwd) {
  try {
    return execFileSync('git', ['symbolic-ref', '--quiet', '--short', 'HEAD'], {
      cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '(detached)';
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
