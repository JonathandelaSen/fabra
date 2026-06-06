import { readFile } from "node:fs/promises";

const RECOVERY_TEMPLATE_PATH = new URL("../supabase/templates/recovery.html", import.meta.url);
const CONFIRMATION_TEMPLATE_PATH = new URL("../supabase/templates/confirmation.html", import.meta.url);
const CONFIG_PATH = new URL("../supabase/config.toml", import.meta.url);

// Load env vars from .env.local if present
try {
  const envContent = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const val = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
} catch {
  // Ignore if .env.local doesn't exist
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  const accessToken = requireEnv("SUPABASE_ACCESS_TOKEN");
  const projectRef = requireEnv("SUPABASE_PROJECT_REF");

  // Read config.toml to extract site_url and additional_redirect_urls
  const configToml = await readFile(CONFIG_PATH, "utf8");
  const siteUrlMatch = configToml.match(/site_url\s*=\s*"([^"]+)"/);
  if (!siteUrlMatch) {
    throw new Error("Could not find site_url in supabase/config.toml");
  }
  const siteUrl = siteUrlMatch[1];

  const redirectUrlsMatch = configToml.match(/additional_redirect_urls\s*=\s*\[([^\]]+)\]/);
  let uriAllowList = "";
  if (redirectUrlsMatch) {
    uriAllowList = redirectUrlsMatch[1]
      .split(",")
      .map((url) => url.trim().replace(/"/g, ""))
      .join(",");
  }

  // Read templates
  const recoveryTemplate = await readFile(RECOVERY_TEMPLATE_PATH, "utf8");
  const confirmationTemplate = await readFile(CONFIRMATION_TEMPLATE_PATH, "utf8");

  if (!recoveryTemplate.includes("{{ .ConfirmationURL }}")) {
    throw new Error("Recovery template must include {{ .ConfirmationURL }}.");
  }
  if (!confirmationTemplate.includes("{{ .ConfirmationURL }}")) {
    throw new Error("Confirmation template must include {{ .ConfirmationURL }}.");
  }



  const response = await fetch(
    `https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        site_url: siteUrl,
        uri_allow_list: uriAllowList,
        mailer_subjects_recovery: "Restablece tu contraseña",
        mailer_templates_recovery_content: recoveryTemplate,
        mailer_subjects_confirmation: "Confirma tu email",
        mailer_templates_confirmation_content: confirmationTemplate,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Supabase Management API returned ${response.status} ${response.statusText}: ${body}`
    );
  }


}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
