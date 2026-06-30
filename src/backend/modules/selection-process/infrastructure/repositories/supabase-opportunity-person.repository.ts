import {
  BoundSupabaseRepository,
  ExecutionResult,
  type LinkPrimitives,
  type UserId,
} from "@/backend/modules/shared";
import { OpportunityPerson } from "../../domain/entities/opportunity-person.entity";
import type {
  OpportunityPersonRepository,
  OpportunityPersonSearchCriteria,
} from "../../domain/repositories/opportunity-person.repository";
import type { OpportunityPersonId } from "../../domain/value-objects/opportunity-person-id.value-object";

interface OpportunityPersonRow {
  id: string;
  user_id: string;
  job_opportunity_id: string;
  name: string;
  role: string;
  job_title: string | null;
  organization: string | null;
  email: string | null;
  phone: string | null;
  links: LinkPrimitives[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToPerson(row: OpportunityPersonRow): OpportunityPerson {
  return OpportunityPerson.fromPrimitives({
    id: row.id,
    userId: row.user_id,
    jobOpportunityId: row.job_opportunity_id,
    name: row.name,
    role: row.role,
    jobTitle: row.job_title,
    organization: row.organization,
    email: row.email,
    phone: row.phone,
    links: row.links,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function personToRow(person: OpportunityPerson): OpportunityPersonRow {
  const primitives = person.toPrimitives();
  return {
    id: primitives.id,
    user_id: primitives.userId,
    job_opportunity_id: primitives.jobOpportunityId,
    name: primitives.name,
    role: primitives.role,
    job_title: primitives.jobTitle,
    organization: primitives.organization,
    email: primitives.email,
    phone: primitives.phone,
    links: primitives.links,
    notes: primitives.notes,
    created_at: primitives.createdAt,
    updated_at: primitives.updatedAt,
  };
}

export class SupabaseOpportunityPersonRepository
  extends BoundSupabaseRepository
  implements OpportunityPersonRepository
{
  async search(
    criteria: OpportunityPersonSearchCriteria,
  ): Promise<OpportunityPerson[]> {
    if (criteria.jobOpportunityIds.length === 0) return [];
    const { data, error } = await this.client
      .from("opportunity_people")
      .select("*")
      .eq("user_id", criteria.userId.toPrimitives())
      .in(
        "job_opportunity_id",
        criteria.jobOpportunityIds.map((id) => id.toPrimitives()),
      )
      .order("created_at", { ascending: true });

    if (error) throw error;
    return ((data ?? []) as OpportunityPersonRow[]).map(rowToPerson);
  }

  async findById(
    id: OpportunityPersonId,
    userId: UserId,
  ): Promise<OpportunityPerson | null> {
    const { data, error } = await this.client
      .from("opportunity_people")
      .select("*")
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives())
      .maybeSingle();

    if (error) throw error;
    return data ? rowToPerson(data as OpportunityPersonRow) : null;
  }

  async save(person: OpportunityPerson): Promise<OpportunityPerson> {
    const { data, error } = await this.client
      .from("opportunity_people")
      .upsert(personToRow(person), { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;
    return rowToPerson(data as OpportunityPersonRow);
  }

  async delete(
    id: OpportunityPersonId,
    userId: UserId,
  ): Promise<ExecutionResult> {
    const { data, error } = await this.client
      .from("opportunity_people")
      .delete()
      .eq("id", id.toPrimitives())
      .eq("user_id", userId.toPrimitives())
      .select("id")
      .maybeSingle();

    if (error) throw error;
    return ExecutionResult.fromPrimitives(Boolean(data));
  }
}
