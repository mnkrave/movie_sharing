import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllCommunityData,
  getAllFriendsWithStats,
  getUserFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriendship,
  searchUsersForFriendship,
  toggleMediaStatus,
  addRecommendation,
  updateRecommendation,
  deleteRecommendation,
  toggleRecommendationUpvote,
  updateUserSubscriptions,
  updateUserImage,
  findUserByEmail,
  getUserFriendGroups,
  saveFriendGroup,
  deleteFriendGroup,
  syncUserFriendGroups,
  addRecommendationReply,
  deleteRecommendationReply,
  getVisibleCustomCollections,
  saveCustomCollection,
  deleteCustomCollection,
  reviewCustomCollectionApproval,
  toggleCustomCollectionUpvote,
  addCustomCollectionComment,
  deleteCustomCollectionComment,
} from "@/lib/store";

function sanitizeWatchedSeasons(raw: unknown): number[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return Array.from(
    new Set(
      raw
        .slice(0, 200)
        .map((s) => Number(s))
        .filter((s) => Number.isInteger(s) && s > 0 && s <= 100)
    )
  )
    .sort((a, b) => a - b)
    .slice(0, 60);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  let userId: string | undefined = undefined;
  let isAdmin = false;

  if (session?.user?.email) {
    const dbUser = await findUserByEmail(session.user.email);
    userId = dbUser?.id || (session.user as any)?.id;
    isAdmin =
      session.user.email.toLowerCase() === "lukasreinle0@gmail.com" ||
      dbUser?.role === "ADMIN" ||
      (session.user as any)?.role === "ADMIN";
  }

  if (!session?.user?.email || !userId) {
    const publicCollections = await getVisibleCustomCollections(undefined, undefined, false);
    return NextResponse.json({
      mediaStatuses: [],
      recommendations: [],
      friends: [],
      friendRequests: { pendingReceived: [], pendingSent: [] },
      friendGroups: [],
      customCollections: publicCollections,
    });
  }

  const currentUserName = session?.user?.name || undefined;

  const [community, friends, friendRequests, friendGroups, customCollections] = await Promise.all([
    getAllCommunityData(userId, currentUserName),
    getAllFriendsWithStats(userId),
    getUserFriendRequests(userId),
    getUserFriendGroups(userId, currentUserName),
    getVisibleCustomCollections(userId, currentUserName, isAdmin),
  ]);

  return NextResponse.json({
    ...community,
    friends,
    friendRequests,
    friendGroups,
    customCollections,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Bitte logge dich ein, um fortzufahren." },
      { status: 401 }
    );
  }

  const dbUser = await findUserByEmail(session.user.email);
  const userId = dbUser?.id || (session.user as any)?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Benutzerkonto konnte nicht verifiziert werden." },
      { status: 401 }
    );
  }
  const userName = dbUser?.name || session.user.name || "Freund";
  const userImage = dbUser?.image || session.user.image || null;
  const isAdmin =
    session.user.email.toLowerCase() === "lukasreinle0@gmail.com" ||
    dbUser?.role === "ADMIN" ||
    (session.user as any)?.role === "ADMIN";

  try {
    const body = await req.json();
    const { action } = body;
    let actionMessage: string | undefined = undefined;

    if (action === "search_users") {
      const users = await searchUsersForFriendship(userId, body.query || "");
      return NextResponse.json({ users });
    }

    if (action === "friend_request") {
      const res = await sendFriendRequest(userId, body.target || "");
      if (!res.success) {
        return NextResponse.json({ error: res.error || "Fehler beim Senden der Anfrage." }, { status: 400 });
      }
      actionMessage = res.message;
    } else if (action === "accept_friend") {
      const res = await acceptFriendRequest(userId, body.requestId);
      if (!res.success) {
        return NextResponse.json({ error: res.error || "Fehler beim Annehmen der Anfrage." }, { status: 400 });
      }
      actionMessage = "Freundschaftsanfrage angenommen!";
    } else if (action === "decline_friend") {
      const res = await declineFriendRequest(userId, body.requestId);
      if (!res.success) {
        return NextResponse.json({ error: res.error || "Fehler beim Ablehnen der Anfrage." }, { status: 400 });
      }
      actionMessage = "Anfrage abgelehnt.";
    } else if (action === "remove_friend") {
      const res = await removeFriendship(userId, body.friendUserId);
      if (!res.success) {
        return NextResponse.json({ error: res.error || "Fehler beim Entfernen des Freundes." }, { status: 400 });
      }
      actionMessage = "Freundschaft beendet.";
    } else if (action === "status") {
      const requestedStatus = body.status;
      if (!["WATCHED", "WATCHLIST", "WATCHING", "NONE"].includes(requestedStatus)) {
        return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
      }
      const mediaType = body.mediaType === "tv" ? "tv" : "movie";
      if (requestedStatus === "WATCHING" && mediaType !== "tv") {
        return NextResponse.json(
          { error: "Der Status 'Aktuell am Schauen' ist nur für Serien verfügbar." },
          { status: 400 }
        );
      }
      const tmdbId = Number(body.tmdbId);
      if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
        return NextResponse.json({ error: "Ungültige TMDB-ID." }, { status: 400 });
      }
      const parsedRating =
        body.rating !== undefined && body.rating !== null && body.rating !== ""
          ? Number(body.rating)
          : NaN;
      const rating = Number.isFinite(parsedRating)
        ? Math.min(10, Math.max(1, Math.round(parsedRating)))
        : undefined;

      let watchedSeasons: number[] | null | undefined = undefined;
      let totalSeasons: number | null | undefined = undefined;
      if (mediaType === "tv") {
        watchedSeasons = Array.isArray(body.watchedSeasons)
          ? sanitizeWatchedSeasons(body.watchedSeasons)
          : body.watchedSeasons === null
          ? null
          : undefined;

        if (body.totalSeasons === null) {
          totalSeasons = null;
        } else if (body.totalSeasons !== undefined && body.totalSeasons !== "") {
          const parsedTotal = Number(body.totalSeasons);
          if (!Number.isInteger(parsedTotal) || parsedTotal < 1 || parsedTotal > 100) {
            return NextResponse.json({ error: "Ungültige Staffelanzahl." }, { status: 400 });
          }
          totalSeasons = parsedTotal;
        }
      }

      await toggleMediaStatus({
        userId,
        userName,
        userImage,
        tmdbId,
        mediaType,
        title: String(body.title || "").slice(0, 300),
        posterPath: body.posterPath ? String(body.posterPath).slice(0, 250) : null,
        releaseYear: body.releaseYear ? String(body.releaseYear).slice(0, 10) : null,
        status: requestedStatus,
        rating,
        watchedSeasons,
        totalSeasons,
      });
    } else if (action === "bulk_import_statuses") {
      const rawItems = Array.isArray(body.items) ? body.items.slice(0, 300) : [];
      let importedCount = 0;
      for (const raw of rawItems) {
        const tmdbId = Number(raw?.tmdbId);
        if (!tmdbId || isNaN(tmdbId)) continue;
        const mediaType = raw.mediaType === "tv" ? "tv" : "movie";
        const title = String(raw.title || "").trim().slice(0, 300);
        if (!title) continue;
        const ratingNum = raw.rating ? Number(raw.rating) : undefined;
        const cleanRating =
          ratingNum && !isNaN(ratingNum)
            ? Math.min(10, Math.max(1, Math.round(ratingNum)))
            : undefined;
        const watchedSeasons =
          mediaType === "tv" ? sanitizeWatchedSeasons(raw.watchedSeasons) : undefined;

        await toggleMediaStatus({
          userId,
          userName,
          userImage,
          tmdbId,
          mediaType,
          title,
          posterPath: raw.posterPath ? String(raw.posterPath).slice(0, 250) : null,
          releaseYear: raw.releaseYear ? String(raw.releaseYear).slice(0, 10) : null,
          status: "WATCHED",
          rating: cleanRating,
          watchedSeasons: watchedSeasons && watchedSeasons.length > 0 ? watchedSeasons : undefined,
        });
        importedCount++;
      }
      actionMessage = `${importedCount} Titel erfolgreich in dein Profil importiert!`;
    } else if (action === "recommend") {
      const cleanRating = Math.min(10, Math.max(1, Math.round(Number(body.rating) || 9)));
      const cleanComment = String(body.comment || "").trim().slice(0, 2000);
      const cleanTags = Array.isArray(body.tags)
        ? body.tags.slice(0, 15).map((t: any) => String(t).trim().slice(0, 50)).filter(Boolean)
        : [];
      await addRecommendation({
        userId,
        userName,
        userImage,
        tmdbId: Number(body.tmdbId),
        mediaType: body.mediaType === "tv" ? "tv" : "movie",
        title: String(body.title || "").slice(0, 300),
        posterPath: body.posterPath ? String(body.posterPath).slice(0, 250) : null,
        backdropPath: body.backdropPath ? String(body.backdropPath).slice(0, 250) : null,
        releaseYear: body.releaseYear ? String(body.releaseYear).slice(0, 10) : null,
        rating: cleanRating,
        comment: cleanComment,
        tags: cleanTags,
        targetType: body.targetType || "ALL",
        targetNames: Array.isArray(body.targetNames) ? body.targetNames.slice(0, 50) : [],
        targetGroupIds: Array.isArray(body.targetGroupIds) ? body.targetGroupIds.slice(0, 30) : [],
        targetUserIds: Array.isArray(body.targetUserIds) ? body.targetUserIds.slice(0, 50) : [],
      });
    } else if (action === "update_recommendation") {
      if (body.recommendationId) {
        const cleanRating = Math.min(10, Math.max(1, Math.round(Number(body.rating) || 9)));
        const cleanComment = String(body.comment || "").trim().slice(0, 2000);
        const cleanTags = Array.isArray(body.tags)
          ? body.tags.slice(0, 15).map((t: any) => String(t).trim().slice(0, 50)).filter(Boolean)
          : [];
        await updateRecommendation({
          recommendationId: String(body.recommendationId),
          userId,
          rating: cleanRating,
          comment: cleanComment,
          tags: cleanTags,
          targetType: body.targetType || "ALL",
          targetNames: Array.isArray(body.targetNames) ? body.targetNames.slice(0, 50) : [],
          targetGroupIds: Array.isArray(body.targetGroupIds) ? body.targetGroupIds.slice(0, 30) : [],
          targetUserIds: Array.isArray(body.targetUserIds) ? body.targetUserIds.slice(0, 50) : [],
        });
      }
    } else if (action === "delete_recommendation") {
      if (body.recommendationId) {
        await deleteRecommendation(userId, body.recommendationId);
      }
    } else if (action === "upvote") {
      await toggleRecommendationUpvote(userId, body.recommendationId);
    } else if (action === "subscriptions") {
      await updateUserSubscriptions(
        userId,
        Array.isArray(body.subscriptions) ? body.subscriptions : []
      );
    } else if (action === "friend_groups") {
      await syncUserFriendGroups(
        userId,
        userName,
        Array.isArray(body.friendGroups) ? body.friendGroups : []
      );
    } else if (action === "save_friend_group") {
      if (body.group) {
        await saveFriendGroup(userId, userName, body.group);
      }
    } else if (action === "delete_friend_group") {
      await deleteFriendGroup(userId, userName, body.groupId);
    } else if (action === "avatar" || action === "profile_image") {
      await updateUserImage(userId, body.image ?? null);
    } else if (action === "add_reply") {
      if (body.recommendationId && body.text) {
        await addRecommendationReply({
          recommendationId: body.recommendationId,
          userId,
          userName,
          userImage,
          text: body.text,
        });
      }
    } else if (action === "delete_reply") {
      if (body.replyId) {
        await deleteRecommendationReply(userId, body.replyId);
      }
    } else if (action === "save_custom_collection") {
      await saveCustomCollection({
        id: body.id ? String(body.id) : undefined,
        userId,
        userName,
        userImage,
        isAdmin,
        name: String(body.name || ""),
        tagline: body.tagline ? String(body.tagline) : undefined,
        description: String(body.description || ""),
        emoji: body.emoji ? String(body.emoji) : "🎬",
        posterPath: body.posterPath || null,
        backdropPath: body.backdropPath || null,
        movies: Array.isArray(body.movies) ? body.movies : [],
        visibility:
          body.visibility === "PUBLIC"
            ? "PUBLIC"
            : body.visibility === "FRIENDS"
            ? "FRIENDS"
            : "PRIVATE",
        targetType: body.targetType || "ALL",
        targetNames: Array.isArray(body.targetNames) ? body.targetNames.slice(0, 50) : [],
        targetGroupIds: Array.isArray(body.targetGroupIds) ? body.targetGroupIds.slice(0, 30) : [],
        targetUserIds: Array.isArray(body.targetUserIds) ? body.targetUserIds.slice(0, 50) : [],
      });
      actionMessage = body.id ? "Kollektion aktualisiert!" : "Kollektion erfolgreich erstellt!";
    } else if (action === "delete_custom_collection") {
      if (body.collectionId) {
        await deleteCustomCollection(userId, String(body.collectionId), isAdmin);
        actionMessage = "Kollektion gelöscht.";
      }
    } else if (action === "approve_custom_collection") {
      if (body.collectionId && isAdmin) {
        await reviewCustomCollectionApproval({
          collectionId: String(body.collectionId),
          approvalStatus: body.approvalStatus === "REJECTED" ? "REJECTED" : "APPROVED",
          isAdmin,
        });
        actionMessage =
          body.approvalStatus === "REJECTED"
            ? "Öffentliche Freigabe abgelehnt."
            : "Kollektion für alle freigegeben!";
      }
    } else if (action === "upvote_custom_collection") {
      if (body.collectionId) {
        await toggleCustomCollectionUpvote(userId, String(body.collectionId));
      }
    } else if (action === "add_custom_collection_comment") {
      if (body.collectionId && body.text) {
        await addCustomCollectionComment({
          collectionId: String(body.collectionId),
          userId,
          userName,
          userImage,
          text: String(body.text),
        });
      }
    } else if (action === "delete_custom_collection_comment") {
      if (body.collectionId && body.commentId) {
        await deleteCustomCollectionComment(
          userId,
          String(body.collectionId),
          String(body.commentId),
          isAdmin
        );
      }
    }

    const [community, friends, friendRequests, friendGroups, customCollections] = await Promise.all([
      getAllCommunityData(userId, userName),
      getAllFriendsWithStats(userId),
      getUserFriendRequests(userId),
      getUserFriendGroups(userId, userName),
      getVisibleCustomCollections(userId, userName, isAdmin),
    ]);

    return NextResponse.json({
      ...community,
      friends,
      friendRequests,
      friendGroups,
      customCollections,
      actionMessage,
    });
  } catch (err) {
    console.error("Community action error:", err);
    return NextResponse.json({ error: "Aktion fehlgeschlagen" }, { status: 500 });
  }
}
