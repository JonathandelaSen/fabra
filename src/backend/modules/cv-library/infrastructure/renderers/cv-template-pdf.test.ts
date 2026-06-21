import { describe, expect, it } from "vitest";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import {
  getPDFInlineMarkdownStyles,
  renderTemplatePDF,
} from "./cv-template-pdf";
import type { CVProfilePrimitives } from "@/lib/cv-profile";

const markdownProfile: CVProfilePrimitives = {
  basics: {
    name: "Markdown Candidate",
    headline: "Product Engineer",
    email: "candidate@example.com",
  },
  summary:
    "Engineer focused on **AI workflows**, *developer experience*, ***platform quality***, and [Fabra](https://fabra.app).",
  experience: [
    {
      role: "Senior Engineer",
      company: "Fabra",
      bullets: [
        "Reduced review time by ***35%*** with [automation](https://fabra.app).",
        "Improved **reliability** and *clarity* across releases.",
      ],
    },
  ],
  education: [
    {
      institution: "Example University",
      degree: "MSc Computer Science",
      details: ["Focused on ***human-computer interaction***."],
    },
  ],
  projects: [
    {
      name: "Formatting System",
      description: "Built ***safe inline formatting*** for CV templates.",
      bullets: [
        "Supports **bold**, *italic*, and [links](https://example.com).",
      ],
    },
  ],
};

function fontIncludesName(buffer: Buffer, value: string) {
  const ascii = Buffer.from(value, "ascii");
  const utf16be = Buffer.alloc(value.length * 2);
  for (let index = 0; index < value.length; index += 1) {
    utf16be.writeUInt16BE(value.charCodeAt(index), index * 2);
  }

  return buffer.includes(ascii) || buffer.includes(utf16be);
}

describe("renderTemplatePDF", () => {
  it("assigns explicit font families to italic and bold italic inline PDF segments", () => {
    expect(
      getPDFInlineMarkdownStyles({ fontFamily: "InterPDF", fontSize: 9 }),
    ).toMatchObject({
      strongStyle: { fontFamily: "InterPDFSemiBold", fontWeight: 600 },
      emphasisStyle: { fontFamily: "InterPDF", fontStyle: "italic" },
      strongEmphasisStyle: {
        fontFamily: "InterPDFSemiBold",
        fontWeight: 600,
        fontStyle: "italic",
      },
    });

    expect(
      getPDFInlineMarkdownStyles({ fontFamily: "GaramondPDF", fontSize: 10 }),
    ).toMatchObject({
      strongStyle: { fontFamily: "GaramondPDFBold", fontWeight: 600 },
      emphasisStyle: { fontFamily: "GaramondPDF", fontStyle: "italic" },
      strongEmphasisStyle: {
        fontFamily: "GaramondPDFBold",
        fontWeight: 600,
        fontStyle: "italic",
      },
    });
  });

  it("uses real italic font assets for PDF emphasis styles", () => {
    const fontPairs = [
      ["Inter-Regular.ttf", "Inter-Italic.ttf"],
      ["Inter-SemiBold.ttf", "Inter-SemiBoldItalic.ttf"],
      ["Inter-Bold.ttf", "Inter-BoldItalic.ttf"],
      ["Inter-ExtraBold.ttf", "Inter-ExtraBoldItalic.ttf"],
      ["EBGaramond-Regular.ttf", "EBGaramond-Italic.ttf"],
      ["EBGaramond-Bold.ttf", "EBGaramond-BoldItalic.ttf"],
    ];

    for (const [regularFile, italicFile] of fontPairs) {
      const regularPath = path.join(process.cwd(), "public/fonts", regularFile);
      const italicPath = path.join(process.cwd(), "public/fonts", italicFile);
      const regularHash = createHash("sha256")
        .update(fs.readFileSync(regularPath))
        .digest("hex");
      const italicBuffer = fs.readFileSync(italicPath);
      const italicHash = createHash("sha256")
        .update(italicBuffer)
        .digest("hex");

      expect(italicHash).not.toBe(regularHash);
      expect(fontIncludesName(italicBuffer, "Italic")).toBe(true);
    }
  });

  it("renders limited inline markdown in narrative CV fields without font resolution errors", async () => {
    const pdf = await renderTemplatePDF({
      profile: markdownProfile,
      templateId: "compact",
      locale: "en",
    });

    expect(pdf.length).toBeGreaterThan(0);
  }, 15000);
});
