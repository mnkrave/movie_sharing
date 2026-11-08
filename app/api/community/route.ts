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
  toggleRecommendationUpvote,
  updateUserSubscriptions,
  updateUserImage,
  findUserByEmail,
} from "@/lib/store";

export async function GET() {
  const session = await getServerSession(authOptions);
  let userId: string | undefined = undefined;

  if (session?.user?.email) {
    const dbUser = await findUserByEmail(session.user.email);
    userId = dbUser?.id || (session.user as any)?.id;
  }

  const [community, friends, friendRequests] = await Promise.all([
    getAllCommunityData(userId),
    getAllFriendsWithStats(userId),
    userId
      ? getUserFriendRequests(userId)
      : Promise.resolve({ pendingReceived: [], pendingSent: [] }),
  ]);

  return NextResponse.json({
    ...community,
    friends,
    friendRequests,
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
  const userId = dbUser?.id || (session.user as any).id || "user_lukas";
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
      });
    } else if (action === "recommend") {
      if (!body.comment || !body.comment.trim()) {
        return NextResponse.json(
          { error: "Bitte schreibe einen kurzen Empfehlungs-Kommentar für deine Freunde." },
          { status: 400 }
        );
      }
      await addRecommendation({
        userId,
        userName,
        userImage,
        tmdbId: Number(body.tmdbId),
        mediaType: body.mediaType,
        title: body.title,
        posterPath: body.posterPath || null,
        backdropPath: body.backdropPath || null,
        releaseYear: body.releaseYear || null,
        rating: Number(body.rating) || 9,
        comment: body.comment.trim(),
        tags: Array.isArray(body.tags) ? body.tags : [],
      });
    } else if (action === "upvote") {
      await toggleRecommendationUpvote(userId, body.recommendationId);
    } else if (action === "subscriptions") {
      await updateUserSubscriptions(
        userId,
        Array.isArray(body.subscriptions) ? body.subscriptions : []
      );
    } else if (action === "avatar" || action === "profile_image") {
      await updateUserImage(userId, body.image ?? null);
    }

    const [community, friends, friendRequests] = await Promise.all([
      getAllCommunityData(userId),
      getAllFriendsWithStats(userId),
      getUserFriendRequests(userId),
    ]);

    return NextResponse.json({
      ...community,
      friends,
      friendRequests,
      actionMessage,
    });
  } catch (err) {
    console.error("Community action error:", err);
    return NextResponse.json({ error: "Aktion fehlgeschlagen" }, { status: 500 });
  }
}
