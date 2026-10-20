import { Euro, Users } from "lucide-react";
import { badgeVariants } from "@/components/ui/badge";
import type { CaseStatus } from "@/lib/schema";
import type { CauseOverview } from "@/lib/filters";
import { formatEur, statusConfig, statusCount, statusTally } from "@/lib/status-ui";

/** One badge per status present, with how many of `statuses` hold it. */
export function StatusCounts({ statuses }: { statuses: CaseStatus[] }) {
  return statusTally(statuses).map(({ status, n }) => (
    <span key={status} className={`${badgeVariants({ variant: "outline" })} ${statusConfig[status].className}`}>
      {statusCount(status, n)}
    </span>
  ));
}

/** Summary of one cause, shown above the table while filtering by `caso`. */
export function CaseBanner({ cause }: { cause: CauseOverview }) {
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
        <StatusCounts statuses={cause.members.map((m) => m.status)} />
      </div>
    </section>
  );
}
