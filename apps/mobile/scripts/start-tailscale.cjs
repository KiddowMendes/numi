const { existsSync } = require("node:fs");
const { execFileSync, spawn } = require("node:child_process");
const net = require("node:net");

const tailscalePath = "C:\\Program Files\\Tailscale\\tailscale.exe";
const defaultPort = 8081;
const maxPortAttempts = 10;

if (process.platform !== "win32" || !existsSync(tailscalePath)) {
  console.error(
    "Tailscale for Windows was not found at C:\\Program Files\\Tailscale\\tailscale.exe.",
  );
  process.exit(1);
}

let tailscaleIp;
try {
  tailscaleIp = execFileSync(tailscalePath, ["ip", "-4"], { encoding: "utf8" })
    .trim()
    .split(/\s+/)[0];
} catch {
  console.error(
    "Could not read a Tailscale IPv4 address. Connect Tailscale, then try again.",
  );
  process.exit(1);
}

if (!tailscaleIp) {
  console.error(
    "No Tailscale IPv4 address was returned. Connect Tailscale, then try again.",
  );
  process.exit(1);
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once("error", () => resolve(false));
    probe.once("listening", () => probe.close(() => resolve(true)));
    probe.listen(port);
  });
}

async function findFreePort() {
  for (
    let port = defaultPort;
    port < defaultPort + maxPortAttempts;
    port += 1
  ) {
    if (await isPortFree(port)) {
      return port;
    }
  }
  return null;
}

async function main() {
  const port = await findFreePort();
  if (port === null) {
    console.error(
      `No free port between ${defaultPort} and ${defaultPort + maxPortAttempts - 1}.`,
    );
    process.exit(1);
  }

  if (port !== defaultPort) {
    console.warn(`Port ${defaultPort} is busy, using ${port} instead.`);
  }

  console.log(`Starting Expo Go at exp://${tailscaleIp}:${port}`);

  const expoCli = require.resolve("expo/bin/cli");
  const expo = spawn(
    process.execPath,
    [expoCli, "start", "--clear", "--lan", "--port", String(port)],
    {
      env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: tailscaleIp },
      stdio: "inherit",
    },
  );

  expo.on("exit", (code) => process.exit(code ?? 1));
}

main();
