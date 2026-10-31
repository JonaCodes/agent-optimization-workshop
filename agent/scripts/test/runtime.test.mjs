import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";
import {
  checkDependencies,
  checkNodeVersion,
  packageJson,
} from "../runtime.mjs";

test("Node 24+ works without a patch or npm version pin", () => {
  for (const version of ["24.0.0", "24.19.0", "25.0.0", "26.0.0"]) {
    assert.doesNotThrow(() => checkNodeVersion(version));
  }
  assert.throws(
    () => checkNodeVersion("22.12.0"),
    /Node.js 24 or newer.*22.12.0/,
  );
});

test("missing and mismatched dependencies report the setup command", async (t) => {
  const root = await mkdtemp(resolve(tmpdir(), "workshop-deps-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await assert.rejects(
    checkDependencies(root),
    /Missing dependency.*npm --prefix agent run init-setup/,
  );

  for (const [name, version] of Object.entries({
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  })) {
    const directory = resolve(root, "node_modules", name);
    await mkdir(directory, { recursive: true });
    await writeFile(
      resolve(directory, "package.json"),
      JSON.stringify({ version }),
    );
  }
  await checkDependencies(root);
  await writeFile(
    resolve(root, "node_modules/eve/package.json"),
    JSON.stringify({ version: "99.0.0" }),
  );
  await assert.rejects(
    checkDependencies(root),
    /Expected eve@0.88.0; found 99.0.0.*npm --prefix agent run init-setup/,
  );
});
