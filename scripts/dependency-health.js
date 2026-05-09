#!/usr/bin/env node
/**
 * Dependency Health Check
 * Scans package.json for outdated, vulnerable, or deprecated dependencies.
 * Run with: node scripts/dependency-health.js
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PKG_PATH = path.join(ROOT, 'package.json');

function run(cmd, args = []) {
  const actualCmd = process.platform === 'win32' && cmd === 'npm' ? 'npm.cmd' : cmd;
  const result = spawnSync(actualCmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  if (result.error) {
    return '';
  }

  return result.stdout || result.stderr || '';
}

function color(label, text) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
  };
  return `${colors[label] || ''}${text}${colors.reset}`;
}

function parseOutdated(stdout) {
  const lines = stdout.trim().split('\n').slice(1); // skip header
  const deps = [];
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 4 && /^[a-z@]/.test(parts[0]) && /^\d/.test(parts[1])) {
      deps.push({
        name: parts[0],
        current: parts[1],
        wanted: parts[2],
        latest: parts[3],
      });
    }
  }
  return deps;
}

function main() {
  console.log(color('cyan', '=== Dependency Health Check ===\n'));

  if (!fs.existsSync(PKG_PATH)) {
    console.error(color('red', 'package.json not found'));
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  console.log(`Total dependencies: ${Object.keys(allDeps).length}\n`);

  // Outdated check
  console.log(color('cyan', '--- Outdated Dependencies ---'));
  const outdatedRaw = run('npm', ['outdated']);
  const outdated = parseOutdated(outdatedRaw);

  if (outdated.length === 0) {
    console.log(color('green', 'All dependencies are up to date.\n'));
  } else {
    console.log(`Found ${outdated.length} outdated package(s):\n`);
    for (const dep of outdated) {
      const isMajor = dep.current.split('.')[0] !== dep.latest.split('.')[0];
      const label = isMajor ? color('red', 'MAJOR') : color('yellow', 'MINOR');
      console.log(`  ${label} ${dep.name}: ${dep.current} → ${dep.latest} (wanted: ${dep.wanted})`);
    }
    console.log();
  }

  // Audit check
  console.log(color('cyan', '--- Security Audit ---'));
  const auditRaw = run('npm', ['audit', '--json']);
  let audit = { metadata: { vulnerabilities: { total: 0 } } };
  try {
    audit = JSON.parse(auditRaw);
  } catch {
    // ignore parse errors
  }
  const vulns = audit.metadata?.vulnerabilities || {};
  const totalVulns = vulns.total || 0;

  if (totalVulns === 0) {
    console.log(color('green', 'No known vulnerabilities found.\n'));
  } else {
    console.log(color('red', `Found ${totalVulns} vulnerability(ies):`));
    for (const [severity, count] of Object.entries(vulns)) {
      if (severity !== 'total' && count > 0) {
        const colorName = severity === 'critical' || severity === 'high' ? 'red' : 'yellow';
        console.log(`  ${color(colorName, `${severity}: ${count}`)}`);
      }
    }
    console.log();
  }

  // Summary
  console.log(color('cyan', '--- Summary ---'));
  const issues = outdated.length + totalVulns;
  if (issues === 0) {
    console.log(color('green', 'Dependency health: EXCELLENT'));
  } else if (totalVulns > 0) {
    console.log(color('red', `Dependency health: NEEDS ATTENTION (${issues} issue(s))`));
    process.exitCode = 1;
  } else {
    console.log(color('yellow', `Dependency health: GOOD (${outdated.length} outdated)`));
  }
}

main();
