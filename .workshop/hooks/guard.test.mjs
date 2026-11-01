import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { denialReason, effectiveCwd } from './guard.mjs';

const request = (command) => ({ tool_name: 'Bash', tool_input: { command } });

for (const command of [
  'git show solution/optimized-agent:agent/file.ts',
  'git switch origin/solution/optimized-agent',
  'git fetch origin solution/optimized-agent',
  'git merge refs/heads/solution/optimized-agent',
  'git cherry-pick 0123456789abcdef',
  'git log --all',
  'git switch -',
  'git checkout @{-1}',
  'git fetch origin',
  'gh repo view',
  'gh api repos/{owner}/{repo}/contents/agent',
  'git cat-file -p HEAD',
  'git show :/solution',
  'git restore --source=0123456789abcdef README.md',
  'git worktree add /tmp/solution solution/optimized-agent',
  'cat .git/objects/ab/cdef',
  'cat .facilitator/notes.md',
  'curl https://raw.githubusercontent.com/JonaCodes/agent-optimization-workshop/main/README.md',
  'gh api repos/JonaCodes/agent-optimization-workshop/contents/agent',
  'rm .codex/hooks.json',
  'echo disabled > .codex/config.toml',
]) {
  test(`denies ${command}`, () => assert.ok(denialReason(request(command))));
}

for (const command of [
  'git status --short', 'git diff', 'git log main -5', 'git show main:README.md',
  'git fetch origin main', 'git restore README.md', 'npm test',
  'curl https://example.com/docs', 'rg cart shopping-site',
]) {
  test(`allows ${command}`, () => assert.equal(denialReason(request(command), 'main'), null));
}

test('denies solution HEAD history reads', () => {
  for (const command of ['git show HEAD', 'git diff', 'git log -1']) {
    assert.ok(denialReason(request(command), 'solution/optimized-agent'));
  }
});

test('checks local, web, MCP, and edit inputs', () => {
  for (const event of [
    { tool_name: 'Read', tool_input: { file_path: '.facilitator/notes.md' } },
    { tool_name: 'WebFetch', tool_input: { url: 'https://github.com/JonaCodes/agent-optimization-workshop' } },
    { tool_name: 'mcp__github__get_file', tool_input: { ref: 'solution/optimized-agent' } },
    { tool_name: 'apply_patch', tool_input: { patch: '*** Delete File: .claude/settings.json' } },
  ]) assert.ok(denialReason(event));
});

test('stdin protocol denies with exit 2 and allows without output', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'workshop-guard-'));
  try {
    execFileSync('git', ['init', '-b', 'main', cwd], { stdio: 'ignore' });
    const script = fileURLToPath(new URL('./guard.mjs', import.meta.url));
    const invoke = (input) => spawnSync(process.execPath, [script], { cwd, input, encoding: 'utf8' });
    const allowed = invoke(JSON.stringify({ ...request('git diff'), cwd }));
    assert.equal(allowed.status, 0);
    assert.equal(allowed.stdout + allowed.stderr, '');
    const denied = invoke(JSON.stringify({ ...request('git show solution/optimized-agent'), cwd }));
    assert.equal(denied.status, 2);
    assert.match(denied.stderr, /Workshop guardrail/);
    assert.equal(invoke('{invalid').status, 2);
    execFileSync('git', ['symbolic-ref', 'HEAD', 'refs/heads/solution/optimized-agent'], { cwd });
    assert.equal(invoke(JSON.stringify({ ...request('git show HEAD'), cwd })).status, 2);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test('protects checkout content while allowing return to main', () => {
  for (const event of [
    request('cat README.md'), request('rg cart shopping-site'),
    { tool_name: 'Read', tool_input: { file_path: 'README.md' } },
    { tool_name: 'Grep', tool_input: { pattern: 'cart' } },
  ]) {
    assert.ok(denialReason(event, 'solution/optimized-agent'));
    assert.equal(denialReason(event, 'main'), null);
  }
  for (const command of ['git switch main', 'git status --short']) {
    assert.equal(denialReason(request(command), 'solution/optimized-agent'), null);
  }
});

test('allows guard review and tests, blocks changes', () => {
  for (const event of [
    request('node --test .workshop/hooks/guard.test.mjs'),
    request('cat .workshop/hooks/guard.mjs'),
    { tool_name: 'Read', tool_input: { file_path: '.codex/hooks.json' } },
  ]) assert.equal(denialReason(event, 'main'), null);
  assert.ok(denialReason(request('echo disabled > .codex/config.toml'), 'main'));
});

test('resolves straightforward shell working directories', () => {
  assert.equal(effectiveCwd({ ...request('cd ../solution && cat README.md'), cwd: '/tmp/main' }), '/tmp/solution');
  assert.equal(effectiveCwd({ ...request('git -C "/tmp/solution" show HEAD'), cwd: '/tmp/main' }), '/tmp/solution');
});

test('blocks target GitHub MCP retrieval without a URL or ref', () => {
  assert.ok(denialReason({ tool_name: 'mcp__github__get_file_contents', tool_input: {
    owner: 'JonaCodes', repo: 'agent-optimization-workshop', path: 'agent/foo',
  } }, 'main'));
  assert.equal(denialReason({ tool_name: 'mcp__github__get_file_contents', tool_input: {
    owner: 'someone', repo: 'another-repo', path: 'src/foo',
  } }, 'main'), null);
});

test('stdin protocol checks file paths in another protected checkout', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'workshop-paths-'));
  const main = join(fixture, 'participant');
  const solution = join(fixture, 'protected');
  try {
    mkdirSync(main);
    mkdirSync(solution);
    execFileSync('git', ['init', '-b', 'main', main], { stdio: 'ignore' });
    execFileSync('git', ['init', '-b', 'solution/optimized-agent', solution], { stdio: 'ignore' });
    const target = join(solution, 'file.txt');
    writeFileSync(target, 'fixture');
    const script = fileURLToPath(new URL('./guard.mjs', import.meta.url));
    for (const event of [
      { tool_name: 'Read', tool_input: { file_path: target } },
      { tool_name: 'Grep', tool_input: { path: solution, pattern: 'fixture' } },
      request(`cat "${target}"`),
    ]) {
      const result = spawnSync(process.execPath, [script], {
        cwd: main, input: JSON.stringify({ ...event, cwd: main }), encoding: 'utf8',
      });
      assert.equal(result.status, 2, result.stderr);
    }
    const result = spawnSync(process.execPath, [script], {
      cwd: main, input: JSON.stringify({ cwd: main, tool_name: 'Read', tool_input: { file_path: join(main, 'new.txt') } }), encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
