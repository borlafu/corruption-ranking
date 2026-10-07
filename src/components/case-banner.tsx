import { Euro, Users } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import { STATUSES } from "@/lib/schema";
import type { CauseOverview } from "@/lib/filters";
import { formatEur, statusConfig } from "@/lib/status-ui";

/** Summary of one cause, shown above the table while filtering by `caso`. */
export function CaseBanner({ cause }: { cause: CauseOverview }) {
  const counts = STATUSES.map((st) => ({ st, n: cause.members.filter((m) => m.status === st).length })).filter((x) => x.n > 0);
  return (
    <section aria-labelledby="case-banner-title" className="mb-4 rounded-lg border bg-card/80 p-4">
      <h2 id="case-banner-title" className="font-headline text-2xl uppercase tracking-wide">
        {cause.name}
      </h2>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" aria-hidden />
          {cause.members.length} implicados
        </span>
        {cause.amount !== undefined && (
          <span className="flex items-center gap-1.5">
            <Euro className="h-4 w-4" aria-hidden />
            {formatEur(cause.amount)}
          </span>
        )}
        {counts.map(({ st, n }) => (
          <span key={st} className={`${badgeVariants({ variant: "outline" })} ${statusConfig[st].className}`}>
            {n} {statusConfig[st].label.toLowerCase()}
          </span>
        ))}
      </div>
    </section>
  );
}
