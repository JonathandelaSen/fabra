import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIRMATION_TEMPLATE_PATH = join(__dirname, "../supabase/templates/confirmation.html");
const RECOVERY_TEMPLATE_PATH = join(__dirname, "../supabase/templates/recovery.html");
const LOGO_SOURCE_PATH = join(__dirname, "../public/brand/fabra-logo.svg");

const PREVIEW_DIR = join(__dirname, "../artifacts");
const PREVIEW_CONFIRMATION_PATH = join(PREVIEW_DIR, "preview-confirmation.html");
const PREVIEW_RECOVERY_PATH = join(PREVIEW_DIR, "preview-recovery.html");
const LOGO_DEST_PATH = join(PREVIEW_DIR, "fabra-logo.svg");

async function generatePreview(sourcePath, destPath, templateName) {
  try {
    const rawTemplate = await readFile(sourcePath, "utf8");
    
    // Replace Go template variables with mock preview values
    const mockURL = "http://localhost:3000/auth/callback?code=mock-preview-token-xyz-123456789";
    const compiled = rawTemplate
      .replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g, mockURL)
      .replace(/\{\{\s*\.SiteURL\s*\}\}\/brand\/fabra-logo\.svg/g, "./fabra-logo.svg")
      .replace(/\{\{\s*\.SiteURL\s*\}\}/g, "../public");
    
    await mkdir(PREVIEW_DIR, { recursive: true });
    await writeFile(destPath, compiled, "utf8");
    console.log(`✅ [${templateName}] Preview generated successfully: ${destPath}`);
  } catch (error) {
    console.error(`❌ Error generating preview for ${templateName}:`, error.message);
  }
}

async function main() {
  await mkdir(PREVIEW_DIR, { recursive: true });
  try {
    await copyFile(LOGO_SOURCE_PATH, LOGO_DEST_PATH);
    console.log(`✅ Logo copied to preview directory: ${LOGO_DEST_PATH}`);
  } catch (error) {
    console.error("❌ Error copying logo:", error.message);
  }
  await generatePreview(CONFIRMATION_TEMPLATE_PATH, PREVIEW_CONFIRMATION_PATH, "Confirmation");
  await generatePreview(RECOVERY_TEMPLATE_PATH, PREVIEW_RECOVERY_PATH, "Recovery");
}

main();
