"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MediaItem } from "@/lib/tmdb";
import { MediaModal } from "./MediaModal";
import { SearchModal } from "./SearchModal";
import { SubscriptionModal } from "./SubscriptionModal";
import { AppMediaStatus, AppRecommendation } from "@/lib/store";
import { useSession } from "next-auth/react";

interface MediaContextType {
  openMediaModal: (item: { id: number; mediaType: "movie" | "tv"; title?: string; posterPath?: string | null }) => void;
  closeMediaModal: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openSubscriptions: () => void;
  userSubscriptions: string[];
  setUserSubscriptions: (subs: string[]) => void;
  onlyMySubs: boolean;
  setOnlyMySubs: (val: boolean) => void;
  toggleOnlyMySubs: () => void;
  communityData: {
    mediaStatuses: AppMediaStatus[];
    recommendations: AppRecommendation[];
    friends: any[];
  };
  refreshCommunity: () => Promise<void>;
  updateMediaStatus: (params: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
    releaseYear?: string | null;
    status: "WATCHED" | "WATCHLIST" | "NONE";
    rating?: number | null;
  }) => Promise<void>;
  submitRecommendation: (params: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    releaseYear?: string | null;
    rating: number;
    comment: string;
    tags: string[];
  }) => Promise<void>;
  upvoteRecommendation: (recommendationId: string) => Promise<void>;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; mediaType: "movie" | "tv"; title?: string; posterPath?: string | null } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubsOpen, setIsSubsOpen] = useState(false);
  const [userSubscriptions, setUserSubscriptionsState] = useState<string[]>(["netflix", "prime", "disney"]);
  const [onlyMySubs, setOnlyMySubsState] = useState<boolean>(true);
  const [communityData, setCommunityData] = useState<{
    mediaStatuses: AppMediaStatus[];
    recommendations: AppRecommendation[];
    friends: any[];
  }>({
    mediaStatuses: [],
    recommendations: [],
    friends: [],
  });

  // Load subscriptions & onlyMySubs filter from localStorage on start
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cinecircle_subs");
      if (saved) {
        setUserSubscriptionsState(JSON.parse(saved));
      }
      const savedFilter = localStorage.getItem("cinecircle_only_my_subs");
      if (savedFilter !== null) {
        setOnlyMySubsState(savedFilter === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const setOnlyMySubs = (val: boolean) => {
    setOnlyMySubsState(val);
    try {
      localStorage.setItem("cinecircle_only_my_subs", String(val));
    } catch {
      // ignore
    }
  };

  const toggleOnlyMySubs = () => {
    setOnlyMySubs(!onlyMySubs);
  };

  const refreshCommunity = async () => {
    try {
      const res = await fetch("/api/community");
      if (res.ok) {
        const data = await res.json();
        setCommunityData(data);
      }
    } catch (err) {
      console.error("Failed to fetch community data:", err);
    }
  };

  useEffect(() => {
    refreshCommunity();
  }, [session]);

  const setUserSubscriptions = (subs: string[]) => {
    setUserSubscriptionsState(subs);
    try {
      localStorage.setItem("cinecircle_subs", JSON.stringify(subs));
    } catch {
      // ignore
    }
    if (session?.user) {
      fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscriptions", subscriptions: subs }),
      }).catch(console.error);
    }
  };

  const updateMediaStatus = async (params: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
    releaseYear?: string | null;
    status: "WATCHED" | "WATCHLIST" | "NONE";
    rating?: number | null;
  }) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", ...params }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommunityData(data);
      }
    } catch (err) {
      console.error("Error updating media status:", err);
    }
  };

  const submitRecommendation = async (params: {
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath?: string | null;
    backdropPath?: string | null;
    releaseYear?: string | null;
    rating: number;
    comment: string;
    tags: string[];
  }) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recommend", ...params }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommunityData(data);
      }
    } catch (err) {
      console.error("Error submitting recommendation:", err);
    }
  };

  const upvoteRecommendation = async (recommendationId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upvote", recommendationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommunityData(data);
      }
    } catch (err) {
      console.error("Error upvoting:", err);
    }
  };

  return (
    <MediaContext.Provider
      value={{
        openMediaModal: (item) => setSelectedMedia(item),
        closeMediaModal: () => setSelectedMedia(null),
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        openSubscriptions: () => setIsSubsOpen(true),
        userSubscriptions,
        setUserSubscriptions,
        onlyMySubs,
        setOnlyMySubs,
        toggleOnlyMySubs,
        communityData,
        refreshCommunity,
        updateMediaStatus,
        submitRecommendation,
        upvoteRecommendation,
      }}
    >
      {children}

      {selectedMedia && (
        <MediaModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMedia={(item) => setSelectedMedia(item)}
      />

      <SubscriptionModal
        isOpen={isSubsOpen}
        onClose={() => setIsSubsOpen(false)}
        selectedSubscriptions={userSubscriptions}
        onSave={setUserSubscriptions}
      />
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error("useMedia must be used within MediaProvider");
  }
  return ctx;
}
