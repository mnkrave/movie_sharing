"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useMedia } from "@/components/MediaContext";
import { MediaItem } from "@/lib/tmdb";
import {
  Upload,
  ExternalLink,
  Check,
  Sparkles,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
} from "lucide-react";

interface ParsedCsvEntry {
  queryTitle: string;
  year?: string;
  mediaTypeHint?: "movie" | "tv";
  rating?: number;
  watchedSeasons?: number[];
  watchCount: number;
}

interface MatchedCandidate {
  item: MediaItem;
  sourceTitle: string;
  rating?: number;
  watchedSeasons?: number[];
  watchCount: number;
  selected: boolean;
}

function splitCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses Netflix Viewing History CSV, IMDb Ratings/Watchlist CSV, or Letterboxd CSV
 * and deduplicates TV episodes into clean series titles + season arrays.
 */
function parseWatchHistoryCsv(text: string): {
  sourceName: string;
  entries: ParsedCsvEntry[];
  rawRowCount: number;
} {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { sourceName: "CSV", entries: [], rawRowCount: 0 };
  }

  const headerCols = splitCsvRow(lines[0]).map((c) => c.toLowerCase().replace(/^"|"$/g, ""));
  const titleIdx = headerCols.findIndex((c) => c === "title" || c === "name" || c === "titel");
  const yearIdx = headerCols.findIndex((c) => c === "year" || c === "jahr");
  const ratingIdx = headerCols.findIndex(
    (c) => c === "your rating" || c === "rating" || c === "bewertung"
  );
  const typeIdx = headerCols.findIndex((c) => c === "title type" || c === "type");

  const isImdb = headerCols.includes("const") || headerCols.includes("your rating");
  const isLetterboxd = headerCols.includes("letterboxd uri") || (headerCols.includes("name") && headerCols.includes("year"));
  const sourceName = isImdb ? "IMDb" : isLetterboxd ? "Letterboxd" : "Netflix";

  const aggregated = new Map<string, ParsedCsvEntry>();
  let rawRowCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvRow(lines[i]);
    const rawTitle = (cols[titleIdx >= 0 ? titleIdx : 0] || "").replace(/^"|"$/g, "").trim();
    if (!rawTitle) continue;
    rawRowCount++;

    let baseTitle = rawTitle;
    let mediaTypeHint: "movie" | "tv" | undefined = undefined;
    let detectedSeason: number | undefined = undefined;

    // Detect Netflix Series Format: "Show Name: Staffel 2: Episode" or "Show Name: Season 1: ..."
    const seasonMatch = rawTitle.match(
      /^(.+?):\s*(?:Staffel|Season|Teil|Part|Volume|Buch|Book)\s*(\d+)\b/i
    );
    const miniseriesMatch = rawTitle.match(
      /^(.+?):\s*(?:Miniserie|Limited Series| Miniseries|Folge\s*\d+|Episode\s*\d+|Kapitel\s*\d+|Chapter\s*\d+)/i
    );

    if (seasonMatch) {
      baseTitle = seasonMatch[1].trim();
      mediaTypeHint = "tv";
      detectedSeason = parseInt(seasonMatch[2], 10);
    } else if (miniseriesMatch) {
      baseTitle = miniseriesMatch[1].trim();
      mediaTypeHint = "tv";
      detectedSeason = 1;
    } else if (rawTitle.includes(":")) {
      // Check if another row in Netflix CSV starts with the same prefix before the first colon
      const firstColonParts = rawTitle.split(":");
      if (
        firstColonParts.length >= 3 &&
        firstColonParts[0].trim().length >= 3
      ) {
        baseTitle = firstColonParts[0].trim();
        mediaTypeHint = "tv";
      }
    }

    if (typeIdx >= 0 && cols[typeIdx]) {
      const tVal = cols[typeIdx].toLowerCase();
      if (tVal.includes("tv") || tVal.includes("series") || tVal.includes("episode")) {
        mediaTypeHint = "tv";
      } else if (tVal.includes("movie") || tVal.includes("film")) {
        mediaTypeHint = "movie";
      }
    }

    const yearVal = yearIdx >= 0 && cols[yearIdx] ? cols[yearIdx].slice(0, 4) : undefined;
    let parsedRating: number | undefined = undefined;
    if (ratingIdx >= 0 && cols[ratingIdx]) {
      const rFloat = parseFloat(cols[ratingIdx]);
      if (!isNaN(rFloat) && rFloat > 0) {
        // Letterboxd uses 0.5 - 5.0 stars; convert to 1-10 scale if <= 5 and source is Letterboxd
        parsedRating =
          isLetterboxd && rFloat <= 5
            ? Math.min(10, Math.max(1, Math.round(rFloat * 2)))
            : Math.min(10, Math.max(1, Math.round(rFloat)));
      }
    }

    const normKey = `${baseTitle.toLowerCase()}_${yearVal || ""}`;
    const existing = aggregated.get(normKey);
    if (!existing) {
      aggregated.set(normKey, {
        queryTitle: baseTitle,
        year: yearVal,
        mediaTypeHint,
        rating: parsedRating,
        watchedSeasons: detectedSeason ? [detectedSeason] : undefined,
        watchCount: 1,
      });
    } else {
      existing.watchCount += 1;
      if (mediaTypeHint === "tv") existing.mediaTypeHint = "tv";
      if (!existing.rating && parsedRating) existing.rating = parsedRating;
      if (detectedSeason) {
        const sSet = new Set([...(existing.watchedSeasons || []), detectedSeason]);
        existing.watchedSeasons = Array.from(sSet).sort((a, b) => a - b);
      }
    }
  }

  return {
    sourceName,
    entries: Array.from(aggregated.values()),
    rawRowCount,
  };
}

export function StreamingHistoryImporter() {
  const { data: session } = useSession();
  const { communityData, refreshCommunity, openMediaModal, showToast } = useMedia();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [importMeta, setImportMeta] = useState<{ source: string; count: number } | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sourceLabel, setSourceLabel] = useState<string>("Netflix");
  const [rawRowCount, setRawRowCount] = useState(0);
  const [candidates, setCandidates] = useState<MatchedCandidate[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = (session?.user as any)?.id || session?.user?.email || "default";
  const storageKey = `cinecircle_csv_import_done_v1_${userId}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setImportMeta({
            source: String(parsed.source || "Netflix"),
            count: Number(parsed.count || 0),
          });
          setIsMinimized(true);
        }
      }
    } catch {}
  }, [storageKey]);

  const markImportCompleted = (source: string, count: number) => {
    const meta = { source, count };
    setImportMeta(meta);
    setIsMinimized(true);
    try {
      localStorage.setItem(storageKey, JSON.stringify({ ...meta, importedAt: Date.now() }));
    } catch {}
  };

  const existingWatchedSet = new Set(
    communityData.mediaStatuses
      .filter((m) => m.status === "WATCHED")
      .map((m) => `${m.mediaType}_${m.tmdbId}`)
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseWatchHistoryCsv(text);
      if (parsed.entries.length === 0) {
        showToast("Keine gültigen Film- oder Serientitel in der CSV gefunden.", { type: "error" });
        return;
      }

      setSourceLabel(parsed.sourceName);
      setRawRowCount(parsed.rawRowCount);
      setIsMatching(true);
      setIsOpen(true);

      const res = await fetch("/api/tmdb/batch-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: parsed.entries.slice(0, 120) }),
      });

      const data = await res.json();
      if (!res.ok || !Array.isArray(data.matches)) {
        showToast(data.error || "Fehler beim Abgleichen der CSV-Datei.", { type: "error" });
        setIsMatching(false);
        return;
      }

      const freshMatches: MatchedCandidate[] = data.matches
        .filter((m: any) => !existingWatchedSet.has(`${m.item.mediaType}_${m.item.id}`))
        .map((m: any) => ({
          ...m,
          selected: true,
        }));

      setCandidates(freshMatches);
      if (freshMatches.length === 0) {
        showToast("Alle erkannten Titel aus dieser Datei sind bereits in deiner Liste!", {
          type: "info",
        });
        markImportCompleted(parsed.sourceName, importMeta?.count || 0);
        setIsOpen(false);
      } else {
        setIsMinimized(false);
      }
    } catch (err) {
      console.error("CSV import error:", err);
      showToast("Datei konnte nicht gelesen werden.", { type: "error" });
    } finally {
      setIsMatching(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setCandidateRating = (idx: number, rating: number | undefined) => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, rating, selected: true } : c))
    );
  };

  const toggleCandidateSelected = (idx: number) => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c))
    );
  };

  const selectedCandidates = candidates.filter((c) => c.selected);

  const handleBulkSave = async () => {
    if (selectedCandidates.length === 0) return;
    setIsSaving(true);
    try {
      const payload = selectedCandidates.map((c) => ({
        tmdbId: c.item.id,
        mediaType: c.item.mediaType,
        title: c.item.title,
        posterPath: c.item.posterPath,
        releaseYear: c.item.releaseYear,
        rating: c.rating,
        watchedSeasons: c.watchedSeasons,
      }));

      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_import_statuses", items: payload }),
      });

      if (res.ok) {
        await refreshCommunity();
        showToast(
          `${selectedCandidates.length} Titel aus ${sourceLabel} erfolgreich in dein Profil importiert!`,
          { type: "success" }
        );
        markImportCompleted(sourceLabel, selectedCandidates.length);
        setCandidates([]);
        setIsOpen(false);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || "Bitte logge dich ein, um den Import zu speichern.", {
          type: "error",
        });
      }
    } catch {
      showToast("Netzwerkfehler beim Speichern des Imports.", { type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const hiddenFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv,text/csv"
      onChange={handleFileChange}
      className="hidden"
    />
  );

  // Subtle single-line compact bar once the user has already completed an import (or minimized it)
  if (isMinimized && !isOpen && !isMatching && candidates.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs">
        {hiddenFileInput}
        <div className="flex items-center gap-2 text-slate-400">
          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>
            {importMeta && importMeta.count > 0 ? (
              <>
                <strong className="text-slate-200">{importMeta.source}-Verlauf</strong>{" "}
                importiert ({importMeta.count} Titel)
              </>
            ) : (
              <span>
                <strong className="text-slate-200">Netflix / IMDb / Letterboxd</strong> CSV-Import
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700/80 transition cursor-pointer"
          >
            <Upload className="w-3 h-3 text-rose-400" />
            <span>Erneut importieren</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMinimized(false);
              setIsOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition cursor-pointer"
          >
            Anleitung
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-rose-950/35 via-slate-900/90 to-[#0b101d] border border-rose-500/30 shadow-xl overflow-hidden">
      {/* Top Bar / Trigger */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                Netflix, IMDb oder Letterboxd Verlauf importieren
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                1-Klick CSV
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Lade deinen bisherigen Streaming-Verlauf hoch – Serien-Folgen werden automatisch zu
              Serien & Staffeln gebündelt und mit TMDB abgeglichen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
          {hiddenFileInput}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isMatching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-rose-500/20 transition cursor-pointer"
          >
            {isMatching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Abgleich läuft...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>CSV-Datei auswählen</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition cursor-pointer"
          >
            <span>Anleitung</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsMinimized(true);
            }}
            title="Import-Banner einklappen"
            className="px-2.5 py-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step-by-Step Guide & Matched Preview */}
      {isOpen && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-slate-800/80 space-y-5 animate-in fade-in duration-200">
          {/* 3-Step Guide with Direct Link to Netflix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-400">1. Netflix Verlauf öffnen</span>
                <a
                  href="https://www.netflix.com/viewingactivity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[11px] font-bold transition"
                >
                  <span>Zu Netflix</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Öffne direkt{" "}
                <a
                  href="https://www.netflix.com/viewingactivity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-300 underline hover:text-rose-200"
                >
                  netflix.com/viewingactivity
                </a>{" "}
                in deinem Browser (ggf. kurz in dein Netflix-Profil wechseln).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
              <span className="text-xs font-black text-amber-400">
                2. „Alle herunterladen“ klicken
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Scrolle auf der Netflix-Seite nach ganz unten und klicke unten rechts auf{" "}
                <strong className="text-slate-200">„Alle herunterladen“</strong>. Du erhältst sofort
                die Datei <code className="text-amber-300">NetflixViewingHistory.csv</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-1.5">
              <span className="text-xs font-black text-emerald-400">
                3. Hier hochladen & bewerten
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Wähle die CSV-Datei oben aus (funktioniert auch mit{" "}
                <strong className="text-slate-200">IMDb Ratings CSV</strong> &{" "}
                <strong className="text-slate-200">Letterboxd CSV</strong>). Du kannst vor dem
                Speichern direkt Sterne (1–10 ★) vergeben!
              </p>
            </div>
          </div>

          {/* Matching Loading State */}
          {isMatching && (
            <div className="p-8 rounded-2xl bg-slate-950/90 border border-slate-800 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
              <p className="text-sm font-bold text-white">
                Analysiere {rawRowCount} Einträge aus deinem {sourceLabel}-Verlauf und gleiche sie
                mit TMDB ab...
              </p>
              <p className="text-xs text-slate-400">
                Serien-Episoden werden automatisch zu kompletten Serien & Staffeln zusammengefasst.
              </p>
            </div>
          )}

          {/* Matched Results List */}
          {!isMatching && candidates.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <p className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>
                      {candidates.length} neue Filme & Serien aus {sourceLabel} erkannt!
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Wähle optional direkt deine Bewertung (1–10 ★) oder klicke rechts auf „Alle
                    Ausgewählten importieren“.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCandidates([])}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold border border-slate-800 transition cursor-pointer"
                  >
                    Verwerfen
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkSave}
                    disabled={isSaving || selectedCandidates.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Speichere...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>
                          {selectedCandidates.length} Titel als Gesehen importieren
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {candidates.map((cand, idx) => (
                  <div
                    key={`${cand.item.mediaType}_${cand.item.id}`}
                    className={`p-2.5 rounded-2xl border transition flex items-center gap-3 ${
                      cand.selected
                        ? "bg-slate-950/90 border-slate-800"
                        : "bg-slate-950/30 border-slate-900 opacity-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleCandidateSelected(idx)}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border flex-shrink-0 cursor-pointer ${
                        cand.selected
                          ? "bg-emerald-500 border-emerald-400 text-black"
                          : "bg-slate-900 border-slate-700 text-transparent"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    {/* Poster thumbnail (click opens details/trailer) */}
                    <div
                      onClick={() =>
                        openMediaModal({
                          id: cand.item.id,
                          mediaType: cand.item.mediaType,
                          title: cand.item.title,
                          posterPath: cand.item.posterPath,
                          genreIds: cand.item.genreIds,
                        })
                      }
                      className="relative w-10 h-14 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 cursor-pointer border border-slate-800"
                    >
                      {cand.item.posterPath && (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${cand.item.posterPath}`}
                          alt={cand.item.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Title & Season info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            cand.item.mediaType === "tv"
                              ? "bg-cyan-500/15 text-cyan-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {cand.item.mediaType === "tv" ? "Serie" : "Film"}
                        </span>
                        <span className="text-[11px] text-slate-400">{cand.item.releaseYear}</span>
                        {cand.watchedSeasons && cand.watchedSeasons.length > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400">
                            • Staffel {cand.watchedSeasons.join(", ")}
                          </span>
                        )}
                      </div>
                      <p
                        onClick={() =>
                          openMediaModal({
                            id: cand.item.id,
                            mediaType: cand.item.mediaType,
                            title: cand.item.title,
                            posterPath: cand.item.posterPath,
                            genreIds: cand.item.genreIds,
                          })
                        }
                        className="text-xs font-bold text-white truncate hover:text-amber-400 cursor-pointer"
                      >
                        {cand.item.title}
                      </p>

                      {/* Compact 1-10 Star Quick Selector */}
                      <div className="flex items-center gap-0.5 mt-1 flex-wrap">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() =>
                              setCandidateRating(idx, cand.rating === score ? undefined : score)
                            }
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                              cand.rating === score
                                ? "bg-amber-500 text-black"
                                : "bg-slate-900 hover:bg-slate-800 text-slate-400"
                            }`}
                          >
                            {score}★
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openMediaModal({
                          id: cand.item.id,
                          mediaType: cand.item.mediaType,
                          title: cand.item.title,
                          posterPath: cand.item.posterPath,
                          genreIds: cand.item.genreIds,
                        })
                      }
                      title="Details & Trailer ansehen"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
