"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MediaItem } from "@/lib/tmdb";
import { MediaModal } from "./MediaModal";
import { SearchModal } from "./SearchModal";
import { SubscriptionModal } from "./SubscriptionModal";
import { QuickRatingModal, RatingTarget } from "./QuickRatingModal";
import { AvatarPickerModal } from "./AvatarPickerModal";
import { AppMediaStatus, AppRecommendation } from "@/lib/store";
import { useSession } from "next-auth/react";

export interface FriendRequestItem {
  requestId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  createdAt: string;
}

export interface FriendGroup {
  id: string;
  name: string;
  emoji: string;
  memberNames: string[];
}

const LEGACY_DEFAULT_GROUP_IDS = ["grp_wg_couch", "grp_kino_nerds", "grp_date_night"];

interface MediaContextType {
  openMediaModal: (item: {
    id: number;
    mediaType: "movie" | "tv";
    title?: string;
    posterPath?: string | null;
    genreIds?: number[];
  }) => void;
  closeMediaModal: () => void;
  openSearch: (mode?: "quick" | "extended" | any) => void;
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
  updateFriendGroup: (id: string, name: string, emoji: string, memberNames: string[]) => void;
  deleteFriendGroup: (id: string) => void;
  communityData: {
    mediaStatuses: AppMediaStatus[];
    recommendations: AppRecommendation[];
    friends: any[];
    friendRequests: {
      pendingReceived: FriendRequestItem[];
      pendingSent: FriendRequestItem[];
    };
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
  sendFriendRequest: (target: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  acceptFriendRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  declineFriendRequest: (requestId: string) => Promise<{ success: boolean; error?: string }>;
  removeFriend: (friendUserId: string) => Promise<{ success: boolean; error?: string }>;
  searchUsers: (query: string) => Promise<any[]>;
  openAvatarPicker: () => void;
  closeAvatarPicker: () => void;
  currentUserAvatar: string | null;
  updateUserAvatar: (avatarUrl: string | null) => Promise<void>;
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
  const [searchInitialMode, setSearchInitialMode] = useState<"quick" | "extended">("quick");
  const [isSubsOpen, setIsSubsOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [ratingTarget, setRatingTarget] = useState<RatingTarget | null>(null);
  const [userSubscriptions, setUserSubscriptionsState] = useState<string[]>(["netflix", "prime", "disney"]);
  const [onlyMySubs, setOnlyMySubsState] = useState<boolean>(true);
  const [friendGroups, setFriendGroupsState] = useState<FriendGroup[]>([]);
  const [communityData, setCommunityData] = useState<{
    mediaStatuses: AppMediaStatus[];
    recommendations: AppRecommendation[];
    friends: any[];
    friendRequests: {
      pendingReceived: FriendRequestItem[];
      pendingSent: FriendRequestItem[];
    };
  }>({
    mediaStatuses: [],
    recommendations: [],
    friends: [],
    friendRequests: {
      pendingReceived: [],
      pendingSent: [],
    },
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
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(
            (g: FriendGroup) => !LEGACY_DEFAULT_GROUP_IDS.includes(g.id)
          );
          setFriendGroupsState(cleaned);
          localStorage.setItem("cinecircle_friend_groups", JSON.stringify(cleaned));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Normalize user aliases in friendGroups whenever session user name is loaded
  useEffect(() => {
    const currentName = session?.user?.name;
    if (!currentName) return;

    setFriendGroupsState((prev) => {
      let changed = false;
      const updated = prev.map((g) => {
        const normalized = g.memberNames.map((m) => {
          const a = m.toLowerCase().trim();
          const b = currentName.toLowerCase().trim();
          const aParts = a.split(/\s+/);
          const bParts = b.split(/\s+/);
          const isSame =
            a === b ||
            (aParts[0] === bParts[0] && (aParts.length === 1 || bParts.length === 1)) ||
            a.startsWith(b) ||
            b.startsWith(a);

          if (isSame && m !== currentName) {
            changed = true;
            return currentName;
          }
          return m;
        });

        // Deduplicate
        const deduped: string[] = [];
        for (const n of normalized) {
          if (!deduped.some((d) => d.toLowerCase() === n.toLowerCase())) {
            deduped.push(n);
          } else {
            changed = true;
          }
        }

        if (changed) {
          return { ...g, memberNames: deduped };
        }
        return g;
      });

      if (changed) {
        try {
          localStorage.setItem("cinecircle_friend_groups", JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
      return prev;
    });
  }, [session?.user?.name]);

  const sanitizeMemberNames = (names: string[]): string[] => {
    const currentName = session?.user?.name;
    const clean: string[] = [];
    for (const raw of names) {
      const trimmed = (raw || "").trim().replace(/^@/, "");
      if (!trimmed) continue;
      let finalName = trimmed;
      if (currentName) {
        const a = trimmed.toLowerCase();
        const b = currentName.toLowerCase();
        const aParts = a.split(/\s+/);
        const bParts = b.split(/\s+/);
        if (
          a === b ||
          (aParts[0] === bParts[0] && (aParts.length === 1 || bParts.length === 1)) ||
          a.startsWith(b) ||
          b.startsWith(a)
        ) {
          finalName = currentName;
        }
      }
      if (!clean.some((existing) => existing.toLowerCase() === finalName.toLowerCase())) {
        clean.push(finalName);
      }
    }
    return clean;
  };

  const addFriendGroup = (name: string, emoji: string, memberNames: string[]) => {
    const cleanMembers = sanitizeMemberNames(memberNames);
    if (!name.trim() || cleanMembers.length === 0) return;
    const newGroup: FriendGroup = {
      id: `grp_${Date.now()}`,
      name: name.trim(),
      emoji: emoji || "🍿",
      memberNames: cleanMembers,
    };
    const updated = [...friendGroups, newGroup];
    setFriendGroupsState(updated);
    try {
      localStorage.setItem("cinecircle_friend_groups", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const updateFriendGroup = (id: string, name: string, emoji: string, memberNames: string[]) => {
    const cleanMembers = sanitizeMemberNames(memberNames);
    if (!name.trim() || cleanMembers.length === 0) return;
    const updated = friendGroups.map((g) =>
      g.id === id
        ? { ...g, name: name.trim(), emoji: emoji || "🍿", memberNames: cleanMembers }
        : g
    );
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
    const myUserId = (session?.user as any)?.id || "user_lukas";
    const myName = session?.user?.name || "Lukas Reinle";
    const myImage = session?.user?.image || null;

    // Snapshot for rollback in case of error
    const previousStatuses = communityData.mediaStatuses;

    // 1. Optimistic Instant UI Update (0 ms latency)
    setCommunityData((prev) => {
      const matchIndex = prev.mediaStatuses.findIndex(
        (m) =>
          m.tmdbId === params.tmdbId &&
          m.mediaType === params.mediaType &&
          (m.userId === myUserId || (myName && m.userName?.toLowerCase() === myName.toLowerCase()))
      );

      let nextStatuses = [...prev.mediaStatuses];

      if (params.status === "NONE") {
        if (matchIndex >= 0) {
          nextStatuses.splice(matchIndex, 1);
        }
      } else if (matchIndex >= 0) {
        nextStatuses[matchIndex] = {
          ...nextStatuses[matchIndex],
          status: params.status,
          rating: params.rating !== undefined ? params.rating : nextStatuses[matchIndex].rating,
          updatedAt: new Date().toISOString(),
        };
      } else {
        nextStatuses.push({
          id: `opt_${Date.now()}`,
          userId: myUserId,
          userName: myName,
          userImage: myImage,
          tmdbId: params.tmdbId,
          mediaType: params.mediaType,
          title: params.title,
          posterPath: params.posterPath || null,
          releaseYear: params.releaseYear || null,
          status: params.status,
          rating: params.rating ?? null,
          updatedAt: new Date().toISOString(),
        });
      }

      return {
        ...prev,
        mediaStatuses: nextStatuses,
      };
    });

    // 2. Perform server request in background
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", ...params }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommunityData(data);
      } else {
        // Rollback
        setCommunityData((prev) => ({ ...prev, mediaStatuses: previousStatuses }));
      }
    } catch (err) {
      console.error("Error updating media status:", err);
      // Rollback
      setCommunityData((prev) => ({ ...prev, mediaStatuses: previousStatuses }));
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

  const sendFriendRequest = async (target: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "friend_request", target }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Fehler beim Senden der Anfrage." };
      }
      setCommunityData(data);
      return { success: true, message: data.actionMessage || "Anfrage gesendet!" };
    } catch {
      return { success: false, error: "Netzwerkfehler." };
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_friend", requestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Fehler beim Annehmen." };
      }
      setCommunityData(data);
      return { success: true };
    } catch {
      return { success: false, error: "Netzwerkfehler." };
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline_friend", requestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Fehler beim Ablehnen." };
      }
      setCommunityData(data);
      return { success: true };
    } catch {
      return { success: false, error: "Netzwerkfehler." };
    }
  };

  const removeFriend = async (friendUserId: string) => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove_friend", friendUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Fehler beim Entfernen." };
      }
      setCommunityData(data);
      return { success: true };
    } catch {
      return { success: false, error: "Netzwerkfehler." };
    }
  };

  const searchUsers = async (query: string): Promise<any[]> => {
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search_users", query }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.users || [];
      }
      return [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (session?.user?.image) {
      setCurrentUserAvatar(session.user.image);
    } else if (session?.user?.email) {
      const me = communityData.friends.find(
        (f) => f.email?.toLowerCase() === session.user?.email?.toLowerCase()
      );
      if (me?.image) {
        setCurrentUserAvatar(me.image);
      }
    }
  }, [session?.user?.image, session?.user?.email, communityData.friends]);

  const updateUserAvatar = async (avatarUrl: string | null) => {
    setCurrentUserAvatar(avatarUrl);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "avatar", image: avatarUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setCommunityData(data);
      }
    } catch (err) {
      console.error("Error updating avatar:", err);
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
        openSearch: (mode?: "quick" | "extended" | any) => {
          if (mode === "quick" || mode === "extended") setSearchInitialMode(mode);
          setIsSearchOpen(true);
        },
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
        updateFriendGroup,
        deleteFriendGroup,
        communityData,
        refreshCommunity,
        updateMediaStatus,
        submitRecommendation,
        upvoteRecommendation,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        removeFriend,
        searchUsers,
        openAvatarPicker: () => setIsAvatarPickerOpen(true),
        closeAvatarPicker: () => setIsAvatarPickerOpen(false),
        currentUserAvatar,
        updateUserAvatar,
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
        initialMode={searchInitialMode}
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

      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        currentAvatar={currentUserAvatar}
        userName={session?.user?.name || "Kino-Fan"}
        onSave={updateUserAvatar}
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
