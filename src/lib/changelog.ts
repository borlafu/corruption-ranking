import { ChangelogSchema, type ChangeKind, type ChangelogEntry } from "@/lib/schema";
import changelogData from "@/lib/changelog.json";

/**
 * Parsed once at build time; shared by /cambios, its feed and the root page. Server-only by use:
 * importing it from a client component would ship the whole changelog in the bundle.
 */
export const changelog: ChangelogEntry[] = ChangelogSchema.parse(changelogData);

/** Distinct records touched by a kind; id-less changes (bajas) count one each. */
function countKind(entry: ChangelogEntry, kind: ChangeKind) {
  const changes = entry.changes.filter((c) => c.kind === kind);
  return new Set(changes.flatMap((c) => c.ids)).size + changes.filter((c) => c.ids.length === 0).length;
}

export function countLine(entry: ChangelogEntry) {
  const [altas, updates, bajas] = (["nuevo", "actualizado", "eliminado"] as const).map((k) => countKind(entry, k));
  const parts = [
    altas && `${altas} ${altas === 1 ? "alta" : "altas"}`,
    updates && `${updates} ${updates === 1 ? "registro actualizado" : "registros actualizados"}`,
    bajas && `${bajas} ${bajas === 1 ? "baja" : "bajas"}`,
    entry.notAdded.length > 0 && `${entry.notAdded.length} ${entry.notAdded.length === 1 ? "descartado" : "descartados"}`,
    entry.watchlist.length > 0 && `${entry.watchlist.length} en seguimiento`,
  ].filter(Boolean);
  return [...(altas || updates || bajas ? [] : ["sin cambios en los registros"]), ...parts].join(" · ");
}
