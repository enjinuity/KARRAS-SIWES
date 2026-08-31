import { cp, mkdir, rm } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const VL_DIR = resolve(ROOT, 'virtual-lab');
const KARRAS_DIST = resolve(ROOT, 'dist');
const VL_DIST_SRC = resolve(VL_DIR, 'dist');
const VL_DIST_OUT = resolve(KARRAS_DIST, 'vl');

const run = (cmd, cwd) => {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd });
};

const main = async () => {
  if (!existsSync(VL_DIR)) {
    console.error('[build-with-vl] virtual-lab folder missing');
    process.exit(1);
  }

  if (!process.env.SKIP_VL_INSTALL) {
    try {
      const VL_VITE = resolve(VL_DIR, 'node_modules', '.bin', 'vite');
      const ROOT_VITE = resolve(ROOT, 'node_modules', '.bin', 'vite');
      const hasVite = existsSync(VL_VITE) || existsSync(ROOT_VITE);
      if (!hasVite) {
        console.log('[build-with-vl] VL vite not found on workspace path, installing workspace deps...');
        run('npm install --no-audit --no-fund --loglevel=error --workspaces --include-workspace-root', ROOT);
      }
    } catch (e) {
      console.warn('[build-with-vl] warning: dep probe failed, continuing anyway', e.message);
    }
  }
  run('npm run build', VL_DIR);

  if (!existsSync(VL_DIST_SRC)) {
    console.error('[build-with-vl] virtual-lab build produced no dist/');
    process.exit(1);
  }

  await mkdir(KARRAS_DIST, { recursive: true });
  await rm(VL_DIST_OUT, { recursive: true, force: true });
  await cp(VL_DIST_SRC, VL_DIST_OUT, { recursive: true });

  console.log(`\n[build-with-vl] copied ${VL_DIST_SRC} -> ${VL_DIST_OUT}`);
  console.log('[build-with-vl] done');
};

void main();
