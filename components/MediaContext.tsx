"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MediaItem } from "@/lib/tmdb";
import { MediaModal } from "./MediaModal";
import { SearchModal } from "./SearchModal";
import { SubscriptionModal } from "./SubscriptionModal";
import { QuickRatingModal, RatingTarget } from "./QuickRatingModal";
import { AppMediaStatus, AppRecommendation } from "@/lib/store";
import { useSession } from "next-auth/react";

export interface FriendGroup {
  id: string;
  name: string;
  emoji: string;
  memberNames: string[];
}

const DEFAULT_FRIEND_GROUPS: FriendGroup[] = [
  {
    id: "grp_wg_couch",
    name: "WG-Couch",
    emoji: "🛋️",
    memberNames: ["Lukas", "Max", "Sarah"],
  },
  {
    id: "grp_kino_nerds",
    name: "Kino-Nerds",
    emoji: "🍿",
    memberNames: ["Lukas", "Max"],
  },
  {
    id: "grp_date_night",
    name: "Date Night",
    emoji: "✨",
    memberNames: ["Lukas", "Sarah"],
  },
];

interface MediaContextType {
  openMediaModal: (item: {
    id: number;
    mediaType: "movie" | "tv";
    title?: string;
    posterPath?: string | null;
    genreIds?: number[];
  }) => void;
  closeMediaModal: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openSubscriptions: () => void;
  userSubscriptions: string[];
  setUserSubscriptions: (subs: string[]) => void;
  onlyMySubs: boolean;
  setOnlyMySubs: (val: boolean) => void;
  toggleOnlyMySubs: () => void;
  openRatingModal: (target: RatingTarget) => void;
  friendGroups: FriendGroup[];
  addFriendGroup: (name: string, emoji: string, memberNames: string[]) => void;
  deleteFriendGroup: (id: string) => void;
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
  const [selectedMedia, setSelectedMedia] = useState<{
    id: number;
    mediaType: "movie" | "tv";
    title?: string;
    posterPath?: string | null;
    genreIds?: number[];
  } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubsOpen, setIsSubsOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<RatingTarget | null>(null);
  const [userSubscriptions, setUserSubscriptionsState] = useState<string[]>(["netflix", "prime", "disney"]);
  const [onlyMySubs, setOnlyMySubsState] = useState<boolean>(true);
  const [friendGroups, setFriendGroupsState] = useState<FriendGroup[]>(DEFAULT_FRIEND_GROUPS);
  const [communityData, setCommunityData] = useState<{
    mediaStatuses: AppMediaStatus[];
    recommendations: AppRecommendation[];
    friends: any[];
  }>({
    mediaStatuses: [],
    recommendations: [],
    friends: [],
  });

  // Load subscriptions, onlyMySubs & friendGroups from localStorage on start
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
      const savedGroups = localStorage.getItem("cinecircle_friend_groups");
      if (savedGroups) {
        const parsed = JSON.parse(savedGroups);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFriendGroupsState(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const addFriendGroup = (name: string, emoji: string, memberNames: string[]) => {
    if (!name.trim() || memberNames.length === 0) return;
    const newGroup: FriendGroup = {
      id: `grp_${Date.now()}`,
      name: name.trim(),
      emoji: emoji || "🍿",
      memberNames,
    };
    const updated = [...friendGroups, newGroup];
    setFriendGroupsState(updated);
    try {
      localStorage.setItem("cinecircle_friend_groups", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const deleteFriendGroup = (id: string) => {
    const updated = friendGroups.filter((g) => g.id !== id);
    setFriendGroupsState(updated);
    try {
      localStorage.setItem("cinecircle_friend_groups", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

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

  const handleSaveRating = async (rating?: number) => {
    if (!ratingTarget) return;
    await updateMediaStatus({
      tmdbId: ratingTarget.tmdbId,
      mediaType: ratingTarget.mediaType,
      title: ratingTarget.title,
      posterPath: ratingTarget.posterPath,
      releaseYear: ratingTarget.releaseYear,
      status: "WATCHED",
      rating,
    });
    setRatingTarget(null);
  };

  const handleRemoveWatched = async () => {
    if (!ratingTarget) return;
    await updateMediaStatus({
      tmdbId: ratingTarget.tmdbId,
      mediaType: ratingTarget.mediaType,
      title: ratingTarget.title,
      status: "NONE",
    });
    setRatingTarget(null);
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
        openRatingModal: (target) => setRatingTarget(target),
        friendGroups,
        addFriendGroup,
        deleteFriendGroup,
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

      <QuickRatingModal
        target={ratingTarget}
        onClose={() => setRatingTarget(null)}
        onSaveRating={handleSaveRating}
        onRemoveWatched={handleRemoveWatched}
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
