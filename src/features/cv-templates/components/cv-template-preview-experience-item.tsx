import type { StandardCVExperience } from "@/lib/cv-profile";
import { dateRange, hasItems } from "./cv-template-preview";

interface CVTemplatePreviewExperienceItemProps {
  item: StandardCVExperience;
  companyFirst?: boolean;
}

export function CVTemplatePreviewExperienceItem({
  item,
  companyFirst,
}: CVTemplatePreviewExperienceItemProps) {
  return (
    <article className="cvp-item">
      <div className="cvp-item-head">
        <div>
          <h3>{companyFirst ? (item.company || item.role) : (item.role || item.company)}</h3>
          <p>
            {companyFirst
              ? [item.role, item.location].filter(Boolean).join(" · ")
              : [item.company, item.location].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span>{dateRange(item.dates)}</span>
      </div>
      {hasItems(item.bullets) && (
        <ul>
          {item.bullets?.map((bullet, index) => <li key={index}>{bullet}</li>)}
        </ul>
      )}
    </article>
  );
}
