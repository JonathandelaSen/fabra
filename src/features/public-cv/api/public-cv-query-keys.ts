export const publicCVKeys = { all: ["public-cv"] as const, notes: (cvId: string) => ["public-cv", "notes", cvId] as const };
