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
} from "@/lib/store";

export async function GET() {
  const session = await getServerSession(authOptions);
  let userId: string | undefined = undefined;

  if (session?.user?.email) {
    const dbUser = await findUserByEmail(session.user.email);
    userId = dbUser?.id || (session.user as any)?.id;
  }

  if (!session?.user?.email || !userId) {
    return NextResponse.json({
      mediaStatuses: [],
      recommendations: [],
      friends: [],
      friendRequests: { pendingReceived: [], pendingSent: [] },
      friendGroups: [],
    });
  }

  const currentUserName = session?.user?.name || undefined;

  const [community, friends, friendRequests, friendGroups] = await Promise.all([
    getAllCommunityData(userId, currentUserName),
    getAllFriendsWithStats(userId),
    getUserFriendRequests(userId),
    getUserFriendGroups(userId, currentUserName),
  ]);

  return NextResponse.json({
    ...community,
    friends,
    friendRequests,
    friendGroups,
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
      await toggleMediaStatus({
        userId,
        userName,
        userImage,
        tmdbId: Number(body.tmdbId),
        mediaType: body.mediaType,
        title: body.title,
        posterPath: body.posterPath || null,
        releaseYear: body.releaseYear || null,
        status: body.status, // "WATCHED" | "WATCHLIST" | "NONE"
        rating: body.rating ? Number(body.rating) : undefined,
        watchedSeasons: Array.isArray(body.watchedSeasons)
          ? body.watchedSeasons
          : body.watchedSeasons === null
          ? null
          : undefined,
        totalSeasons:
          typeof body.totalSeasons === "number"
            ? body.totalSeasons
            : body.totalSeasons
            ? Number(body.totalSeasons)
            : body.totalSeasons === null
            ? null
            : undefined,
      });
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
    }

    const [community, friends, friendRequests, friendGroups] = await Promise.all([
      getAllCommunityData(userId, userName),
      getAllFriendsWithStats(userId),
      getUserFriendRequests(userId),
      getUserFriendGroups(userId, userName),
    ]);

    return NextResponse.json({
      ...community,
      friends,
      friendRequests,
      friendGroups,
      actionMessage,
    });
  } catch (err) {
    console.error("Community action error:", err);
    return NextResponse.json({ error: "Aktion fehlgeschlagen" }, { status: 500 });
  }
}
