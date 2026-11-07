import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  image?: string | null;
  role: string;
  subscriptions: string[];
  createdAt: string;
}

export interface AppMediaStatus {
  id: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  releaseYear?: string | null;
  status: "WATCHED" | "WATCHLIST";
  rating?: number | null;
  updatedAt: string;
}

export interface AppRecommendation {
  id: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseYear?: string | null;
  rating: number;
  comment: string;
  tags: string[];
  upvoterIds: string[];
  createdAt: string;
}

interface LocalDbFile {
  users: AppUser[];
  whitelist: { id: string; email: string; createdAt: string }[];
  mediaStatuses: AppMediaStatus[];
  recommendations: AppRecommendation[];
}

const LOCAL_DB_PATH = path.join(process.cwd(), ".local-db.json");

function getSeedLocalDb(): LocalDbFile {
  const defaultPass = bcrypt.hashSync("freunde123", 10);
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: "user_lukas",
        name: "Lukas",
        email: "lukasreinle0@gmail.com",
        password: defaultPass,
        image: null,
        role: "ADMIN",
        subscriptions: ["netflix", "prime", "disney"],
        createdAt: now,
      },
      {
        id: "user_max",
        name: "Max",
        email: "max@freunde.de",
        password: defaultPass,
        image: null,
        role: "USER",
        subscriptions: ["netflix", "wow"],
        createdAt: now,
      },
      {
        id: "user_sarah",
        name: "Sarah",
        email: "sarah@freunde.de",
        password: defaultPass,
        image: null,
        role: "USER",
        subscriptions: ["disney", "prime", "apple"],
        createdAt: now,
      },
    ],
    whitelist: [
      { id: "wl_1", email: "lukasreinle0@gmail.com", createdAt: now },
      { id: "wl_2", email: "max@freunde.de", createdAt: now },
      { id: "wl_3", email: "sarah@freunde.de", createdAt: now },
    ],
    mediaStatuses: [
      {
        id: "ms_1",
        userId: "user_lukas",
        userName: "Lukas",
        tmdbId: 872585,
        mediaType: "movie",
        title: "Oppenheimer",
        posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        releaseYear: "2023",
        status: "WATCHED",
        rating: 10,
        updatedAt: now,
      },
      {
        id: "ms_2",
        userId: "user_max",
        userName: "Max",
        tmdbId: 872585,
        mediaType: "movie",
        title: "Oppenheimer",
        posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        releaseYear: "2023",
        status: "WATCHED",
        rating: 9,
        updatedAt: now,
      },
      {
        id: "ms_3",
        userId: "user_sarah",
        userName: "Sarah",
        tmdbId: 496243,
        mediaType: "movie",
        title: "Parasite",
        posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        releaseYear: "2019",
        status: "WATCHED",
        rating: 10,
        updatedAt: now,
      },
      {
        id: "ms_4",
        userId: "user_max",
        userName: "Max",
        tmdbId: 496243,
        mediaType: "movie",
        title: "Parasite",
        posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        releaseYear: "2019",
        status: "WATCHED",
        rating: 9,
        updatedAt: now,
      },
      {
        id: "ms_5",
        userId: "user_lukas",
        userName: "Lukas",
        tmdbId: 545611,
        mediaType: "movie",
        title: "Everything Everywhere All at Once",
        posterPath: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
        releaseYear: "2022",
        status: "WATCHLIST",
        rating: null,
        updatedAt: now,
      },
      {
        id: "ms_6",
        userId: "user_sarah",
        userName: "Sarah",
        tmdbId: 545611,
        mediaType: "movie",
        title: "Everything Everywhere All at Once",
        posterPath: "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
        releaseYear: "2022",
        status: "WATCHLIST",
        rating: null,
        updatedAt: now,
      },
      {
        id: "ms_7",
        userId: "user_max",
        userName: "Max",
        tmdbId: 1396,
        mediaType: "tv",
        title: "Breaking Bad",
        posterPath: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
        releaseYear: "2008",
        status: "WATCHED",
        rating: 10,
        updatedAt: now,
      },
    ],
    recommendations: [
      {
        id: "rec_1",
        userId: "user_max",
        userName: "Max",
        tmdbId: 496243,
        mediaType: "movie",
        title: "Parasite",
        posterPath: "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
        backdropPath: "/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
        releaseYear: "2019",
        rating: 10,
        comment:
          "Einer der krassesten Twists überhaupt! Unbedingt anschauen, ohne vorher irgendwas darüber zu lesen. Über VPN auch auf Netflix in UK/Japan drin!",
        tags: ["🔥 Absolutes Muss", "🤯 Mindfuck", "🏆 Oscar-Meisterwerk"],
        upvoterIds: ["user_lukas", "user_sarah"],
        createdAt: now,
      },
      {
        id: "rec_2",
        userId: "user_sarah",
        userName: "Sarah",
        tmdbId: 872585,
        mediaType: "movie",
        title: "Oppenheimer",
        posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        backdropPath: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
        releaseYear: "2023",
        rating: 9,
        comment:
          "Soundtrack von Ludwig Göransson und Cillian Murphy einfach Gänsehaut pur. Drei Stunden vergehen wie im Flug!",
        tags: ["🎬 Bildgewaltig", "🎵 Krasser Soundtrack", "🏆 7 Oscars"],
        upvoterIds: ["user_lukas"],
        createdAt: now,
      },
      {
        id: "rec_3",
        userId: "user_max",
        userName: "Max",
        tmdbId: 1396,
        mediaType: "tv",
        title: "Breaking Bad",
        posterPath: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
        backdropPath: "/gc8PfyTqzqltKPW3X0cIVUGmagz.jpg",
        releaseYear: "2008",
        rating: 10,
        comment:
          "Beste Serie aller Zeiten – jede einzelne Staffel wird noch besser als die vorherige.",
        tags: ["📺 Beste Serie", "🔥 Absolutes Muss", "🍿 Suchtgefahr"],
        upvoterIds: ["user_lukas", "user_sarah"],
        createdAt: now,
      },
    ],
  };
}

function readLocalDb(): LocalDbFile {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    // ignore read error
  }
  const seeded = getSeedLocalDb();
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(seeded, null, 2), "utf-8");
  } catch {
    // ignore write error on read-only fs
  }
  return seeded;
}

function writeLocalDb(data: LocalDbFile) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // ignore write error on serverless if fallback triggered
  }
}

let pgAvailableCache: boolean | null = null;
let pgLastChecked = 0;

async function isPostgresAvailable(): Promise<boolean> {
  const now = Date.now();
  if (pgAvailableCache !== null && now - pgLastChecked < 15000) {
    return pgAvailableCache;
  }
  pgLastChecked = now;
  try {
    await prisma.$queryRaw`SELECT 1`;
    pgAvailableCache = true;
    return true;
  } catch {
    pgAvailableCache = false;
    return false;
  }
}

function parseSubscriptions(subStr?: string | null): string[] {
  if (!subStr) return ["netflix", "prime", "disney"];
  try {
    const parsed = JSON.parse(subStr);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return subStr.split(",").filter(Boolean);
}

// --- User & Whitelist Operations ---

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const emailLower = email.toLowerCase().trim();
  if (await isPostgresAvailable()) {
    const u = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      image: u.image,
      role: u.role,
      subscriptions: parseSubscriptions(u.subscriptions),
      createdAt: u.createdAt.toISOString(),
    };
  }
  const db = readLocalDb();
  return db.users.find((u) => u.email.toLowerCase() === emailLower) || null;
}

export async function findUserById(id: string): Promise<AppUser | null> {
  if (await isPostgresAvailable()) {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      image: u.image,
      role: u.role,
      subscriptions: parseSubscriptions(u.subscriptions),
      createdAt: u.createdAt.toISOString(),
    };
  }
  const db = readLocalDb();
  return db.users.find((u) => u.id === id) || null;
}

export async function createOrUpdateUser(data: {
  email: string;
  name: string;
  password?: string;
  image?: string | null;
  role?: string;
}): Promise<AppUser> {
  const emailLower = data.email.toLowerCase().trim();
  const isAdmin = emailLower === "lukasreinle0@gmail.com";
  const role = isAdmin ? "ADMIN" : data.role || "USER";

  if (await isPostgresAvailable()) {
    const existing = await prisma.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      const updated = await prisma.user.update({
        where: { email: emailLower },
        data: {
          name: data.name || existing.name,
          image: data.image ?? existing.image,
          password: data.password ?? existing.password,
          role: isAdmin ? "ADMIN" : existing.role,
        },
      });
      return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        password: updated.password,
        image: updated.image,
        role: updated.role,
        subscriptions: parseSubscriptions(updated.subscriptions),
        createdAt: updated.createdAt.toISOString(),
      };
    }
    const created = await prisma.user.create({
      data: {
        email: emailLower,
        name: data.name,
        password: data.password,
        image: data.image,
        role,
        subscriptions: JSON.stringify(["netflix", "prime", "disney"]),
      },
    });
    return {
      id: created.id,
      name: created.name,
      email: created.email,
      password: created.password,
      image: created.image,
      role: created.role,
      subscriptions: parseSubscriptions(created.subscriptions),
      createdAt: created.createdAt.toISOString(),
    };
  }

  const db = readLocalDb();
  let existing = db.users.find((u) => u.email.toLowerCase() === emailLower);
  if (existing) {
    existing.name = data.name || existing.name;
    if (data.password) existing.password = data.password;
    if (data.image !== undefined) existing.image = data.image;
    if (isAdmin) existing.role = "ADMIN";
    writeLocalDb(db);
    return existing;
  }

  const newUser: AppUser = {
    id: `user_${Date.now()}`,
    email: emailLower,
    name: data.name,
    password: data.password || null,
    image: data.image || null,
    role,
    subscriptions: ["netflix", "prime", "disney"],
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  writeLocalDb(db);
  return newUser;
}

export async function updateUserSubscriptions(userId: string, subscriptions: string[]): Promise<string[]> {
  if (await isPostgresAvailable()) {
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptions: JSON.stringify(subscriptions) },
    });
    return subscriptions;
  }
  const db = readLocalDb();
  const u = db.users.find((x) => x.id === userId);
  if (u) {
    u.subscriptions = subscriptions;
    writeLocalDb(db);
  }
  return subscriptions;
}

export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const emailLower = email.toLowerCase().trim();
  if (emailLower === "lukasreinle0@gmail.com") {
    await addEmailToWhitelist(emailLower);
    return true;
  }
  const envList = (process.env.WHITELISTED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (envList.includes(emailLower)) {
    await addEmailToWhitelist(emailLower);
    return true;
  }

  if (await isPostgresAvailable()) {
    const found = await prisma.whitelistedEmail.findUnique({ where: { email: emailLower } });
    return !!found;
  }

  const db = readLocalDb();
  return db.whitelist.some((w) => w.email.toLowerCase() === emailLower);
}

export async function getWhitelist() {
  if (await isPostgresAvailable()) {
    const list = await prisma.whitelistedEmail.findMany({ orderBy: { createdAt: "desc" } });
    return list.map((w) => ({ id: w.id, email: w.email, createdAt: w.createdAt.toISOString() }));
  }
  const db = readLocalDb();
  return db.whitelist;
}

export async function addEmailToWhitelist(email: string) {
  const emailLower = email.toLowerCase().trim();
  if (await isPostgresAvailable()) {
    const exists = await prisma.whitelistedEmail.findUnique({ where: { email: emailLower } });
    if (!exists) {
      await prisma.whitelistedEmail.create({ data: { email: emailLower } });
    }
    return;
  }
  const db = readLocalDb();
  if (!db.whitelist.some((w) => w.email.toLowerCase() === emailLower)) {
    db.whitelist.unshift({
      id: `wl_${Date.now()}`,
      email: emailLower,
      createdAt: new Date().toISOString(),
    });
    writeLocalDb(db);
  }
}

export async function removeEmailFromWhitelist(email: string) {
  const emailLower = email.toLowerCase().trim();
  if (emailLower === "lukasreinle0@gmail.com") return;
  if (await isPostgresAvailable()) {
    await prisma.whitelistedEmail.deleteMany({ where: { email: emailLower } });
    return;
  }
  const db = readLocalDb();
  db.whitelist = db.whitelist.filter((w) => w.email.toLowerCase() !== emailLower);
  writeLocalDb(db);
}

export async function getAllFriendsWithStats() {
  if (await isPostgresAvailable()) {
    const users = await prisma.user.findMany({
      include: {
        mediaStatuses: true,
        recommendations: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      subscriptions: parseSubscriptions(u.subscriptions),
      watchedCount: u.mediaStatuses.filter((m) => m.status === "WATCHED").length,
      watchlistCount: u.mediaStatuses.filter((m) => m.status === "WATCHLIST").length,
      recommendationsCount: u.recommendations.length,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  const db = readLocalDb();
  return db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role,
    subscriptions: u.subscriptions || ["netflix", "prime", "disney"],
    watchedCount: db.mediaStatuses.filter((m) => m.userId === u.id && m.status === "WATCHED").length,
    watchlistCount: db.mediaStatuses.filter((m) => m.userId === u.id && m.status === "WATCHLIST").length,
    recommendationsCount: db.recommendations.filter((r) => r.userId === u.id).length,
    createdAt: u.createdAt,
  }));
}

// --- Media Statuses & Recommendations ---

export async function getAllCommunityData(): Promise<{
  mediaStatuses: AppMediaStatus[];
  recommendations: AppRecommendation[];
}> {
  if (await isPostgresAvailable()) {
    const [statuses, recs] = await Promise.all([
      prisma.mediaStatus.findMany({
        include: { user: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.recommendation.findMany({
        include: { user: true, upvotes: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      mediaStatuses: statuses.map((s) => ({
        id: s.id,
        userId: s.userId,
        userName: s.user.name,
        userImage: s.user.image,
        tmdbId: s.tmdbId,
        mediaType: s.mediaType as "movie" | "tv",
        title: s.title,
        posterPath: s.posterPath,
        releaseYear: s.releaseYear,
        status: s.status as "WATCHED" | "WATCHLIST",
        rating: s.rating,
        updatedAt: s.updatedAt.toISOString(),
      })),
      recommendations: recs.map((r) => ({
        id: r.id,
        userId: r.userId,
        userName: r.user.name,
        userImage: r.user.image,
        tmdbId: r.tmdbId,
        mediaType: r.mediaType as "movie" | "tv",
        title: r.title,
        posterPath: r.posterPath,
        backdropPath: r.backdropPath,
        releaseYear: r.releaseYear,
        rating: r.rating,
        comment: r.comment,
        tags: r.tags ? r.tags.split(",").filter(Boolean) : [],
        upvoterIds: r.upvotes.map((u) => u.userId),
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  const db = readLocalDb();
  return {
    mediaStatuses: db.mediaStatuses,
    recommendations: db.recommendations,
  };
}

export async function toggleMediaStatus(params: {
  userId: string;
  userName: string;
  userImage?: string | null;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  releaseYear?: string | null;
  status: "WATCHED" | "WATCHLIST" | "NONE";
  rating?: number | null;
}) {
  if (await isPostgresAvailable()) {
    if (params.status === "NONE") {
      await prisma.mediaStatus.deleteMany({
        where: {
          userId: params.userId,
          tmdbId: params.tmdbId,
          mediaType: params.mediaType,
        },
      });
      return null;
    }

    const upserted = await prisma.mediaStatus.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: params.userId,
          tmdbId: params.tmdbId,
          mediaType: params.mediaType,
        },
      },
      update: {
        status: params.status,
        rating: params.rating !== undefined ? params.rating : undefined,
        title: params.title,
        posterPath: params.posterPath,
        releaseYear: params.releaseYear,
      },
      create: {
        userId: params.userId,
        tmdbId: params.tmdbId,
        mediaType: params.mediaType,
        title: params.title,
        posterPath: params.posterPath,
        releaseYear: params.releaseYear,
        status: params.status,
        rating: params.rating ?? null,
      },
    });
    return upserted;
  }

  const db = readLocalDb();
  const idx = db.mediaStatuses.findIndex(
    (m) => m.userId === params.userId && m.tmdbId === params.tmdbId && m.mediaType === params.mediaType
  );

  if (params.status === "NONE") {
    if (idx !== -1) {
      db.mediaStatuses.splice(idx, 1);
      writeLocalDb(db);
    }
    return null;
  }

  const now = new Date().toISOString();
  if (idx !== -1) {
    db.mediaStatuses[idx].status = params.status;
    if (params.rating !== undefined) db.mediaStatuses[idx].rating = params.rating;
    db.mediaStatuses[idx].updatedAt = now;
  } else {
    db.mediaStatuses.unshift({
      id: `ms_${Date.now()}`,
      userId: params.userId,
      userName: params.userName,
      userImage: params.userImage,
      tmdbId: params.tmdbId,
      mediaType: params.mediaType,
      title: params.title,
      posterPath: params.posterPath,
      releaseYear: params.releaseYear,
      status: params.status,
      rating: params.rating ?? null,
      updatedAt: now,
    });
  }
  writeLocalDb(db);
  return true;
}

export async function addRecommendation(params: {
  userId: string;
  userName: string;
  userImage?: string | null;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseYear?: string | null;
  rating: number;
  comment: string;
  tags: string[];
}) {
  // Also mark as WATCHED automatically when recommending!
  await toggleMediaStatus({
    userId: params.userId,
    userName: params.userName,
    userImage: params.userImage,
    tmdbId: params.tmdbId,
    mediaType: params.mediaType,
    title: params.title,
    posterPath: params.posterPath,
    releaseYear: params.releaseYear,
    status: "WATCHED",
    rating: params.rating,
  });

  if (await isPostgresAvailable()) {
    const created = await prisma.recommendation.create({
      data: {
        userId: params.userId,
        tmdbId: params.tmdbId,
        mediaType: params.mediaType,
        title: params.title,
        posterPath: params.posterPath,
        backdropPath: params.backdropPath,
        releaseYear: params.releaseYear,
        rating: params.rating,
        comment: params.comment,
        tags: params.tags.join(","),
      },
    });
    return created;
  }

  const db = readLocalDb();
  const newRec: AppRecommendation = {
    id: `rec_${Date.now()}`,
    userId: params.userId,
    userName: params.userName,
    userImage: params.userImage,
    tmdbId: params.tmdbId,
    mediaType: params.mediaType,
    title: params.title,
    posterPath: params.posterPath,
    backdropPath: params.backdropPath,
    releaseYear: params.releaseYear,
    rating: params.rating,
    comment: params.comment,
    tags: params.tags,
    upvoterIds: [params.userId],
    createdAt: new Date().toISOString(),
  };
  db.recommendations.unshift(newRec);
  writeLocalDb(db);
  return newRec;
}

export async function toggleRecommendationUpvote(userId: string, recommendationId: string) {
  if (await isPostgresAvailable()) {
    const existing = await prisma.recommendationUpvote.findUnique({
      where: {
        userId_recommendationId: { userId, recommendationId },
      },
    });
    if (existing) {
      await prisma.recommendationUpvote.delete({ where: { id: existing.id } });
      return { upvoted: false };
    } else {
      await prisma.recommendationUpvote.create({
        data: { userId, recommendationId },
      });
      return { upvoted: true };
    }
  }

  const db = readLocalDb();
  const rec = db.recommendations.find((r) => r.id === recommendationId);
  if (!rec) return { upvoted: false };
  const idx = rec.upvoterIds.indexOf(userId);
  if (idx !== -1) {
    rec.upvoterIds.splice(idx, 1);
    writeLocalDb(db);
    return { upvoted: false };
  } else {
    rec.upvoterIds.push(userId);
    writeLocalDb(db);
    return { upvoted: true };
  }
}
