import type { CVEducationPrimitives } from "@/lib/cv-profile";
import { CVInlineMarkdown } from "./cv-inline-markdown";
import { dateRange, hasItems } from "./cv-template-preview";

interface CVTemplatePreviewEducationItemProps {
  item: CVEducationPrimitives;
}

export function CVTemplatePreviewEducationItem({
  item,
}: CVTemplatePreviewEducationItemProps) {
  return (
    <article className="cvp-item" data-item-id={item.id}>
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
          {item.details?.map((detail, index) => {
            const bulletId = item.detailIds?.[index];
            return (
              <li key={index} data-bullet-id={bulletId}>
                <CVInlineMarkdown text={detail} />
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
