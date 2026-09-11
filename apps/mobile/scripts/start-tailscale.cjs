const { existsSync } = require('node:fs');
const { execFileSync, spawn } = require('node:child_process');
const { resolve } = require('node:path');

const tailscalePath = 'C:\\Program Files\\Tailscale\\tailscale.exe';

if (process.platform !== 'win32' || !existsSync(tailscalePath)) {
  console.error('Tailscale for Windows was not found at C:\\Program Files\\Tailscale\\tailscale.exe.');
  process.exit(1);
}

let tailscaleIp;
try {
  tailscaleIp = execFileSync(tailscalePath, ['ip', '-4'], { encoding: 'utf8' }).trim().split(/\s+/)[0];
} catch {
  console.error('Could not read a Tailscale IPv4 address. Connect Tailscale, then try again.');
  process.exit(1);
}

if (!tailscaleIp) {
  console.error('No Tailscale IPv4 address was returned. Connect Tailscale, then try again.');
  process.exit(1);
}

console.log(`Starting Expo Go at exp://${tailscaleIp}:8081`);

const expoCli = require.resolve('expo/bin/cli');
const expo = spawn(process.execPath, [expoCli, 'start', '--clear', '--lan'], {
  env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: tailscaleIp },
  stdio: 'inherit',
});

expo.on('exit', (code) => process.exit(code ?? 1));
