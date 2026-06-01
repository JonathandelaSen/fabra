# JSON Resume Import

## Summary

Allow users to import a [JSON Resume](https://jsonresume.org/) as a new CV source alongside uploaded PDFs and template CVs. The JSON Resume is mapped deterministically (no AI) to the existing `StandardCVProfile` internal representation and persisted as a reusable CV document.

## Scope

- New `CVDocumentType`: `"json_resume"`
- Domain service: deterministic mapper + permissive validation
- New use case: `CreateJsonResumeCVDocumentUseCase`
- API route: `POST /api/cv-documents/json-resume`
- Frontend: upload `.json` file or paste JSON content
- Available in CV Library and New Analysis flow

## Domain layer

### CVDocumentType change

Add `"json_resume"` to the `CVDocumentTypePrimitives` union in `cv-document-type.value-object.ts`.

### JSON Resume mapper (`domain/services/json-resume-mapper.ts`)

Pure function with signature:

```ts
interface JsonResumeMapperResult {
  profile: StandardCVProfile;
  warnings: string[];
}

function mapJsonResumeToProfile(raw: unknown): JsonResumeMapperResult;
```

**Validation (permissive):**
- Input must be a non-null object
- Must have `basics.name` (non-empty string)
- If validation fails, throw `JsonResumeValidationError`

**Field mapping:**

| JSON Resume | StandardCVProfile |
|---|---|
| `basics.name` | `basics.name` |
| `basics.label` | `basics.headline` |
| `basics.email` | `basics.email` |
| `basics.phone` | `basics.phone` |
| `basics.location.city` (+ region/country) | `basics.location` |
| `basics.url` + `basics.profiles[]` | `basics.links[]` |
| `basics.summary` | `summary` |
| `work[]` | `experience[]` — name→company, position→role, startDate/endDate→dates, highlights→bullets, location→location |
| `education[]` | `education[]` — institution, studyType→degree, area→field, startDate/endDate→dates, courses→details |
| `skills[]` | `skills[]` — name→name, keywords→items |
| `languages[]` | `languages[]` — language→name, fluency→level |
| `certificates[]` | `certifications[]` — name, issuer→issuer, date, url |
| `projects[]` | `projects[]` — name, description, highlights→bullets, startDate/endDate→date, url |
| `volunteer[]` | `volunteering[]` — organization, position→name, summary→description, highlights→bullets, startDate/endDate→date |
| `awards[]` | `awards[]` — title→name, awarder→issuer, date, summary→description |
| `publications[]` | `publications[]` — name, publisher→issuer, releaseDate→date, url, summary→description |
| `interests[]` | ignored (not in StandardCVProfile) |
| `references[]` | ignored (not in StandardCVProfile) |

**Warnings** are generated for missing major sections (no `work`, no `education`, no `skills`) but do not block import.

### Domain error (`domain/errors/json-resume-validation.error.ts`)

```ts
export class JsonResumeValidationError extends DomainError {
  constructor(reason: string) { ... }
}
```

## Application layer

### `CreateJsonResumeCVDocumentUseCase`

**Input:**
```ts
interface CreateJsonResumeCVDocumentInput {
  userId: string;
  name: string;           // user-provided or derived from basics.name
  jsonContent: string;    // raw JSON string
  filename: string | null; // original filename if file upload
}
```

**Flow:**
1. Parse `jsonContent` as JSON (throw `JsonResumeValidationError` if invalid)
2. Call `mapJsonResumeToProfile(parsed)` → get `profile` + `warnings`
3. Generate document ID
4. Upload raw JSON to storage: `{userId}/{docId}.json`
5. Create `CVDocument` with:
   - type: `"json_resume"`
   - profile: mapped `StandardCVProfile`
   - schemaVersion: `CV_PROFILE_SCHEMA_VERSION`
   - pdfStoragePath: storage path of the `.json` file
   - filename: original filename or `"resume.json"`
   - fileSize: byte length of jsonContent
   - extractedText: all nulls (no text extraction needed)
6. Save document
7. Track observability event
8. Return `{ document, warnings }`

**Dependencies:** `documentRepo`, `pdfStorage`, `tracker`

## API layer

### `POST /api/cv-documents/json-resume`

**Content types supported:**
- `multipart/form-data` — field `file` (.json file) + optional `name` field
- `application/json` — body `{ content: string, name?: string }`

**Response:** `201 Created` with document data + warnings array.

**Validation:**
- File must be `.json` or content must be valid JSON string
- Name defaults to `basics.name` from the parsed resume
- Max size: 1MB (JSON Resumes are tiny, this is generous)

## Frontend

### New component: `JsonResumeImport`

Location: `src/features/cv-library/components/json-resume-import.tsx`

Two-tab interface:
1. **Upload file** — drag & drop / click to select `.json` file
2. **Paste JSON** — textarea with paste support

Both tabs share:
- Name input (pre-filled from `basics.name` after parsing)
- Submit button
- Warnings display (non-blocking)
- Error display

### Integration points

1. **CV Library page** — add as alternative upload option (tab or toggle alongside PDF upload)
2. **New Analysis flow** — third source option: "Use existing CV" / "Upload PDF" / "Import JSON Resume"

### i18n

New namespace `jsonResumeImport` in `src/i18n/messages.ts` with keys for both `en` and `es`.

## Storage

Reuse existing `cv-pdfs` bucket. The JSON file is stored at `{userId}/{documentId}.json` with content type `application/json`.

## Testing

- **Domain service tests:** mapper covers all field mappings, edge cases (missing sections, extra fields, partial data), validation errors
- **Use case tests:** mock storage + tracker, verify flow orchestration
- **No AI mocking needed** — entirely deterministic

## Out of scope

- Renaming `pdfStoragePath` field (cosmetic, can follow up)
- JSON Resume export (reverse mapper)
- Re-import / update existing document from new JSON
