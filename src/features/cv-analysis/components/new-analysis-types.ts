export interface CVSummary {
  id: string;
  name: string;
  type: "uploaded" | "template";
  filename: string | null;
}

export interface NewAnalysisInput {
  cvId: string;
  title: string;
}

export type CreateCVHandler = (file: File, name: string) => Promise<string>;
export type CreateAnalysisHandler = (input: NewAnalysisInput) => Promise<string>;
