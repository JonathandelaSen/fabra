export const publicCVKeys = { all: ["public-cv"] as const, notes: (cvId: string) => ["public-cv", "notes", cvId] as const, feedback: (cvId: string) => ["public-cv", "feedback", cvId] as const };
