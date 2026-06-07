import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function detectLanIp() {
  const interfaces = networkInterfaces();
  const preferredOrder = ["en0", "en1", "eth0", "wlan0"];
  const candidates = [];

  for (const [name, addresses] of Object.entries(interfaces)) {
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

function readSupabaseUrlFromEnv() {
  try {
    const raw = readFileSync(join(projectRoot, ".env.local"), "utf8");
    const match = raw.match(/^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

const lanIp = detectLanIp();
if (!lanIp) {
  console.error(
    "[dev:mobile] No se pudo detectar una IP LAN. ¿Estás conectado a una red?"
  );
  process.exit(1);
}

const baseUrl = readSupabaseUrlFromEnv() ?? "http://127.0.0.1:55431";
const supabaseUrl = new URL(baseUrl);
supabaseUrl.hostname = lanIp;
const mobileSupabaseUrl = supabaseUrl.toString().replace(/\/$/, "");

console.log(`[dev:mobile] IP LAN detectada: ${lanIp}`);
console.log(`[dev:mobile] NEXT_PUBLIC_SUPABASE_URL=${mobileSupabaseUrl}`);
console.log(`[dev:mobile] Abre en el móvil: http://${lanIp}:3000`);

const child = spawn("next", ["dev", "-H", "0.0.0.0"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: mobileSupabaseUrl,
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
