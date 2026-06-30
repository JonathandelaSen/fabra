import type {
  CreateOpportunityPersonResponse,
  ListOpportunityPeopleResponse,
  OpportunityPersonResponse,
} from "@/app/api/job-match-analyses/[id]/people/responses";
import type {
  DeleteOpportunityPersonResponse,
  UpdateOpportunityPersonResponse,
} from "@/app/api/job-match-analyses/[id]/people/[personId]/responses";

export type { OpportunityPersonResponse };
export type OpportunityPersonRole = OpportunityPersonResponse["role"];

export interface OpportunityPersonInput {
  name: string;
  role: OpportunityPersonRole;
  jobTitle: string | null;
  organization: string | null;
  email: string | null;
  phone: string | null;
  links: Array<{ url: string; label: string | null }>;
  notes: string | null;
}

async function readJsonResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;
  if (!response.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

function peoplePath(analysisId: string): string {
  return `/api/job-match-analyses/${encodeURIComponent(analysisId)}/people`;
}

export async function listOpportunityPeople(analysisId: string) {
  const response = await fetch(peoplePath(analysisId));
  return readJsonResponse<ListOpportunityPeopleResponse>(
    response,
    "Could not load opportunity people.",
  );
}

export async function createOpportunityPerson(
  analysisId: string,
  input: OpportunityPersonInput,
) {
  const response = await fetch(peoplePath(analysisId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJsonResponse<CreateOpportunityPersonResponse>(
    response,
    "Could not create opportunity person.",
  );
}

export async function updateOpportunityPerson(
  analysisId: string,
  personId: string,
  input: OpportunityPersonInput,
) {
  const response = await fetch(
    `${peoplePath(analysisId)}/${encodeURIComponent(personId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return readJsonResponse<UpdateOpportunityPersonResponse>(
    response,
    "Could not update opportunity person.",
  );
}

export async function deleteOpportunityPerson(
  analysisId: string,
  personId: string,
) {
  const response = await fetch(
    `${peoplePath(analysisId)}/${encodeURIComponent(personId)}`,
    { method: "DELETE" },
  );
  return readJsonResponse<DeleteOpportunityPersonResponse>(
    response,
    "Could not delete opportunity person.",
  );
}
