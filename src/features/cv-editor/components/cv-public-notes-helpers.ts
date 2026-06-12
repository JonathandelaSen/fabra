import type { StandardCVProfile } from "@/lib/cv-profile";

export const sections = ["summary", "experience", "education", "skills", "languages", "certifications", "projects", "awards", "publications", "volunteering"];

export interface SectionItem {
  id: string;
  label: string;
  bullets: string[];
  bulletIds: string[];
}

export function getSectionItems(sectionId: string, profile: any): SectionItem[] {
  const data = profile[sectionId];
  if (!Array.isArray(data)) return [];

  return data.map((item: any, idx: number) => {
    const id = item.id || `${sectionId}-${idx}`;
    let label = "";

    switch (sectionId) {
      case "experience":
        label = `${item.role || "Role"} at ${item.company || "Company"}`;
        break;
      case "education":
        label = `${item.degree || "Degree"} at ${item.institution || "Institution"}`;
        break;
      case "skills":
        label = item.name || `Skill Group ${idx + 1}`;
        break;
      case "languages":
        label = `${item.name || "Language"} (${item.level || "No Level"})`;
        break;
      case "certifications":
        label = `${item.name || "Certification"} from ${item.issuer || item.organization || "Issuer"}`;
        break;
      case "projects":
        label = item.name || `Project ${idx + 1}`;
        break;
      case "awards":
        label = `${item.name || "Award"} from ${item.organization || item.issuer || "Issuer"}`;
        break;
      case "publications":
        label = item.name || `Publication ${idx + 1}`;
        break;
      case "volunteering":
        label = `${item.role || "Volunteer"} at ${item.organization || "Organization"}`;
        break;
      default:
        label = item.name || `Item ${idx + 1}`;
    }

    const bullets = item.bullets || item.details || [];
    const bulletIds = item.bulletIds || item.detailIds || [];

    return { id, label, bullets, bulletIds };
  });
}

export function getAvailableSections(anchorType: "presentation" | "section" | "item" | "bullet", profile: any) {
  if (anchorType === "presentation") return [];
  if (anchorType === "section") {
    return sections.filter((s) => profile[s] !== undefined);
  }
  if (anchorType === "item") {
    return ["experience", "education", "skills", "languages", "certifications", "projects", "awards", "publications", "volunteering"].filter((s) => Array.isArray(profile[s]) && profile[s].length > 0);
  }
  if (anchorType === "bullet") {
    return ["experience", "education", "certifications", "projects", "volunteering"].filter((s) => {
      const arr = profile[s];
      return Array.isArray(arr) && arr.some((item: any) => (item.bullets || item.details || []).length > 0);
    });
  }
  return [];
}
