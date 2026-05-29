#!/usr/bin/env node
const { execFileSync, spawnSync } = require('node:child_process');

function readStdin() {
  return new Promise((resolve) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    process.stdin.on('end', () => {
      resolve(input);
    });
  });
}

function gitRoot(cwd) {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd,
    encoding: 'utf8',
  }).trim();
}

function walkStrings(value, output = []) {
  if (typeof value === 'string') {
    output.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => walkStrings(item, output));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => walkStrings(item, output));
  }

  return output;
}

function isPrCreate(payload) {
  const commandText = walkStrings(payload).join('\n');
  return /(^|[;&|()\n]\s*)gh\s+pr\s+create(\s|$)/.test(commandText);
}

function emit(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

async function main() {
  const payload = JSON.parse(await readStdin());

  if (!isPrCreate(payload)) {
    return;
  }

  const root = gitRoot(payload.cwd || '.');
  const result = spawnSync('pnpm', ['api:harness:pr'], {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.status === 0) {
    return;
  }

  let output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  if (output.length > 8000) {
    output = output.slice(-8000);
  }

  emit({
    decision: 'block',
    reason:
      'pnpm api:harness:pr failed, so PR creation was blocked. ' +
      `Fix the reported failures, rerun pnpm api:harness:pr, then create the PR.\n\n${output}`,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
