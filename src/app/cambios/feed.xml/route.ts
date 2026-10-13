import { changelog, countLine } from "@/lib/changelog";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { entryId, formatDate } from "@/lib/status-ui";

// Required by `output: 'export'`: emitted once at build time as out/cambios/feed.xml.
export const dynamic = "force-static";

const escapeXml = (text: string) =>
  text.replace(/[<>&'"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[ch]!);

const PAGE_URL = `${SITE_URL}/cambios`;

/** RSS 2.0: one item per data run, linking to its entry on /cambios. */
export function GET() {
  const items = changelog.map((e) => {
    const link = `${PAGE_URL}#${entryId(e.date)}`;
    const title = `Actualización del ${formatDate(e.date, { day: "numeric", month: "long", year: "numeric" })}`;
    return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(e.date).toUTCString()}</pubDate>
      <description>${escapeXml(`${countLine(e)}. ${e.summary}`)}</description>
    </item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`Registro de cambios — ${SITE_NAME}`)}</title>
    <link>${PAGE_URL}</link>
    <atom:link href="${PAGE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Qué cambió en cada actualización de los datos de ${escapeXml(SITE_NAME)}.</description>
    <language>es-es</language>
${items.join("\n")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
