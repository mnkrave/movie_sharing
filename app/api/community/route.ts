import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllCommunityData,
  getAllFriendsWithStats,
  toggleMediaStatus,
  addRecommendation,
  toggleRecommendationUpvote,
  updateUserSubscriptions,
  findUserByEmail,
} from "@/lib/store";

export async function GET() {
  const [community, friends] = await Promise.all([
    getAllCommunityData(),
    getAllFriendsWithStats(),
  ]);
  return NextResponse.json({
    ...community,
    friends,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Bitte logge dich ein, um Filme zu markieren oder zu empfehlen." },
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

    if (action === "status") {
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
    }

    const [community, friends] = await Promise.all([
      getAllCommunityData(),
      getAllFriendsWithStats(),
    ]);

    return NextResponse.json({
      ...community,
      friends,
    });
  } catch (err) {
    console.error("Community action error:", err);
    return NextResponse.json({ error: "Aktion fehlgeschlagen" }, { status: 500 });
  }
}
