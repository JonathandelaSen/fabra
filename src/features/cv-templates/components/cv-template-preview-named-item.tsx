import { buildExternalLinkHref, type StandardCVNamedItem } from "@/lib/cv-profile";
import { hasItems } from "./cv-template-preview";

interface CVTemplatePreviewNamedItemProps {
  item: StandardCVNamedItem;
}

export function CVTemplatePreviewNamedItem({
  item,
}: CVTemplatePreviewNamedItemProps) {
  const metaParts = [item.issuer, item.organization].filter(Boolean);
  return (
    <article className="cvp-item cvp-small-item" data-item-id={item.id}>
      <div className="cvp-item-head">
        <div>
          <h3>{item.name}</h3>
          <p>
            {metaParts.join(" · ")}
            {metaParts.length > 0 && item.url ? " · " : ""}
            {item.url && <a href={buildExternalLinkHref(item.url)} target="_blank" rel="noopener noreferrer">{item.url}</a>}
          </p>
        </div>
        <span>{item.date}</span>
      </div>
      {item.description && <p className="cvp-description">{item.description}</p>}
      {hasItems(item.bullets) && (
        <ul>
          {item.bullets?.map((bullet, index) => {
            const bulletId = item.bulletIds?.[index];
            return (
              <li key={index} data-bullet-id={bulletId}>
                {bullet}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
