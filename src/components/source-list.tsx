import { ExternalLink } from "lucide-react";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SourceList({ urls }: { urls: string[] }) {
  return (
    <ul className="space-y-1.5">
      {urls.map((url) => (
        <li key={url}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs inline-flex items-center gap-1.5 text-primary hover:underline break-all rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
            {hostname(url)}
            <span className="sr-only"> (abre en nueva pestaña)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
