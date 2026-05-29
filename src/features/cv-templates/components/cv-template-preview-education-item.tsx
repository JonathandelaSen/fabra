import type { StandardCVEducation } from "@/lib/cv-profile";
import { dateRange, hasItems } from "./cv-template-preview";

interface CVTemplatePreviewEducationItemProps {
  item: StandardCVEducation;
}

export function CVTemplatePreviewEducationItem({
  item,
}: CVTemplatePreviewEducationItemProps) {
  return (
    <article className="cvp-item">
      <div className="cvp-item-head">
        <div>
          <h3>{item.degree || item.institution}</h3>
          <p>
            {[item.institution, item.field, item.location]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <span>{dateRange(item.dates)}</span>
      </div>
      {hasItems(item.details) && (
        <ul>
          {item.details?.map((detail, index) => <li key={index}>{detail}</li>)}
        </ul>
      )}
    </article>
  );
}
