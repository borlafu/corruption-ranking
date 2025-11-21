"use client";

import { useState, useMemo, useEffect } from "react";
import type { Case, Allegiance } from "@/lib/types";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Button } from "@/components/ui/button";
import { Landmark, Users, Flower2, Briefcase } from "lucide-react";
import Image from "next/image";

const allegianceFilters: { name: Allegiance | "all"; icon: React.ElementType; label: string }[] = [
  { name: "all", icon: () => <span className="text-sm"></span>, label: "Todos" },
  { name: "gobierno", icon: Briefcase, label: "Gobierno" },
  { name: "familia", icon: Users, label: "Familia" },
  { name: "psoe", icon: Flower2, label: "PSOE" },
  { name: "institucional", icon: Landmark, label: "Institucional" },
];

type CaseLeaderboardPageProps = {
  cases: Case[];
};

export function CaseLeaderboardPage({ cases: initialCases }: CaseLeaderboardPageProps) {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<Allegiance | "all">("all");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString("es-ES"));
  }, []);

  const filteredCases = useMemo(() => {
    if (activeFilter === "all") {
      return cases;
    }
    return cases.filter((c) => c.category === activeFilter);
  }, [cases, activeFilter]);

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
                Un marcador no oficial que rastrea acusaciones y sentencias en casos de corrupción en España.
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1 text-center">Última actualización: {lastUpdated}</p>
              )}
            </div>
          </header>

          <div className="mb-6 flex flex-wrap gap-2 items-center justify-center">
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

          <div className="rounded-lg border shadow-lg overflow-hidden bg-card/80 backdrop-blur-sm">
            <LeaderboardTable cases={filteredCases} />
          </div>

          <footer className="text-center mt-12 text-muted-foreground text-sm">
            <p className="mt-4">Este proyecto es para fines de demostración. Los datos son ilustrativos.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
