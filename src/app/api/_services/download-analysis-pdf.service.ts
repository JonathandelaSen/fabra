import { NextRequest, NextResponse } from "next/server";
import { getErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";
import { CV_PDFS_BUCKET } from "@/modules/cv-library";
import { ErrorCode } from "@/shared/error-codes";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function downloadAnalysisPdf(
  req: NextRequest,
  input: {
    supabase: SupabaseServerClient;
    filename: string;
    pdfStoragePath: string | null;
  },
) {
  try {
    if (!input.pdfStoragePath) {
      return NextResponse.json(
        { error: "PDF not found", code: ErrorCode.PDF_NOT_FOUND },
        { status: 404 },
      );
    }

    const { data, error } = await input.supabase.storage
      .from(CV_PDFS_BUCKET)
      .download(input.pdfStoragePath);

    if (error || !data) {
      return NextResponse.json(
        { error: "PDF not found", code: ErrorCode.PDF_NOT_FOUND },
        { status: 404 },
      );
    }

    const disposition = req.nextUrl.searchParams.get("download")
      ? "attachment"
      : "inline";

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(input.filename)}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Download PDF error:", error);
    return NextResponse.json(
      {
        error: "Error downloading the PDF",
        code: ErrorCode.INTERNAL,
        details: { message: getErrorMessage(error) },
      },
      { status: 500 },
    );
  }
}
