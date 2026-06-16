export interface ParseCVUploadResponse {
  id: string;
  cvId: string;
  filename: string | null;
  created_at: string;
  texts: {
    python: string | null;
    pdfjs: string | null;
    node: string | null;
  };
  errors: {
    python: string | null;
    pdfjs: string | null;
    node: string | null;
  };
}
