"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  PersonDetails,
  PersonCastCredit,
  PersonCrewCredit,
  PersonWorkCredit,
  MediaItem,
} from "@/lib/tmdb";
import { useMedia } from "@/components/MediaContext";
import {
  ArrowLeft,
  Star,
  Film,
  Tv,
  Check,
  Plus,
  Sparkles,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Trophy,
  X,
} from "lucide-react";

interface PersonProfileClientProps {
  initialPerson: PersonDetails;
  personId: number;
}

export function PersonProfileClient({
  initialPerson,
  personId,
}: PersonProfileClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    communityData,
    openMediaModal,
    openRatingModal,
    updateMediaStatus,
  } = useMedia();

  const myUserId = (session?.user as any)?.id;
  const myName = session?.user?.name || "";
  const myEmail = session?.user?.email || "";

  const isMe = (userId?: string, userName?: string, userEmail?: string) => {
    if (myUserId && userId && myUserId === userId) return true;
    if (myEmail && userEmail && myEmail.toLowerCase() === userEmail.toLowerCase()) return true;
    if (myName && userName && myName.toLowerCase() === userName.toLowerCase()) return true;
    return false;
  };

  // Works consolidation (guaranteeing deduplication of every movie/series)
  const works: PersonWorkCredit[] = useMemo(() => {
    if (initialPerson.works && initialPerson.works.length > 0) {
      return initialPerson.works;
    }
    // Fallback synthesize from cast & crew if works array is not provided
    const map = new Map<string, PersonWorkCredit>();
    for (const c of initialPerson.cast || []) {
      const key = `${c.mediaType}-${c.id}`;
      map.set(key, {
        ...c,
        characters: c.character ? [c.character] : [],
        jobs: [],
        departments: [],
        isDirector: false,
        isWriter: false,
        isProducer: false,
        isActor: true,
        roleSummary: c.character ? `als ${c.character}` : "Schauspiel",
      });
    }
    for (const c of initialPerson.crew || []) {
      const key = `${c.mediaType}-${c.id}`;
      if (!map.has(key)) {
        map.set(key, {
          ...c,
          characters: [],
          jobs: [c.job],
          departments: [c.department],
          isDirector: c.job === "Director" || c.department === "Directing",
          isWriter: c.department === "Writing",
          isProducer: c.department === "Production",
          isActor: false,
          roleSummary: c.job,
        });
      } else {
        const item = map.get(key)!;
        if (!item.jobs?.includes(c.job)) item.jobs?.push(c.job);
        if (c.job === "Director" || c.department === "Directing") item.isDirector = true;
        if (c.department === "Writing") item.isWriter = true;
        if (c.department === "Production") item.isProducer = true;
      }
    }
    return Array.from(map.values()).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [initialPerson]);

  // Count talk show / interview variety credits
  const talkShowsCount = useMemo(() => {
    return works.filter((w) => w.isTalkShow).length;
  }, [works]);

  // Toggle state: default is FALSE (talk shows are filtered out by default as requested!)
  const [showTalkShows, setShowTalkShows] = useState(false);

  // Effective works: clean filmography without talk shows (unless toggled on, or fallback if only talk shows exist)
  const effectiveWorks = useMemo(() => {
    if (showTalkShows) return works;
    const clean = works.filter((w) => !w.isTalkShow);
    return clean.length > 0 ? clean : works;
  }, [works, showTalkShows]);

  const directingWorks = useMemo(() => {
    return effectiveWorks.filter((w) => w.isDirector);
  }, [effectiveWorks]);

  const actingWorks = useMemo(() => {
    return effectiveWorks.filter((w) => w.isActor);
  }, [effectiveWorks]);

  const crewWorks = useMemo(() => {
    return effectiveWorks.filter(
      (w) => w.isWriter || w.isProducer || (w.jobs && w.jobs.length > 0 && !w.isDirector)
    );
  }, [effectiveWorks]);

  type TabType = "all" | "directing" | "acting" | "crew";

  const availableTabs = useMemo<{ id: TabType; label: string; count: number }[]>(() => {
    const tabs: { id: TabType; label: string; count: number }[] = [];
    const roleCategories =
      (directingWorks.length > 0 ? 1 : 0) +
      (actingWorks.length > 0 ? 1 : 0) +
      (crewWorks.length > 0 ? 1 : 0);

    tabs.push({ id: "all", label: "Alle Werke", count: effectiveWorks.length });

    if (roleCategories > 1) {
      if (directingWorks.length > 0) {
        tabs.push({ id: "directing", label: "Regie", count: directingWorks.length });
      }
      if (actingWorks.length > 0) {
        tabs.push({ id: "acting", label: "Schauspiel", count: actingWorks.length });
      }
      if (crewWorks.length > 0) {
        tabs.push({ id: "crew", label: "Drehbuch & Crew", count: crewWorks.length });
      }
    }

    return tabs;
  }, [effectiveWorks.length, directingWorks.length, actingWorks.length, crewWorks.length]);

  const defaultTab = useMemo<TabType>(() => {
    if (initialPerson.knownForDepartment === "Directing" && directingWorks.length > 0) {
      return "directing";
    }
    return "all";
  }, [initialPerson.knownForDepartment, directingWorks.length]);

  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "movie" | "tv">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "WATCHED" | "UNSEEN" | "WATCHLIST">("ALL");
  const [sortBy, setSortBy] = useState<"popularity" | "release_desc" | "vote_average">("popularity");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullBio, setShowFullBio] = useState(false);

  // Age calculation
  const ageInfo = useMemo(() => {
    if (!initialPerson.birthday) return null;
    const birthDate = new Date(initialPerson.birthday);
    if (isNaN(birthDate.getTime())) return null;

    if (initialPerson.deathday) {
      const deathDate = new Date(initialPerson.deathday);
      if (isNaN(deathDate.getTime())) return null;
      const years = Math.floor(
        (deathDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      return `† ${new Date(initialPerson.deathday).toLocaleDateString("de-DE")} (mit ${years} Jahren)`;
    }

    const today = new Date();
    const years = Math.floor(
      (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return `* ${birthDate.toLocaleDateString("de-DE")} (${years} Jahre)`;
  }, [initialPerson.birthday, initialPerson.deathday]);

  // Map user statuses to media for fast lookup
  const myStatusMap = useMemo(() => {
    const map = new Map<string, { status: "WATCHED" | "WATCHLIST"; rating?: number | null }>();
    for (const m of communityData.mediaStatuses) {
      if (isMe(m.userId, m.userName, (m as any).userEmail)) {
        map.set(`${m.mediaType}-${m.tmdbId}`, {
          status: m.status,
          rating: m.rating ?? undefined,
        });
      }
    }
    return map;
  }, [communityData.mediaStatuses, myUserId, myName, myEmail]);

  // Friends watch map (count how many friends have seen each title)
  const friendsWatchedMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const m of communityData.mediaStatuses) {
      if (!isMe(m.userId, m.userName, (m as any).userEmail) && m.status === "WATCHED") {
        const key = `${m.mediaType}-${m.tmdbId}`;
        const current = map.get(key) || [];
        if (!current.includes(m.userName)) {
          current.push(m.userName);
        }
        map.set(key, current);
      }
    }
    return map;
  }, [communityData.mediaStatuses, myUserId, myName, myEmail]);

  // Which list to evaluate for user watch completion (strictly unique entries, clean filmography)
  const evaluationList = useMemo(() => {
    if (initialPerson.knownForDepartment === "Directing" && directingWorks.length > 0) {
      return directingWorks;
    }
    if (actingWorks.length > 0) {
      return actingWorks;
    }
    return effectiveWorks;
  }, [initialPerson.knownForDepartment, directingWorks, actingWorks, effectiveWorks]);

  // Completion calculation
  const completionStats = useMemo(() => {
    const total = evaluationList.length;
    let watched = 0;
    let watchlist = 0;

    for (const item of evaluationList) {
      const st = myStatusMap.get(`${item.mediaType}-${item.id}`);
      if (st?.status === "WATCHED") watched++;
      else if (st?.status === "WATCHLIST") watchlist++;
    }

    const unseen = Math.max(0, total - watched);
    const percentage = total > 0 ? Math.round((watched / total) * 100) : 0;

    let tierLabel = "Einsteiger:in";
    let tierColor = "text-slate-400";
    if (percentage === 100 && total > 0) {
      tierLabel = "🏆 Meister-Komplettist";
      tierColor = "text-amber-300";
    } else if (percentage >= 75) {
      tierLabel = "🔥 Superfan";
      tierColor = "text-amber-400";
    } else if (percentage >= 50) {
      tierLabel = "⭐ Großer Fan";
      tierColor = "text-amber-400";
    } else if (percentage >= 25) {
      tierLabel = "🍿 Filmkenner:in";
      tierColor = "text-cyan-400";
    } else if (watched > 0) {
      tierLabel = "🌱 Auf Entdeckungsreise";
      tierColor = "text-emerald-400";
    } else {
      tierLabel = "✨ Noch unentdeckt";
      tierColor = "text-slate-400";
    }

    return {
      total,
      watched,
      watchlist,
      unseen,
      percentage,
      tierLabel,
      tierColor,
    };
  }, [evaluationList, myStatusMap]);

  // Filtered and sorted credit list for the active tab (every title strictly unique)
  const displayCredits = useMemo(() => {
    let list: PersonWorkCredit[] = [];
    if (activeTab === "directing") {
      list = directingWorks;
    } else if (activeTab === "acting") {
      list = actingWorks;
    } else if (activeTab === "crew") {
      list = crewWorks;
    } else {
      list = effectiveWorks;
    }

    // Filter by type (movie vs tv)
    if (typeFilter !== "ALL") {
      list = list.filter((c) => c.mediaType === typeFilter);
    }

    // Filter by user watch status
    if (statusFilter !== "ALL") {
      list = list.filter((c) => {
        const st = myStatusMap.get(`${c.mediaType}-${c.id}`);
        if (statusFilter === "WATCHED") return st?.status === "WATCHED";
        if (statusFilter === "WATCHLIST") return st?.status === "WATCHLIST";
        if (statusFilter === "UNSEEN") return !st || st.status !== "WATCHED";
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const titleMatch = c.title.toLowerCase().includes(q);
        const origMatch = c.originalTitle?.toLowerCase().includes(q);
        const charMatch =
          c.characters?.some((ch) => ch.toLowerCase().includes(q)) ||
          c.character?.toLowerCase().includes(q);
        const jobMatch = c.jobs?.some((j) => j.toLowerCase().includes(q));
        const summaryMatch = c.roleSummary?.toLowerCase().includes(q);
        return titleMatch || origMatch || charMatch || jobMatch || summaryMatch;
      });
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === "popularity") {
        return (b.popularity || 0) - (a.popularity || 0);
      }
      if (sortBy === "release_desc") {
        const dateA = a.releaseDate || a.releaseYear || "";
        const dateB = b.releaseDate || b.releaseYear || "";
        return dateB.localeCompare(dateA);
      }
      if (sortBy === "vote_average") {
        return (b.voteAverage || 0) - (a.voteAverage || 0);
      }
      return 0;
    });
  }, [
    activeTab,
    effectiveWorks,
    directingWorks,
    actingWorks,
    crewWorks,
    typeFilter,
    statusFilter,
    searchQuery,
    sortBy,
    myStatusMap,
  ]);

  const roleTitle = useMemo(() => {
    const isMainlyHost =
      works.filter(
        (w) =>
          w.characters?.some((c) => /host/i.test(c)) ||
          w.roleSummary.includes("Host") ||
          w.roleSummary.includes("Moderation")
      ).length >= 2;
    if (isMainlyHost) return "Host & Moderator:in";
    if (initialPerson.knownForDepartment === "Directing") return "Regisseur:in";
    if (initialPerson.knownForDepartment === "Writing") return "Drehbuchautor:in";
    if (initialPerson.knownForDepartment === "Production") return "Produzent:in";
    return "Schauspieler:in";
  }, [initialPerson.knownForDepartment, works]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 pb-24">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#07090e]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition group text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Zurück</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Erweiterte Suche</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
        {/* Person Header Card */}
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/80 border border-slate-800/80 p-6 sm:p-8 shadow-2xl overflow-hidden">
          {/* Subtle ambient background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
            {/* Profile Image */}
            <div className="w-32 h-44 sm:w-44 sm:h-60 rounded-2xl overflow-hidden bg-slate-800/90 border-2 border-amber-500/30 flex-shrink-0 relative shadow-xl mx-auto md:mx-0">
              {initialPerson.profilePath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${initialPerson.profilePath}`}
                  alt={initialPerson.name}
                  fill
                  sizes="(max-width: 768px) 176px, 240px"
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                  <User className="w-12 h-12 text-slate-700" />
                  <span className="text-xs">Kein Bild</span>
                </div>
              )}
            </div>

            {/* Info & Bio */}
            <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{roleTitle}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {initialPerson.name}
                </h1>
              </div>

              {/* Meta details */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-slate-400">
                {ageInfo && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400/80" />
                    <span>{ageInfo}</span>
                  </div>
                )}
                {initialPerson.placeOfBirth && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400/80" />
                    <span>{initialPerson.placeOfBirth}</span>
                  </div>
                )}
                {initialPerson.imdbId && (
                  <a
                    href={`https://www.imdb.com/name/${initialPerson.imdbId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs font-bold transition"
                  >
                    <span>IMDb</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Biography */}
              {initialPerson.biography ? (
                <div className="space-y-2 pt-1 text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Biografie
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {showFullBio
                      ? initialPerson.biography
                      : initialPerson.biography.slice(0, 340) +
                        (initialPerson.biography.length > 340 ? "..." : "")}
                  </p>
                  {initialPerson.biography.length > 340 && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition mt-1"
                    >
                      <span>{showFullBio ? "Weniger anzeigen" : "Ganze Biografie lesen"}</span>
                      {showFullBio ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic pt-1">
                  Keine Biografie auf Deutsch hinterlegt.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* WATCH TRACKER / COMPLETION STAT CARD ("Wie viel man gesehen hat") */}
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Dein Film-Tracker für {initialPerson.name}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Sieh auf einen Blick, wie viele der bekannten Werke du schon gesehen hast.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className={`text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 ${completionStats.tierColor}`}
              >
                {completionStats.tierLabel}
              </span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>
                  {completionStats.watched} von {completionStats.total} Werken gesehen
                </span>
              </span>
              <span className="text-amber-300 font-extrabold text-sm sm:text-base">
                {completionStats.percentage}%
              </span>
            </div>

            {/* Multi-segment Progress Bar */}
            <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-slate-800 shadow-inner">
              {/* Watched segment */}
              <div
                style={{ width: `${completionStats.percentage}%` }}
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                title={`${completionStats.watched} Gesehen (${completionStats.percentage}%)`}
              />
              {/* Watchlist segment */}
              {completionStats.total > 0 && completionStats.watchlist > 0 && (
                <div
                  style={{
                    width: `${Math.round(
                      (completionStats.watchlist / completionStats.total) * 100
                    )}%`,
                  }}
                  className="bg-amber-400/80 h-full rounded-full ml-0.5 transition-all duration-500"
                  title={`${completionStats.watchlist} auf deiner Merkliste`}
                />
              )}
            </div>
          </div>

          {/* Interactive Stat Chips (Click to filter list below) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`p-3 rounded-2xl border text-left transition ${
                statusFilter === "ALL"
                  ? "bg-slate-800 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                  : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40"
              }`}
            >
              <div className="text-[11px] text-slate-400 font-medium">Alle Werke</div>
              <div className="text-lg sm:text-xl font-extrabold text-white">
                {completionStats.total}
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "WATCHED" ? "ALL" : "WATCHED")}
              className={`p-3 rounded-2xl border text-left transition ${
                statusFilter === "WATCHED"
                  ? "bg-emerald-500/20 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                  : "bg-slate-950/60 border-slate-800/80 hover:bg-emerald-500/10"
              }`}
            >
              <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Gesehen
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-400">
                {completionStats.watched}
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "UNSEEN" ? "ALL" : "UNSEEN")}
              className={`p-3 rounded-2xl border text-left transition ${
                statusFilter === "UNSEEN"
                  ? "bg-cyan-500/20 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30"
                  : "bg-slate-950/60 border-slate-800/80 hover:bg-cyan-500/10"
              }`}
            >
              <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" /> Noch ungesehen
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-cyan-400">
                {completionStats.unseen}
              </div>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === "WATCHLIST" ? "ALL" : "WATCHLIST")}
              className={`p-3 rounded-2xl border text-left transition ${
                statusFilter === "WATCHLIST"
                  ? "bg-amber-500/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/30"
                  : "bg-slate-950/60 border-slate-800/80 hover:bg-amber-500/10"
              }`}
            >
              <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Auf Merkliste
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-amber-400">
                {completionStats.watchlist}
              </div>
            </button>
          </div>
        </div>

        {/* Filmography Section Header & Filters */}
        <div className="space-y-4 pt-2">
          {/* Deduplicated Role Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-black/20 font-mono">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Toggle: Show talkshows & interviews (default off) */}
            {talkShowsCount > 0 && (
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={showTalkShows}
                  onChange={(e) => setShowTalkShows(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Talkshows & Interviews einblenden (+{talkShowsCount})</span>
              </label>
            )}
          </div>

          {/* Filter Bar: Format, Status, Sort & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
            {/* Left: Format Filters (Alle, Filme, Serien) & Status Quick Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Format Pills */}
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => setTypeFilter("ALL")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    typeFilter === "ALL"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setTypeFilter(typeFilter === "movie" ? "ALL" : "movie")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    typeFilter === "movie"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Film className="w-3 h-3 text-amber-400" />
                  <span>Filme</span>
                </button>
                <button
                  onClick={() => setTypeFilter(typeFilter === "tv" ? "ALL" : "tv")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    typeFilter === "tv"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Tv className="w-3 h-3 text-cyan-400" />
                  <span>Serien</span>
                </button>
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    statusFilter === "ALL"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Alle Status
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === "WATCHED" ? "ALL" : "WATCHED")}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    statusFilter === "WATCHED"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-slate-400 hover:text-emerald-300"
                  }`}
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Gesehen</span>
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === "UNSEEN" ? "ALL" : "UNSEEN")}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    statusFilter === "UNSEEN"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-cyan-300"
                  }`}
                >
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Ungesehen</span>
                </button>
                <button
                  onClick={() => setStatusFilter(statusFilter === "WATCHLIST" ? "ALL" : "WATCHLIST")}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    statusFilter === "WATCHLIST"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "text-slate-400 hover:text-amber-300"
                  }`}
                >
                  <Plus className="w-3 h-3 text-amber-400" />
                  <span>Merkliste</span>
                </button>
              </div>

              {/* Reset Button if any filter active */}
              {(typeFilter !== "ALL" || statusFilter !== "ALL" || searchQuery.trim() || showTalkShows) && (
                <button
                  onClick={() => {
                    setTypeFilter("ALL");
                    setStatusFilter("ALL");
                    setSearchQuery("");
                    setShowTalkShows(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition"
                  title="Alle Filter zurücksetzen"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Zurücksetzen</span>
                </button>
              )}
            </div>

            {/* Right: Search & Sort */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search inside filmography */}
              <div className="relative flex-1 sm:w-48 md:w-56">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="In Filmografie suchen..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Filmografie sortieren"
                className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="popularity">Beliebteste</option>
                <option value="release_desc">Neueste zuerst</option>
                <option value="vote_average">Top TMDB-Bewertung</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filmography Results Grid */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
            <span>
              {displayCredits.length}{" "}
              {displayCredits.length === 1 ? "Eintrag" : "Einträge"} gefunden
              {statusFilter !== "ALL" && (
                <span className="text-amber-400 ml-1 font-semibold">
                  (gefiltert nach {statusFilter.toLowerCase()})
                </span>
              )}
            </span>
          </div>

          {displayCredits.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
              {displayCredits.map((item) => {
                const userStatus = myStatusMap.get(`${item.mediaType}-${item.id}`);
                const isWatched = userStatus?.status === "WATCHED";
                const isWatchlist = userStatus?.status === "WATCHLIST";
                const friendsWhoWatched = friendsWatchedMap.get(`${item.mediaType}-${item.id}`) || [];

                return (
                  <div
                    key={`${item.mediaType}-${item.id}`}
                    onClick={() => openMediaModal(item)}
                    className="group relative bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden cursor-pointer hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition duration-200 flex flex-col"
                  >
                    {/* Poster container */}
                    <div className="relative aspect-[2/3] w-full bg-slate-800 overflow-hidden">
                      {item.posterPath ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1 p-2 text-center">
                          <Film className="w-8 h-8 text-slate-700" />
                          <span className="text-[10px] text-slate-500">Kein Poster</span>
                        </div>
                      )}

                      {/* Format Badge (Film / Serie) */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        <span className="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-white/10 flex items-center gap-1">
                          {item.mediaType === "tv" ? (
                            <>
                              <Tv className="w-2.5 h-2.5 text-cyan-400" /> TV
                            </>
                          ) : (
                            <>
                              <Film className="w-2.5 h-2.5 text-amber-400" /> Film
                            </>
                          )}
                        </span>

                        {item.oscarInfo && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/80 text-black text-[9px] font-black flex items-center gap-0.5">
                            <Award className="w-2.5 h-2.5" /> Oscar
                          </span>
                        )}
                      </div>

                      {/* Rating Badge */}
                      {item.voteAverage > 0 && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-extrabold text-amber-400 border border-white/10 flex items-center gap-0.5 z-10">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          <span>{item.voteAverage.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Watched / Watchlist Indicator Overlay */}
                      {isWatched && (
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-emerald-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center justify-between z-10 shadow">
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" /> Gesehen
                          </span>
                          {userStatus.rating && (
                            <span className="text-amber-400 font-extrabold text-[10px]">
                              {userStatus.rating}★
                            </span>
                          )}
                        </div>
                      )}

                      {!isWatched && isWatchlist && (
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-amber-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 z-10 shadow">
                          <Check className="w-3 h-3" /> Auf Merkliste
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition line-clamp-2">
                          {item.title}
                        </h4>

                        {/* Deduplicated Role Summary */}
                        {item.roleSummary && (
                          <p
                            className={`text-[11px] mt-0.5 line-clamp-1 font-medium ${
                              item.isDirector
                                ? "text-amber-400/90"
                                : item.isActor
                                ? "text-slate-300 italic"
                                : "text-slate-400"
                            }`}
                          >
                            {item.roleSummary}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-1 border-t border-slate-800/60 text-[11px]">
                        <div className="flex items-center justify-between text-slate-500">
                          <span>{item.releaseYear || "—"}</span>

                          {/* Quick Action Buttons */}
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                openRatingModal({
                                  tmdbId: item.id,
                                  mediaType: item.mediaType,
                                  title: item.title,
                                  posterPath: item.posterPath,
                                  releaseYear: item.releaseYear,
                                })
                              }
                              title={isWatched ? "Bewertung ändern" : "Als gesehen markieren"}
                              className={`p-1 rounded-md transition ${
                                isWatched
                                  ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                updateMediaStatus({
                                  tmdbId: item.id,
                                  mediaType: item.mediaType,
                                  title: item.title,
                                  posterPath: item.posterPath,
                                  releaseYear: item.releaseYear,
                                  status: isWatchlist ? "NONE" : "WATCHLIST",
                                })
                              }
                              title={
                                isWatchlist
                                  ? "Von Merkliste entfernen"
                                  : "Auf Merkliste speichern"
                              }
                              className={`p-1 rounded-md transition ${
                                isWatchlist
                                  ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Friends activity badge */}
                        {friendsWhoWatched.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 truncate">
                            <Users className="w-2.5 h-2.5 flex-shrink-0 text-cyan-400" />
                            <span className="truncate">
                              {friendsWhoWatched.length}{" "}
                              {friendsWhoWatched.length === 1
                                ? "Freund hat"
                                : "Freunde haben"}{" "}
                              ihn gesehen
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
              <Film className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">
                Keine passenden Werke gefunden
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Passe die Filter oder den Suchbegriff an, um alle Filme und Serien von{" "}
                {initialPerson.name} zu sehen.
              </p>
              <button
                onClick={() => {
                  setStatusFilter("ALL");
                  setTypeFilter("ALL");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 transition"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
