import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { join } from "node:path";

const platform = process.argv[2];
const projectRoot = join(import.meta.dirname, "..");
const port = process.env.PORT ?? "3000";

if (!["android", "ios"].includes(platform)) {
  console.error("Uso: node scripts/dev-emulator.mjs <android|ios>");
  process.exit(1);
}

function detectLanIp() {
  const preferredOrder = ["en0", "en1", "eth0", "wlan0"];
  const candidates = [];

  for (const [name, addresses] of Object.entries(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family !== "IPv4" || address.internal) continue;
      candidates.push({ name, address: address.address });
    }
  }

  candidates.sort((a, b) => {
    const ai = preferredOrder.indexOf(a.name);
    const bi = preferredOrder.indexOf(b.name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return candidates[0]?.address ?? null;
}

async function serverIsReady(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await serverIsReady(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`El servidor no respondió en ${url}`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function openAndroid(url) {
  const sdkRoot = process.env.ANDROID_HOME ?? join(process.env.HOME, "Library/Android/sdk");
  const emulator = join(sdkRoot, "emulator/emulator");
  const adb = join(sdkRoot, "platform-tools/adb");

  if (!existsSync(emulator) || !existsSync(adb)) {
    throw new Error("No se encontró Android SDK. Instálalo desde Android Studio.");
  }

  const devices = spawnSync(adb, ["devices"], { encoding: "utf8" }).stdout ?? "";
  if (!devices.includes("emulator-")) {
    const avds = spawnSync(emulator, ["-list-avds"], { encoding: "utf8" }).stdout
      .trim()
      .split("\n")
      .filter(Boolean);
    const avd = process.env.ANDROID_AVD ?? avds[0];
    if (!avd) throw new Error("No hay ningún emulador Android configurado.");

    spawn(emulator, ["-avd", avd], { detached: true, stdio: "ignore" }).unref();
    run(adb, ["wait-for-device"]);
  }

  run(adb, ["shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", url]);
}

function openIos(url) {
  const check = spawnSync("xcrun", ["simctl", "list", "devices", "available"], {
    encoding: "utf8",
  });
  if (check.status !== 0) {
    throw new Error("No se encontró un simulador iOS. Instala Xcode y un iOS Simulator.");
  }

  const deviceId = check.stdout.match(/\(([0-9A-F-]{36})\) \((?:Shutdown|Booted)\)/)?.[1];
  if (!deviceId) throw new Error("No hay ningún simulador iOS disponible.");

  run("open", ["-a", "Simulator"]);
  const boot = spawnSync("xcrun", ["simctl", "boot", deviceId], { stdio: "ignore" });
  if (boot.status !== 0) {
    const state = spawnSync("xcrun", ["simctl", "list", "devices"], {
      encoding: "utf8",
    }).stdout;
    if (!state.includes(`${deviceId}) (Booted)`)) process.exit(boot.status ?? 1);
  }
  run("xcrun", ["simctl", "bootstatus", deviceId, "-b"]);
  run("xcrun", ["simctl", "openurl", deviceId, url]);
}

const lanIp = detectLanIp();
if (!lanIp) throw new Error("No se pudo detectar una IP LAN.");

const url = `http://${lanIp}:${port}`;
let server;

if (!(await serverIsReady(url))) {
  server = spawn("npm", ["run", "dev:mobile"], {
    cwd: projectRoot,
    env: { ...process.env, PORT: port },
    stdio: "inherit",
  });
  await waitForServer(url);
}

console.log(`[dev:${platform}] Abriendo ${url}`);
if (platform === "android") openAndroid(url);
else openIos(url);

server?.on("exit", (code) => process.exit(code ?? 0));
