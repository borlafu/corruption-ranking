"use client";

import { useState, useMemo } from "react";
import type { SuspectView, Allegiance, Crime } from "@/lib/schema";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, Users, Flower2, Briefcase, Search, Handshake } from "lucide-react";
import Image from "next/image";

const allegianceFilters: { name: Allegiance | "all"; icon: React.ElementType; label: string }[] = [
  { name: "all", icon: () => <span className="text-sm"></span>, label: "Todos" },
  { name: "gobierno", icon: Briefcase, label: "Gobierno" },
  { name: "familia", icon: Users, label: "Familia" },
  { name: "psoe", icon: Flower2, label: "PSOE" },
  { name: "institucional", icon: Landmark, label: "Institucional" },
  { name: "entorno", icon: Handshake, label: "Entorno" },
];

type CaseLeaderboardPageProps = {
  cases: SuspectView[];
};

export function CaseLeaderboardPage({ cases: initialCases }: CaseLeaderboardPageProps) {
  const [activeFilter, setActiveFilter] = useState<Allegiance | "all">("all");
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeCrime, setActiveCrime] = useState<Crime | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const years = useMemo(
    () => [...new Set(initialCases.map((c) => c.startYear))].sort((a, b) => b - a),
    [initialCases]
  );
  const crimes = useMemo(
    () => [...new Set(initialCases.flatMap((c) => c.crimes))].sort((a, b) => a.localeCompare(b, "es")),
    [initialCases]
  );

  const lastUpdated = useMemo(() => {
    const maxDate = initialCases
      .map((c) => c.lastUpdated)
      .filter(Boolean)
      .sort()
      .at(-1);
    if (!maxDate) return "";
    return new Date(maxDate).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [initialCases]);

  const filteredCases = useMemo(() => {
    const byFilters = initialCases.filter(
      (c) =>
        (activeFilter === "all" || c.categories.includes(activeFilter)) &&
        (activeYear === null || c.startYear === activeYear) &&
        (activeCrime === "all" || c.crimes.includes(activeCrime))
    );
    if (!searchQuery.trim()) return byFilters;
    const q = searchQuery.toLowerCase();
    return byFilters.filter(
      (c) =>
        c.suspect.toLowerCase().includes(q) ||
        c.caseName.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
    );
  }, [initialCases, activeFilter, activeYear, activeCrime, searchQuery]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1658922184278-9ca61d7209c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzcGFuaXNoJTIwZ292ZXJubWVudCUyMGJ1aWxkaW5nfGVufDB8fHx8MTc2Mzc0MzYxNXww&ixlib=rb-4.1.0&q=80&w=1920')`,
      }}
      data-ai-hint="spanish government building"
    >
      <div className="min-h-screen bg-black/70 text-foreground">
        <main className="container mx-auto px-4 py-8 md:py-12">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="w-full">
              <div className="flex justify-center items-center gap-4">
                <h1 className="text-6xl lg:text-8xl font-bold text-primary-foreground font-headline text-center uppercase tracking-wider">
                  España Corrupta
                </h1>
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/4/41/Logotipo_del_PSOE.svg"
                  alt="PSOE logo"
                  width={100}
                  height={100}
                  className="hidden md:block"
                />
              </div>
              <p className="text-center text-muted-foreground mt-2 max-w-2xl mx-auto">
                Un marcador no oficial que rastrea acusaciones y condenas en casos de corrupción en España.
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1 text-center">Última actualización: {lastUpdated}</p>
              )}
            </div>
          </header>

          <div className="mb-4 flex flex-wrap gap-2 items-center justify-center">
            <p className="text-sm font-medium mr-2 text-muted-foreground">Filtrar por:</p>
            {allegianceFilters.map((filter) => (
              <Button
                key={filter.name}
                variant={activeFilter === filter.name ? "secondary" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.name)}
                className="gap-2 transition-colors duration-300 capitalize"
              >
                <filter.icon className={filter.name === "all" ? "hidden" : "h-4 w-4"} />
                <span>{filter.label}</span>
              </Button>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-2 items-center justify-center">
            <p className="text-sm font-medium mr-2 text-muted-foreground">Año:</p>
            <Button
              variant={activeYear === null ? "secondary" : "outline"}
              size="sm"
              onClick={() => setActiveYear(null)}
              className="transition-colors duration-300"
            >
              Todos
            </Button>
            {years.map((year) => (
              <Button
                key={year}
                variant={activeYear === year ? "secondary" : "outline"}
                size="sm"
                onClick={() => setActiveYear(year)}
                className="font-mono transition-colors duration-300"
              >
                {year}
              </Button>
            ))}
            <Select value={activeCrime} onValueChange={(v) => setActiveCrime(v as Crime | "all")}>
              <SelectTrigger className="w-[260px] h-9 bg-card/60 backdrop-blur-sm" aria-label="Filtrar por delito">
                <SelectValue placeholder="Delito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los delitos</SelectItem>
                {crimes.map((crime) => (
                  <SelectItem key={crime} value={crime}>
                    {crime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4 relative max-w-sm mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar sospechoso o caso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/60 backdrop-blur-sm"
            />
          </div>

          <div className="rounded-lg border shadow-lg overflow-hidden bg-card/80 backdrop-blur-sm">
            <LeaderboardTable cases={filteredCases} allCases={initialCases} />
          </div>

          <footer className="text-center mt-12 text-muted-foreground text-sm">
            <p>Los datos se basan en informaciones publicadas por medios de comunicación e instituciones judiciales.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
