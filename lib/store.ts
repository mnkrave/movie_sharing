import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { fetchDeStreamingProviders } from "./tmdb";
import { SUPER_ADMIN_EMAIL, isValidEmailAddress } from "./constants";

export { SUPER_ADMIN_EMAIL, isValidEmailAddress };

export const INVITE_LIMITS = {
  maxPer24h: 3,
  maxPer30d: 10,
  maxOpenPending: 5,
  globalMaxPer24h: 20,
  inviteTtlDays: 14,
  targetCooldownHours: 24,
} as const;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password?: string | null;
  image?: string | null;
  role: string;
  isBanned?: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
  invitedByUserId?: string | null;
  subscriptions: string[];
  watchlistAlertsEnabled?: boolean;
  friendGroups?: { id: string; name: string; emoji: string; memberNames: string[] }[];
  createdAt: string;
}

export interface AppWhitelistEntry {
  id: string;
  email: string;
  invitedByUserId?: string | null;
  invitedByName?: string | null;
  invitedByEmail?: string | null;
  expiresAt?: string | null;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  isRegistered?: boolean;
}

export interface UserInviteQuota {
  used24h: number;
  limit24h: number;
  used30d: number;
  limit30d: number;
  openPending: number;
  maxOpenPending: number;
  inviteTtlDays: number;
  isAdmin: boolean;
}

export interface AppInviteApprovalRequest {
  id: string;
  targetEmail: string;
  requesterUserId: string;
  requesterName: string;
  requesterEmail: string;
  blockedReason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
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
  status: "WATCHED" | "WATCHLIST" | "WATCHING";
  rating?: number | null;
  watchedSeasons?: number[] | null;
  totalSeasons?: number | null;
  alertedAt?: string | null;
  updatedAt: string;
}

export { formatWatchedSeasons } from "./seasons";

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
  targetType?: "ALL" | "GROUPS" | "FRIENDS" | "CUSTOM" | string | null;
  targetNames?: string[];
  targetGroupIds?: string[];
  targetUserIds?: string[];
  replies?: AppRecommendationReply[];
  createdAt: string;
}

export interface AppRecommendationReply {
  id: string;
  recommendationId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  text: string;
  createdAt: string;
}

export interface AppFriendGroup {
  id: string;
  name: string;
  emoji: string;
  ownerId?: string;
  ownerName?: string | null;
  memberNames: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AppCustomCollectionMovie {
  id: number;
  title: string;
  releaseYear: string;
  posterPath: string | null;
  backdropPath?: string | null;
  voteAverage: number;
  mediaType?: "movie" | "tv";
  note?: string;
}

export interface AppCustomCollectionComment {
  id: string;
  collectionId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  text: string;
  createdAt: string;
}

export interface AppCustomCollection {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerImage?: string | null;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  posterPath: string | null;
  backdropPath: string | null;
  movies: AppCustomCollectionMovie[];
  visibility: "PRIVATE" | "FRIENDS" | "PUBLIC";
  approvalStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  targetType?: "ALL" | "CUSTOM" | string;
  targetNames?: string[];
  targetGroupIds?: string[];
  targetUserIds?: string[];
  upvoterIds: string[];
  comments: AppCustomCollectionComment[];
  createdAt: string;
  updatedAt: string;
}

export function isSamePerson(nameA?: string | null, nameB?: string | null): boolean {
  if (!nameA || !nameB) return false;
  const a = nameA.toLowerCase().trim().replace(/^@/, "");
  const b = nameB.toLowerCase().trim().replace(/^@/, "");
  if (!a || !b) return false;
  if (a === b) return true;
  const aParts = a.split(/\s+/);
  const bParts = b.split(/\s+/);
  if (
    aParts[0].length >= 3 &&
    aParts[0] === bParts[0] &&
    (aParts.length === 1 || bParts.length === 1)
  ) {
    return true;
  }
  return false;
}

export interface AppFriendship {
  id: string;
  userId: string;
  friendId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
}

export interface StreamingSnapshotEntry {
  tmdbId: number;
  mediaType: "movie" | "tv";
  providersDE: string[];
  checkedAt: string;
}

interface LocalDbFile {
  users: AppUser[];
  whitelist: AppWhitelistEntry[];
  mediaStatuses: AppMediaStatus[];
  recommendations: AppRecommendation[];
  friendships: AppFriendship[];
  friendGroups?: AppFriendGroup[];
  recommendationReplies?: AppRecommendationReply[];
  customCollections?: AppCustomCollection[];
  streamingSnapshots?: StreamingSnapshotEntry[];
  inviteApprovalRequests?: AppInviteApprovalRequest[];
}

const LOCAL_DB_PATH = path.join(process.cwd(), ".local-db.json");

function getSeedLocalDb(): LocalDbFile {
  const defaultPass =
    process.env.NODE_ENV === "production" ? null : bcrypt.hashSync("freunde123", 10);
  const now = new Date().toISOString();
  return {
    friendGroups: [],
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
    friendships: [
      {
        id: "fs_1",
        userId: "user_lukas",
        friendId: "user_max",
        status: "ACCEPTED",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "fs_2",
        userId: "user_lukas",
        friendId: "user_sarah",
        status: "ACCEPTED",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "fs_3",
        userId: "user_max",
        friendId: "user_sarah",
        status: "ACCEPTED",
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

function readLocalDb(): LocalDbFile {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const raw = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      const parsed: LocalDbFile = JSON.parse(raw);
      if (!parsed.friendships) {
        parsed.friendships = [
          {
            id: "fs_1",
            userId: "user_lukas",
            friendId: "user_max",
            status: "ACCEPTED",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "fs_2",
            userId: "user_lukas",
            friendId: "user_sarah",
            status: "ACCEPTED",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "fs_3",
            userId: "user_max",
            friendId: "user_sarah",
            status: "ACCEPTED",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        writeLocalDb(parsed);
      }
      if (!parsed.recommendationReplies) {
        parsed.recommendationReplies = [];
      }
      return parsed;
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

function parseFriendGroups(val?: any): { id: string; name: string; emoji: string; memberNames: string[] }[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// --- User & Whitelist Operations ---

let watchlistAlertSchemaEnsured = false;
async function ensureWatchlistAlertSchema() {
  if (watchlistAlertSchemaEnsured) return;
  try {
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "watchlistAlertsEnabled" BOOLEAN NOT NULL DEFAULT true`;
    await prisma.$executeRaw`ALTER TABLE "MediaStatus" ADD COLUMN IF NOT EXISTS "alertedAt" TIMESTAMP(3)`;
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "StreamingProviderSnapshot" (
        "id" TEXT NOT NULL,
        "tmdbId" INTEGER NOT NULL,
        "mediaType" TEXT NOT NULL,
        "providersDE" TEXT NOT NULL DEFAULT '[]',
        "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StreamingProviderSnapshot_pkey" PRIMARY KEY ("id")
      )
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "StreamingProviderSnapshot_tmdbId_mediaType_key"
      ON "StreamingProviderSnapshot"("tmdbId", "mediaType")
    `;
    watchlistAlertSchemaEnsured = true;
  } catch {
    // ignore if permissions or DB unavailable
  }
}

let inviteAndModerationSchemaEnsured = false;
async function ensureInviteAndModerationSchema() {
  if (inviteAndModerationSchemaEnsured) return;
  try {
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN NOT NULL DEFAULT false`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bannedAt" TIMESTAMP(3)`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "banReason" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "invitedByUserId" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "WhitelistedEmail" ADD COLUMN IF NOT EXISTS "invitedByUserId" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "WhitelistedEmail" ADD COLUMN IF NOT EXISTS "invitedByName" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "WhitelistedEmail" ADD COLUMN IF NOT EXISTS "invitedByEmail" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "WhitelistedEmail" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3)`;
    await prisma.$executeRaw`ALTER TABLE "WhitelistedEmail" ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP(3)`;
    await prisma.$executeRaw`ALTER TABLE "WhitelistedEmail" ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3)`;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "WhitelistedEmail_invitedByUserId_createdAt_idx"
      ON "WhitelistedEmail"("invitedByUserId", "createdAt")
    `;
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "InviteApprovalRequest" (
        "id" TEXT NOT NULL,
        "targetEmail" TEXT NOT NULL,
        "requesterUserId" TEXT NOT NULL,
        "requesterName" TEXT NOT NULL,
        "requesterEmail" TEXT NOT NULL,
        "blockedReason" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "reviewedByUserId" TEXT,
        "reviewedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "InviteApprovalRequest_pkey" PRIMARY KEY ("id")
      )
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "InviteApprovalRequest_status_createdAt_idx"
      ON "InviteApprovalRequest"("status", "createdAt")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "InviteApprovalRequest_requesterUserId_createdAt_idx"
      ON "InviteApprovalRequest"("requesterUserId", "createdAt")
    `;
    inviteAndModerationSchemaEnsured = true;
  } catch {
    // ignore if permissions or DB unavailable
  }
}

function mapPrismaUser(u: any): AppUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    password: u.password,
    image: u.image,
    role: u.role,
    isBanned: Boolean(u.isBanned),
    bannedAt: u.bannedAt ? toIsoString(u.bannedAt) : null,
    banReason: u.banReason ?? null,
    invitedByUserId: u.invitedByUserId ?? null,
    subscriptions: parseSubscriptions(u.subscriptions),
    watchlistAlertsEnabled: u.watchlistAlertsEnabled ?? true,
    friendGroups: parseFriendGroups(u.friendGroups),
    createdAt: toIsoString(u.createdAt),
  };
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const emailLower = email.toLowerCase().trim();
  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const u = await prisma.user.findUnique({ where: { email: emailLower } });
    return u ? mapPrismaUser(u) : null;
  }
  const db = readLocalDb();
  return db.users.find((u) => u.email.toLowerCase() === emailLower) || null;
}

export async function findUserById(id: string): Promise<AppUser | null> {
  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? mapPrismaUser(u) : null;
  }
  const db = readLocalDb();
  return db.users.find((u) => u.id === id) || null;
}

/**
 * Marks a whitelist invite as accepted (clearing any expiry) and sends a pending
 * friend request from the inviter to the newly registered user if eligible.
 */
async function markInviteAcceptedAndConnect(emailLower: string, userId: string): Promise<string | null> {
  const now = new Date();
  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const wl = await prisma.whitelistedEmail.findUnique({ where: { email: emailLower } });
    if (!wl || wl.revokedAt) return null;

    if (!wl.acceptedAt || wl.expiresAt) {
      await prisma.whitelistedEmail.update({
        where: { id: wl.id },
        data: { acceptedAt: wl.acceptedAt ?? now, expiresAt: null },
      });
    }

    const inviterId = wl.invitedByUserId;
    if (inviterId && inviterId !== userId) {
      const inviter = await prisma.user.findUnique({
        where: { id: inviterId },
        select: { id: true, isBanned: true },
      });
      if (inviter && !inviter.isBanned) {
        const existingFs = await prisma.friendship.findFirst({
          where: {
            OR: [
              { userId: inviterId, friendId: userId },
              { userId, friendId: inviterId },
            ],
          },
        });
        if (!existingFs) {
          await prisma.friendship
            .create({ data: { userId: inviterId, friendId: userId, status: "PENDING" } })
            .catch(() => {});
        }
      }
      return inviterId;
    }
    return null;
  }

  const db = readLocalDb();
  const wl = db.whitelist.find((w) => w.email.toLowerCase() === emailLower && !w.revokedAt);
  if (!wl) return null;
  wl.acceptedAt = wl.acceptedAt || now.toISOString();
  wl.expiresAt = null;
  const inviterId = wl.invitedByUserId || null;
  if (inviterId && inviterId !== userId) {
    const inviter = db.users.find((u) => u.id === inviterId && !u.isBanned);
    if (inviter) {
      if (!db.friendships) db.friendships = [];
      const exists = db.friendships.some(
        (f) =>
          (f.userId === inviterId && f.friendId === userId) ||
          (f.userId === userId && f.friendId === inviterId)
      );
      if (!exists) {
        const iso = now.toISOString();
        db.friendships.unshift({
          id: `fs_${Date.now()}`,
          userId: inviterId,
          friendId: userId,
          status: "PENDING",
          createdAt: iso,
          updatedAt: iso,
        });
      }
    }
  }
  writeLocalDb(db);
  return inviterId;
}

export async function createOrUpdateUser(data: {
  email: string;
  name: string;
  password?: string;
  image?: string | null;
  role?: string;
}): Promise<AppUser> {
  const emailLower = data.email.toLowerCase().trim();
  const isAdmin = emailLower === SUPER_ADMIN_EMAIL;
  const role = isAdmin ? "ADMIN" : data.role || "USER";

  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
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
      await markInviteAcceptedAndConnect(emailLower, updated.id);
      return mapPrismaUser(updated);
    }

    const wl = await prisma.whitelistedEmail.findUnique({ where: { email: emailLower } });
    const created = await prisma.user.create({
      data: {
        email: emailLower,
        name: data.name,
        password: data.password,
        image: data.image,
        role,
        invitedByUserId: wl && !wl.revokedAt ? wl.invitedByUserId : null,
        subscriptions: JSON.stringify(["netflix", "prime", "disney"]),
      },
    });
    await markInviteAcceptedAndConnect(emailLower, created.id);
    return mapPrismaUser(created);
  }

  const db = readLocalDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === emailLower);
  if (existing) {
    existing.name = data.name || existing.name;
    if (data.password) existing.password = data.password;
    if (data.image !== undefined) existing.image = data.image;
    if (isAdmin) existing.role = "ADMIN";
    writeLocalDb(db);
    await markInviteAcceptedAndConnect(emailLower, existing.id);
    return existing;
  }

  const wl = db.whitelist.find((w) => w.email.toLowerCase() === emailLower && !w.revokedAt);
  const newUser: AppUser = {
    id: `user_${Date.now()}`,
    email: emailLower,
    name: data.name,
    password: data.password || null,
    image: data.image || null,
    role,
    isBanned: false,
    invitedByUserId: wl?.invitedByUserId ?? null,
    subscriptions: ["netflix", "prime", "disney"],
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  writeLocalDb(db);
  await markInviteAcceptedAndConnect(emailLower, newUser.id);
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

export function parseMemberNames(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((s) => String(s).trim().replace(/^@/, "")).filter(Boolean);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim().replace(/^@/, "")).filter(Boolean);
      }
    } catch {
      // ignore
    }
    return val.split(",").map((s) => s.trim().replace(/^@/, "")).filter(Boolean);
  }
  return [];
}

export async function getUserFriendGroups(
  userId: string,
  userName?: string
): Promise<AppFriendGroup[]> {
  let targetName = userName;
  if (!targetName) {
    const u = await findUserById(userId);
    targetName = u?.name;
  }

  const belongs = (grp: AppFriendGroup) => {
    if (grp.ownerId && grp.ownerId === userId) return true;
    if (targetName && grp.memberNames.some((m) => isSamePerson(m, targetName))) return true;
    return false;
  };

  if (await isPostgresAvailable()) {
    try {
      // 1. Try Prisma FriendGroup table (global shared groups)
      const allDbGroups = await (prisma as any).friendGroup.findMany({
        orderBy: { updatedAt: "desc" },
      });
      const mapped: AppFriendGroup[] = allDbGroups.map((g: any) => ({
        id: g.id,
        name: g.name,
        emoji: g.emoji || "🛋️",
        ownerId: g.ownerId,
        ownerName: g.ownerName,
        memberNames: parseMemberNames(g.memberNames),
        createdAt: g.createdAt?.toISOString?.() || g.createdAt,
        updatedAt: g.updatedAt?.toISOString?.() || g.updatedAt,
      }));

      const userGroups = mapped.filter(belongs);

      // 2. Also check User.friendGroups on this user and migrate if any are missing
      const userRecord = await prisma.user.findUnique({ where: { id: userId } });
      const legacy = parseFriendGroups(userRecord?.friendGroups);
      for (const leg of legacy) {
        if (!mapped.some((m) => m.id === leg.id || (m.name.toLowerCase() === leg.name.toLowerCase() && m.ownerId === userId))) {
          try {
            const created = await (prisma as any).friendGroup.create({
              data: {
                id: leg.id.startsWith("grp_") ? leg.id : `grp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                name: leg.name,
                emoji: leg.emoji || "🛋️",
                ownerId: userId,
                ownerName: targetName || "Benutzer",
                memberNames: JSON.stringify(leg.memberNames),
              },
            });
            userGroups.push({
              id: created.id,
              name: created.name,
              emoji: created.emoji,
              ownerId: created.ownerId,
              ownerName: created.ownerName,
              memberNames: parseMemberNames(created.memberNames),
            });
          } catch {
            // ignore
          }
        }
      }

      return userGroups;
    } catch (err) {
      console.warn("FriendGroup table query failed, falling back to all User.friendGroups:", err);
      // Fallback: check all users' friendGroups column
      const allUsers = await prisma.user.findMany({ select: { id: true, name: true, friendGroups: true } });
      const collected: AppFriendGroup[] = [];
      for (const u of allUsers) {
        const grps = parseFriendGroups(u.friendGroups);
        for (const g of grps) {
          const withOwner: AppFriendGroup = {
            ...g,
            ownerId: (g as any).ownerId || u.id,
            ownerName: (g as any).ownerName || u.name,
          };
          if (belongs(withOwner) && !collected.some((c) => c.id === withOwner.id)) {
            collected.push(withOwner);
          }
        }
      }
      return collected;
    }
  }

  // Local DB fallback
  const db = readLocalDb();
  if (!db.friendGroups) db.friendGroups = [];

  // Migrate legacy users[].friendGroups to db.friendGroups if needed
  for (const u of db.users) {
    if (u.friendGroups && Array.isArray(u.friendGroups)) {
      for (const g of u.friendGroups) {
        if (!db.friendGroups.some((existing) => existing.id === g.id)) {
          db.friendGroups.push({
            ...g,
            ownerId: (g as any).ownerId || u.id,
            ownerName: (g as any).ownerName || u.name,
          });
        }
      }
    }
  }

  return db.friendGroups.filter(belongs);
}

export async function saveFriendGroup(
  userId: string,
  userName: string,
  groupData: { id?: string; name: string; emoji: string; memberNames: string[] }
): Promise<AppFriendGroup> {
  const groupId = groupData.id && groupData.id.startsWith("grp_") ? groupData.id : `grp_${Date.now()}`;
  const cleanMembers = groupData.memberNames.map((s) => s.trim().replace(/^@/, "")).filter(Boolean);

  if (!cleanMembers.some((m) => isSamePerson(m, userName))) {
    cleanMembers.unshift(userName);
  }

  const groupObj: AppFriendGroup = {
    id: groupId,
    name: groupData.name.trim(),
    emoji: groupData.emoji || "🛋️",
    ownerId: userId,
    ownerName: userName,
    memberNames: cleanMembers,
    updatedAt: new Date().toISOString(),
  };

  if (await isPostgresAvailable()) {
    try {
      const existing = await (prisma as any).friendGroup.findUnique({ where: { id: groupId } });
      if (existing) {
        const existingMembers = parseMemberNames(existing.memberNames);
        const isAuthorized =
          existing.ownerId === userId ||
          existingMembers.some((m) => isSamePerson(m, userName));
        if (!isAuthorized) {
          throw new Error("Keine Berechtigung zum Bearbeiten dieser Gruppe.");
        }
        await (prisma as any).friendGroup.update({
          where: { id: groupId },
          data: {
            name: groupObj.name,
            emoji: groupObj.emoji,
            memberNames: JSON.stringify(groupObj.memberNames),
          },
        });
        groupObj.ownerId = existing.ownerId;
        groupObj.ownerName = existing.ownerName;
      } else {
        await (prisma as any).friendGroup.create({
          data: {
            id: groupId,
            name: groupObj.name,
            emoji: groupObj.emoji,
            ownerId: userId,
            ownerName: userName,
            memberNames: JSON.stringify(groupObj.memberNames),
          },
        });
      }
    } catch (err) {
      console.warn("Could not save to FriendGroup table, saving to User.friendGroups:", err);
      const u = await prisma.user.findUnique({ where: { id: userId } });
      const current = parseFriendGroups(u?.friendGroups);
      const next = current.some((g) => g.id === groupId)
        ? current.map((g) => (g.id === groupId ? groupObj : g))
        : [...current, groupObj];
      await prisma.user.update({
        where: { id: userId },
        data: { friendGroups: JSON.stringify(next) },
      });
    }
    return groupObj;
  }

  const db = readLocalDb();
  if (!db.friendGroups) db.friendGroups = [];
  const idx = db.friendGroups.findIndex((g) => g.id === groupId);
  if (idx !== -1) {
    const existing = db.friendGroups[idx];
    const isAuthorized =
      existing.ownerId === userId ||
      (existing.memberNames || []).some((m) => isSamePerson(m, userName));
    if (!isAuthorized) {
      return existing;
    }
    db.friendGroups[idx] = {
      ...existing,
      ...groupObj,
      ownerId: existing.ownerId || userId,
      ownerName: existing.ownerName || userName,
    };
  } else {
    db.friendGroups.push(groupObj);
  }
  writeLocalDb(db);
  return groupObj;
}

export async function deleteFriendGroup(
  userId: string,
  userName: string,
  groupId: string
): Promise<boolean> {
  if (await isPostgresAvailable()) {
    try {
      const grp = await (prisma as any).friendGroup.findUnique({ where: { id: groupId } });
      if (grp) {
        if (grp.ownerId === userId) {
          await (prisma as any).friendGroup.delete({ where: { id: groupId } });
        } else {
          // If a member who is not the owner leaves/deletes
          const currentMembers = parseMemberNames(grp.memberNames);
          const nextMembers = currentMembers.filter((m) => !isSamePerson(m, userName));
          if (nextMembers.length === 0) {
            await (prisma as any).friendGroup.delete({ where: { id: groupId } });
          } else {
            await (prisma as any).friendGroup.update({
              where: { id: groupId },
              data: { memberNames: JSON.stringify(nextMembers) },
            });
          }
        }
      }
    } catch {
      // ignore
    }

    // Also remove from user's friendGroups if present
    try {
      const u = await prisma.user.findUnique({ where: { id: userId } });
      const current = parseFriendGroups(u?.friendGroups);
      if (current.some((g) => g.id === groupId)) {
        await prisma.user.update({
          where: { id: userId },
          data: { friendGroups: JSON.stringify(current.filter((g) => g.id !== groupId)) },
        });
      }
    } catch {
      // ignore
    }
    return true;
  }

  const db = readLocalDb();
  if (db.friendGroups) {
    const grp = db.friendGroups.find((g) => g.id === groupId);
    if (grp) {
      if (grp.ownerId === userId) {
        db.friendGroups = db.friendGroups.filter((g) => g.id !== groupId);
      } else {
        grp.memberNames = grp.memberNames.filter((m) => !isSamePerson(m, userName));
        if (grp.memberNames.length === 0) {
          db.friendGroups = db.friendGroups.filter((g) => g.id !== groupId);
        }
      }
      writeLocalDb(db);
    }
  }
  return true;
}

export async function syncUserFriendGroups(
  userId: string,
  userName: string,
  groups: { id?: string; name: string; emoji: string; memberNames: string[] }[]
): Promise<AppFriendGroup[]> {
  for (const grp of groups) {
    await saveFriendGroup(userId, userName, grp);
  }
  return getUserFriendGroups(userId, userName);
}

const ALLOWED_AVATAR_HOSTS = new Set([
  "image.tmdb.org",
  "media.themoviedb.org",
  "lh3.googleusercontent.com",
]);

export function sanitizeAvatarUrl(image: string | null | undefined): string | null {
  if (!image || typeof image !== "string") return null;
  const trimmed = image.trim();
  if (!trimmed || trimmed.length > 500) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return null;
    if (!ALLOWED_AVATAR_HOSTS.has(parsed.hostname.toLowerCase())) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function updateUserImage(userId: string, image: string | null): Promise<string | null> {
  const safeImage = sanitizeAvatarUrl(image);
  if (image && !safeImage) {
    throw new Error(
      "Ungültige Bild-URL. Erlaubt sind nur offizielle HTTPS-Bilder von TMDB oder Google."
    );
  }
  if (await isPostgresAvailable()) {
    await prisma.user.update({
      where: { id: userId },
      data: { image: safeImage },
    });
    return safeImage;
  }
  const db = readLocalDb();
  const u = db.users.find((x) => x.id === userId);
  if (u) {
    u.image = safeImage;
  }
  db.mediaStatuses.forEach((m) => {
    if (m.userId === userId) m.userImage = safeImage;
  });
  db.recommendations.forEach((r) => {
    if (r.userId === userId) r.userImage = safeImage;
  });
  writeLocalDb(db);
  return safeImage;
}

function isWhitelistEntryActive(
  entry: { revokedAt?: Date | string | null; acceptedAt?: Date | string | null; expiresAt?: Date | string | null },
  nowMs = Date.now()
): boolean {
  if (entry.revokedAt) return false;
  if (entry.acceptedAt) return true;
  if (!entry.expiresAt) return true;
  return new Date(entry.expiresAt).getTime() > nowMs;
}

function mapWhitelistEntry(w: any, registeredEmails: Set<string>): AppWhitelistEntry {
  const emailLower = w.email.toLowerCase();
  return {
    id: w.id,
    email: w.email,
    invitedByUserId: w.invitedByUserId ?? null,
    invitedByName: w.invitedByName ?? null,
    invitedByEmail: w.invitedByEmail ?? null,
    expiresAt: w.expiresAt ? toIsoString(w.expiresAt) : null,
    acceptedAt: w.acceptedAt ? toIsoString(w.acceptedAt) : null,
    revokedAt: w.revokedAt ? toIsoString(w.revokedAt) : null,
    createdAt: toIsoString(w.createdAt),
    isRegistered: Boolean(w.acceptedAt) || registeredEmails.has(emailLower),
  };
}

export async function isEmailWhitelisted(email: string): Promise<boolean> {
  const emailLower = email.toLowerCase().trim();
  if (emailLower === SUPER_ADMIN_EMAIL) {
    await addEmailToWhitelist(emailLower);
    return true;
  }
  const existingUser = await findUserByEmail(emailLower);
  if (existingUser?.isBanned) {
    return false;
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
    await ensureInviteAndModerationSchema();
    const found = await prisma.whitelistedEmail.findUnique({ where: { email: emailLower } });
    return Boolean(found) && isWhitelistEntryActive(found!);
  }

  const db = readLocalDb();
  const found = db.whitelist.find((w) => w.email.toLowerCase() === emailLower);
  return Boolean(found) && isWhitelistEntryActive(found!);
}

export async function getWhitelist(): Promise<AppWhitelistEntry[]> {
  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const [list, users] = await Promise.all([
      prisma.whitelistedEmail.findMany({
        where: { revokedAt: null },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({ select: { email: true } }),
    ]);
    const registeredEmails = new Set(users.map((u) => u.email.toLowerCase()));
    return list.map((w) => mapWhitelistEntry(w, registeredEmails));
  }
  const db = readLocalDb();
  const registeredEmails = new Set(db.users.map((u) => u.email.toLowerCase()));
  return db.whitelist
    .filter((w) => !w.revokedAt)
    .map((w) => mapWhitelistEntry(w, registeredEmails));
}

export async function addEmailToWhitelist(
  email: string,
  inviter?: { userId?: string | null; name?: string | null; email?: string | null }
) {
  const emailLower = email.toLowerCase().trim();
  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const exists = await prisma.whitelistedEmail.findUnique({ where: { email: emailLower } });
    if (!exists) {
      await prisma.whitelistedEmail.create({
        data: {
          email: emailLower,
          invitedByUserId: inviter?.userId ?? null,
          invitedByName: inviter?.name ?? null,
          invitedByEmail: inviter?.email ?? null,
        },
      });
    } else if (exists.revokedAt || exists.expiresAt) {
      await prisma.whitelistedEmail.update({
        where: { email: emailLower },
        data: {
          revokedAt: null,
          expiresAt: null,
          invitedByUserId: inviter?.userId ?? exists.invitedByUserId,
          invitedByName: inviter?.name ?? exists.invitedByName,
          invitedByEmail: inviter?.email ?? exists.invitedByEmail,
        },
      });
    }
    return;
  }
  const db = readLocalDb();
  const existing = db.whitelist.find((w) => w.email.toLowerCase() === emailLower);
  if (!existing) {
    db.whitelist.unshift({
      id: `wl_${Date.now()}`,
      email: emailLower,
      invitedByUserId: inviter?.userId ?? null,
      invitedByName: inviter?.name ?? null,
      invitedByEmail: inviter?.email ?? null,
      expiresAt: null,
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date().toISOString(),
    });
    writeLocalDb(db);
  } else if (existing.revokedAt || existing.expiresAt) {
    existing.revokedAt = null;
    existing.expiresAt = null;
    if (inviter?.userId) existing.invitedByUserId = inviter.userId;
    if (inviter?.name) existing.invitedByName = inviter.name;
    if (inviter?.email) existing.invitedByEmail = inviter.email;
    writeLocalDb(db);
  }
}

export async function removeEmailFromWhitelist(email: string) {
  const emailLower = email.toLowerCase().trim();
  if (emailLower === SUPER_ADMIN_EMAIL) return;
  const now = new Date();
  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    await prisma.whitelistedEmail.updateMany({
      where: { email: emailLower, revokedAt: null },
      data: { revokedAt: now },
    });
    return;
  }
  const db = readLocalDb();
  const item = db.whitelist.find((w) => w.email.toLowerCase() === emailLower);
  if (item) {
    item.revokedAt = now.toISOString();
    writeLocalDb(db);
  }
}

function tallyInviteQuota(params: {
  entries: Array<{
    email: string;
    invitedByUserId?: string | null;
    createdAt: Date | string;
    expiresAt?: Date | string | null;
    acceptedAt?: Date | string | null;
    revokedAt?: Date | string | null;
  }>;
  users: Array<{ id: string; email: string; role: string }>;
  userId: string;
  isAdmin: boolean;
  nowMs: number;
}): { quota: UserInviteQuota; globalUsed24h: number; registeredSet: Set<string> } {
  const { entries, users, userId, isAdmin, nowMs } = params;
  const since24hMs = nowMs - 24 * 60 * 60 * 1000;
  const since30dMs = nowMs - 30 * 24 * 60 * 60 * 1000;
  const registeredSet = new Set(users.map((u) => u.email.toLowerCase()));
  const adminIds = new Set(
    users
      .filter((u) => u.role === "ADMIN" || u.email.toLowerCase() === SUPER_ADMIN_EMAIL)
      .map((u) => u.id)
  );

  let used24h = 0;
  let used30d = 0;
  let openPending = 0;
  let globalUsed24h = 0;

  for (const e of entries) {
    const createdTs = new Date(e.createdAt).getTime();
    if (e.invitedByUserId && !adminIds.has(e.invitedByUserId) && createdTs >= since24hMs) {
      globalUsed24h++;
    }
    if (e.invitedByUserId !== userId) continue;
    if (createdTs >= since24hMs) used24h++;
    if (createdTs >= since30dMs) used30d++;
    if (
      !e.revokedAt &&
      !e.acceptedAt &&
      !registeredSet.has(e.email.toLowerCase()) &&
      (!e.expiresAt || new Date(e.expiresAt).getTime() > nowMs)
    ) {
      openPending++;
    }
  }

  return {
    quota: {
      used24h,
      limit24h: INVITE_LIMITS.maxPer24h,
      used30d,
      limit30d: INVITE_LIMITS.maxPer30d,
      openPending,
      maxOpenPending: INVITE_LIMITS.maxOpenPending,
      inviteTtlDays: INVITE_LIMITS.inviteTtlDays,
      isAdmin,
    },
    globalUsed24h,
    registeredSet,
  };
}

async function loadInviteQuotaContext(userId: string, isAdmin: boolean) {
  const nowMs = Date.now();
  const since24h = new Date(nowMs - 24 * 60 * 60 * 1000);

  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const [entries, users] = await Promise.all([
      prisma.whitelistedEmail.findMany({
        where: {
          OR: [{ invitedByUserId: userId }, { createdAt: { gte: since24h }, invitedByUserId: { not: null } }],
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({ select: { id: true, email: true, role: true } }),
    ]);
    return {
      entries,
      ...tallyInviteQuota({ entries, users, userId, isAdmin, nowMs }),
    };
  }

  const db = readLocalDb();
  return {
    entries: db.whitelist,
    ...tallyInviteQuota({ entries: db.whitelist, users: db.users, userId, isAdmin, nowMs }),
  };
}

export async function getUserInvitesAndQuota(
  userId: string,
  isAdmin: boolean
): Promise<{ invites: AppWhitelistEntry[]; quota: UserInviteQuota }> {
  const { entries, quota, registeredSet } = await loadInviteQuotaContext(userId, isAdmin);
  const invites = entries
    .filter((w) => w.invitedByUserId === userId && !w.revokedAt)
    .slice(0, 50)
    .map((w) => mapWhitelistEntry(w, registeredSet));

  return { invites, quota };
}

function checkExistingWhitelistConflict(
  existingWl: { createdAt: Date | string; revokedAt?: Date | string | null; acceptedAt?: Date | string | null; expiresAt?: Date | string | null },
  inviterIsAdmin: boolean,
  nowMs: number
): { status: number; error: string; canRequestAdminApproval?: boolean; blockedReason?: string } | null {
  if (isWhitelistEntryActive(existingWl, nowMs)) {
    return { status: 409, error: "Diese E-Mail-Adresse wurde bereits eingeladen und ist aktiv." };
  }
  const targetCooldownMs = INVITE_LIMITS.targetCooldownHours * 60 * 60 * 1000;
  if (!inviterIsAdmin && nowMs - new Date(existingWl.createdAt).getTime() < targetCooldownMs) {
    return {
      status: 429,
      error: "An diese E-Mail-Adresse wurde in den letzten 24 Stunden bereits eine Einladung gesendet.",
      canRequestAdminApproval: true,
      blockedReason: "24h-Cooldown für diese Ziel-E-Mail",
    };
  }
  return null;
}

async function evaluateUserInviteEligibility(params: {
  inviterId: string;
  inviterEmail: string;
  inviterIsAdmin: boolean;
  emailLower: string;
  nowMs: number;
}): Promise<
  | { ok: true; quota: UserInviteQuota }
  | { ok: false; status: number; error: string; canRequestAdminApproval?: boolean; blockedReason?: string }
> {
  const { emailLower, nowMs } = params;
  if (!isValidEmailAddress(emailLower)) {
    return { ok: false, status: 400, error: "Bitte gib eine gültige E-Mail-Adresse ein." };
  }
  if (emailLower === params.inviterEmail.toLowerCase().trim()) {
    return { ok: false, status: 400, error: "Du kannst dich nicht selbst einladen." };
  }

  const existingUser = await findUserByEmail(emailLower);
  if (existingUser?.isBanned) {
    return {
      ok: false,
      status: 403,
      error: "Diese E-Mail-Adresse kann derzeit nicht eingeladen werden.",
    };
  }
  if (existingUser) {
    return {
      ok: false,
      status: 409,
      error: "Diese Person ist bereits bei CineCircle registriert. Suche sie oben unter „Freund hinzufügen“.",
    };
  }

  // Check active/cooldown whitelist conflict first (so already-active emails never offer override)
  const existingWl = (await isPostgresAvailable())
    ? (await ensureInviteAndModerationSchema(),
      await prisma.whitelistedEmail.findUnique({ where: { email: emailLower } }))
    : readLocalDb().whitelist.find((w) => w.email.toLowerCase() === emailLower);

  if (existingWl) {
    const conflict = checkExistingWhitelistConflict(existingWl, params.inviterIsAdmin, nowMs);
    if (conflict) return { ok: false, ...conflict };
  }

  const { quota, globalUsed24h } = await loadInviteQuotaContext(
    params.inviterId,
    params.inviterIsAdmin
  );

  if (!params.inviterIsAdmin) {
    if (globalUsed24h >= INVITE_LIMITS.globalMaxPer24h) {
      return {
        ok: false,
        status: 429,
        error: "Das tägliche Sicherheits-Limit für Einladungen wurde erreicht. Du kannst den Admin um eine manuelle Freigabe bitten.",
        canRequestAdminApproval: true,
        blockedReason: `Plattform-Limit (${INVITE_LIMITS.globalMaxPer24h}/24h) erreicht`,
      };
    }
    if (quota.used24h >= INVITE_LIMITS.maxPer24h) {
      return {
        ok: false,
        status: 429,
        error: `Du hast das Tageslimit von ${INVITE_LIMITS.maxPer24h} Einladungen in 24 Stunden erreicht.`,
        canRequestAdminApproval: true,
        blockedReason: `Tageslimit (${INVITE_LIMITS.maxPer24h}/24h) erreicht`,
      };
    }
    if (quota.used30d >= INVITE_LIMITS.maxPer30d) {
      return {
        ok: false,
        status: 429,
        error: `Du hast dein Kontingent von ${INVITE_LIMITS.maxPer30d} Einladungen in 30 Tagen ausgeschöpft.`,
        canRequestAdminApproval: true,
        blockedReason: `30-Tage-Kontingent (${INVITE_LIMITS.maxPer30d}/30d) erreicht`,
      };
    }
    if (quota.openPending >= INVITE_LIMITS.maxOpenPending) {
      return {
        ok: false,
        status: 429,
        error: `Maximal ${INVITE_LIMITS.maxOpenPending} offene Einladungen gleichzeitig. Warte auf eine Registrierung, ziehe eine offene Einladung zurück oder bitte den Admin um Freigabe.`,
        canRequestAdminApproval: true,
        blockedReason: `Max. ${INVITE_LIMITS.maxOpenPending} offene Einladungen erreicht`,
      };
    }
  }

  return { ok: true, quota };
}

async function upsertWhitelistInviteRecord(params: {
  emailLower: string;
  inviterId: string;
  inviterName: string;
  inviterEmailLower: string;
  expiresAt: Date | null;
  now: Date;
}): Promise<{ ok: true; entry: AppWhitelistEntry } | { ok: false; status: number; error: string }> {
  const { emailLower, inviterId, inviterName, inviterEmailLower, expiresAt, now } = params;

  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const existingWl = await prisma.whitelistedEmail.findUnique({ where: { email: emailLower } });
    if (existingWl) {
      const updated = await prisma.whitelistedEmail.update({
        where: { email: emailLower },
        data: {
          invitedByUserId: inviterId,
          invitedByName: inviterName,
          invitedByEmail: inviterEmailLower,
          expiresAt,
          acceptedAt: null,
          revokedAt: null,
          createdAt: now,
        },
      });
      return { ok: true, entry: mapWhitelistEntry(updated, new Set()) };
    }

    try {
      const created = await prisma.whitelistedEmail.create({
        data: {
          email: emailLower,
          invitedByUserId: inviterId,
          invitedByName: inviterName,
          invitedByEmail: inviterEmailLower,
          expiresAt,
        },
      });
      return { ok: true, entry: mapWhitelistEntry(created, new Set()) };
    } catch (err: any) {
      if (err?.code === "P2002") {
        return {
          ok: false,
          status: 409,
          error: "Diese E-Mail-Adresse wurde bereits eingeladen und ist aktiv.",
        };
      }
      throw err;
    }
  }

  const db = readLocalDb();
  const existingWl = db.whitelist.find((w) => w.email.toLowerCase() === emailLower);
  if (existingWl) {
    existingWl.invitedByUserId = inviterId;
    existingWl.invitedByName = inviterName;
    existingWl.invitedByEmail = inviterEmailLower;
    existingWl.expiresAt = expiresAt ? expiresAt.toISOString() : null;
    existingWl.acceptedAt = null;
    existingWl.revokedAt = null;
    existingWl.createdAt = now.toISOString();
    writeLocalDb(db);
    return { ok: true, entry: mapWhitelistEntry(existingWl, new Set()) };
  }

  const entry: AppWhitelistEntry = {
    id: `wl_${Date.now()}`,
    email: emailLower,
    invitedByUserId: inviterId,
    invitedByName: inviterName,
    invitedByEmail: inviterEmailLower,
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    acceptedAt: null,
    revokedAt: null,
    createdAt: now.toISOString(),
    isRegistered: false,
  };
  db.whitelist.unshift(entry);
  writeLocalDb(db);
  return { ok: true, entry };
}

export async function createUserInvite(params: {
  inviterId: string;
  inviterName: string;
  inviterEmail: string;
  inviterIsAdmin: boolean;
  targetEmail: string;
}): Promise<
  | { success: true; entry: AppWhitelistEntry; quota: UserInviteQuota }
  | { success: false; status: number; error: string; canRequestAdminApproval?: boolean }
> {
  const emailLower = params.targetEmail.toLowerCase().trim();
  const now = new Date();
  const nowMs = now.getTime();

  const eligibility = await evaluateUserInviteEligibility({
    inviterId: params.inviterId,
    inviterEmail: params.inviterEmail,
    inviterIsAdmin: params.inviterIsAdmin,
    emailLower,
    nowMs,
  });

  if (!eligibility.ok) {
    return {
      success: false,
      status: eligibility.status,
      error: eligibility.error,
      canRequestAdminApproval: eligibility.canRequestAdminApproval,
    };
  }

  const expiresAt = params.inviterIsAdmin
    ? null
    : new Date(nowMs + INVITE_LIMITS.inviteTtlDays * 24 * 60 * 60 * 1000);

  const saved = await upsertWhitelistInviteRecord({
    emailLower,
    inviterId: params.inviterId,
    inviterName: params.inviterName,
    inviterEmailLower: params.inviterEmail.toLowerCase().trim(),
    expiresAt,
    now,
  });

  if (!saved.ok) {
    return { success: false, status: saved.status, error: saved.error };
  }

  return {
    success: true,
    entry: saved.entry,
    quota: {
      ...eligibility.quota,
      used24h: eligibility.quota.used24h + 1,
      used30d: eligibility.quota.used30d + 1,
      openPending: eligibility.quota.openPending + 1,
    },
  };
}

function mapInviteApprovalRequest(r: any): AppInviteApprovalRequest {
  return {
    id: r.id,
    targetEmail: r.targetEmail,
    requesterUserId: r.requesterUserId,
    requesterName: r.requesterName,
    requesterEmail: r.requesterEmail,
    blockedReason: r.blockedReason,
    status: r.status as "PENDING" | "APPROVED" | "REJECTED",
    reviewedByUserId: r.reviewedByUserId ?? null,
    reviewedAt: r.reviewedAt ? toIsoString(r.reviewedAt) : null,
    createdAt: toIsoString(r.createdAt),
  };
}

export async function getInviteApprovalRequests(options?: {
  requesterUserId?: string;
}): Promise<AppInviteApprovalRequest[]> {
  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const rows = await prisma.inviteApprovalRequest.findMany({
      where: options?.requesterUserId ? { requesterUserId: options.requesterUserId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map(mapInviteApprovalRequest);
  }

  const db = readLocalDb();
  const list = db.inviteApprovalRequests || [];
  return (options?.requesterUserId
    ? list.filter((r) => r.requesterUserId === options.requesterUserId)
    : list
  ).slice(0, 50);
}

export async function createInviteApprovalRequest(params: {
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterIsAdmin: boolean;
  targetEmail: string;
}): Promise<
  | { success: true; request: AppInviteApprovalRequest }
  | { success: false; status: number; error: string }
> {
  const emailLower = params.targetEmail.toLowerCase().trim();
  const now = new Date();
  const nowMs = now.getTime();
  const since24h = new Date(nowMs - 24 * 60 * 60 * 1000);

  // Re-evaluate server-side so blocked reason cannot be spoofed and banned/active emails are rejected
  const eligibility = await evaluateUserInviteEligibility({
    inviterId: params.requesterId,
    inviterEmail: params.requesterEmail,
    inviterIsAdmin: params.requesterIsAdmin,
    emailLower,
    nowMs,
  });

  if (eligibility.ok) {
    return {
      success: false,
      status: 400,
      error: "Du kannst diese E-Mail direkt einladen — eine Admin-Freigabe ist nicht nötig.",
    };
  }
  if (!eligibility.canRequestAdminApproval) {
    return { success: false, status: eligibility.status, error: eligibility.error };
  }

  const blockedReason = eligibility.blockedReason || eligibility.error.slice(0, 160);

  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const [existingForEmail, recentCount, pendingCount] = await Promise.all([
      prisma.inviteApprovalRequest.findFirst({
        where: { targetEmail: emailLower, status: "PENDING" },
        select: { id: true },
      }),
      prisma.inviteApprovalRequest.count({
        where: { requesterUserId: params.requesterId, createdAt: { gte: since24h } },
      }),
      prisma.inviteApprovalRequest.count({
        where: { requesterUserId: params.requesterId, status: "PENDING" },
      }),
    ]);

    if (existingForEmail) {
      return {
        success: false,
        status: 409,
        error: "Für diese E-Mail liegt bereits eine offene Freigabe-Anfrage beim Admin vor.",
      };
    }
    if (recentCount >= 3 || pendingCount >= 5) {
      return {
        success: false,
        status: 429,
        error: "Du hast das Limit für Admin-Freigabe-Anfragen erreicht. Bitte warte auf die Rückmeldung des Admins.",
      };
    }

    const created = await prisma.inviteApprovalRequest.create({
      data: {
        targetEmail: emailLower,
        requesterUserId: params.requesterId,
        requesterName: params.requesterName,
        requesterEmail: params.requesterEmail.toLowerCase().trim(),
        blockedReason,
        status: "PENDING",
      },
    });
    return { success: true, request: mapInviteApprovalRequest(created) };
  }

  const db = readLocalDb();
  if (!db.inviteApprovalRequests) db.inviteApprovalRequests = [];
  if (db.inviteApprovalRequests.some((r) => r.targetEmail === emailLower && r.status === "PENDING")) {
    return {
      success: false,
      status: 409,
      error: "Für diese E-Mail liegt bereits eine offene Freigabe-Anfrage beim Admin vor.",
    };
  }
  const recentCount = db.inviteApprovalRequests.filter(
    (r) => r.requesterUserId === params.requesterId && new Date(r.createdAt).getTime() >= since24h.getTime()
  ).length;
  const pendingCount = db.inviteApprovalRequests.filter(
    (r) => r.requesterUserId === params.requesterId && r.status === "PENDING"
  ).length;
  if (recentCount >= 3 || pendingCount >= 5) {
    return {
      success: false,
      status: 429,
      error: "Du hast das Limit für Admin-Freigabe-Anfragen erreicht. Bitte warte auf die Rückmeldung des Admins.",
    };
  }

  const created: AppInviteApprovalRequest = {
    id: `iar_${Date.now()}`,
    targetEmail: emailLower,
    requesterUserId: params.requesterId,
    requesterName: params.requesterName,
    requesterEmail: params.requesterEmail.toLowerCase().trim(),
    blockedReason,
    status: "PENDING",
    reviewedByUserId: null,
    reviewedAt: null,
    createdAt: now.toISOString(),
  };
  db.inviteApprovalRequests.unshift(created);
  writeLocalDb(db);
  return { success: true, request: created };
}

export async function reviewInviteApprovalRequest(params: {
  requestId: string;
  adminUserId: string;
  action: "APPROVE" | "REJECT";
}): Promise<
  | { success: true; request: AppInviteApprovalRequest; entry?: AppWhitelistEntry }
  | { success: false; status: number; error: string }
> {
  const cleanId = params.requestId.trim();
  if (!cleanId) return { success: false, status: 400, error: "Anfrage-ID fehlt." };
  const now = new Date();

  let reqRecord: AppInviteApprovalRequest | null = null;
  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const raw = await prisma.inviteApprovalRequest.findUnique({ where: { id: cleanId } });
    reqRecord = raw ? mapInviteApprovalRequest(raw) : null;
  } else {
    const db = readLocalDb();
    reqRecord = (db.inviteApprovalRequests || []).find((r) => r.id === cleanId) || null;
  }

  if (!reqRecord) {
    return { success: false, status: 404, error: "Freigabe-Anfrage nicht gefunden." };
  }
  if (reqRecord.status !== "PENDING") {
    return { success: false, status: 400, error: "Diese Anfrage wurde bereits bearbeitet." };
  }

  let approvedEntry: AppWhitelistEntry | undefined;
  if (params.action === "APPROVE") {
    const existingUser = await findUserByEmail(reqRecord.targetEmail);
    if (existingUser?.isBanned) {
      return {
        success: false,
        status: 400,
        error: "Diese E-Mail gehört zu einem gesperrten Nutzer. Entsperre ihn zuerst in der Nutzer-Übersicht.",
      };
    }
    if (existingUser) {
      return { success: false, status: 409, error: "Diese Person ist bereits registriert." };
    }

    const saved = await upsertWhitelistInviteRecord({
      emailLower: reqRecord.targetEmail.toLowerCase().trim(),
      inviterId: reqRecord.requesterUserId,
      inviterName: reqRecord.requesterName,
      inviterEmailLower: reqRecord.requesterEmail.toLowerCase().trim(),
      expiresAt: null, // Admin explicitly approved this invite
      now,
    });
    if (!saved.ok) {
      return { success: false, status: saved.status, error: saved.error };
    }
    approvedEntry = saved.entry;
  }

  const nextStatus = params.action === "APPROVE" ? "APPROVED" : "REJECTED";
  if (await isPostgresAvailable()) {
    const updated = await prisma.inviteApprovalRequest.update({
      where: { id: cleanId },
      data: {
        status: nextStatus,
        reviewedByUserId: params.adminUserId,
        reviewedAt: now,
      },
    });
    return { success: true, request: mapInviteApprovalRequest(updated), entry: approvedEntry };
  }

  const db = readLocalDb();
  const item = (db.inviteApprovalRequests || []).find((r) => r.id === cleanId);
  if (item) {
    item.status = nextStatus;
    item.reviewedByUserId = params.adminUserId;
    item.reviewedAt = now.toISOString();
    writeLocalDb(db);
    return { success: true, request: item, entry: approvedEntry };
  }
  return { success: false, status: 404, error: "Freigabe-Anfrage nicht gefunden." };
}

export async function revokeUserInvite(
  userId: string,
  inviteId: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  const cleanId = inviteId.trim();
  if (!cleanId) return { success: false, status: 400, error: "Einladungs-ID fehlt." };
  const now = new Date();

  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const entry = await prisma.whitelistedEmail.findUnique({ where: { id: cleanId } });
    if (!entry || entry.invitedByUserId !== userId || entry.revokedAt) {
      return { success: false, status: 404, error: "Einladung nicht gefunden." };
    }
    const registered = await prisma.user.findUnique({
      where: { email: entry.email.toLowerCase() },
      select: { id: true },
    });
    if (entry.acceptedAt || registered) {
      return {
        success: false,
        status: 400,
        error: "Diese Person hat sich bereits registriert. Die Einladung kann nicht mehr zurückgezogen werden.",
      };
    }
    await prisma.whitelistedEmail.update({
      where: { id: cleanId },
      data: { revokedAt: now },
    });
    return { success: true };
  }

  const db = readLocalDb();
  const entry = db.whitelist.find((w) => w.id === cleanId && w.invitedByUserId === userId && !w.revokedAt);
  if (!entry) return { success: false, status: 404, error: "Einladung nicht gefunden." };
  const registered = db.users.some((u) => u.email.toLowerCase() === entry.email.toLowerCase());
  if (entry.acceptedAt || registered) {
    return {
      success: false,
      status: 400,
      error: "Diese Person hat sich bereits registriert. Die Einladung kann nicht mehr zurückgezogen werden.",
    };
  }
  entry.revokedAt = now.toISOString();
  writeLocalDb(db);
  return { success: true };
}

export async function getAdminNotificationEmails(): Promise<string[]> {
  const emails = new Set<string>([SUPER_ADMIN_EMAIL]);
  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isBanned: false },
      select: { email: true },
    });
    for (const a of admins) {
      if (a.email) emails.add(a.email.toLowerCase().trim());
    }
    return Array.from(emails);
  }
  const db = readLocalDb();
  for (const u of db.users) {
    if (u.role === "ADMIN" && !u.isBanned && u.email) {
      emails.add(u.email.toLowerCase().trim());
    }
  }
  return Array.from(emails);
}

export async function setUserBanStatus(params: {
  targetUserId: string;
  adminUserId: string;
  adminEmail: string;
  isBanned: boolean;
  reason?: string | null;
}): Promise<
  | { success: true; user: AppUser; revokedInvitesCount: number }
  | { success: false; status: number; error: string }
> {
  const target = await findUserById(params.targetUserId);
  if (!target) {
    return { success: false, status: 404, error: "Benutzer nicht gefunden." };
  }
  const targetEmailLower = target.email.toLowerCase().trim();
  const actingIsSuperAdmin = params.adminEmail.toLowerCase().trim() === SUPER_ADMIN_EMAIL;

  if (targetEmailLower === SUPER_ADMIN_EMAIL) {
    return {
      success: false,
      status: 403,
      error: "Der Super-Admin (lukasreinle0@gmail.com) kann niemals gesperrt werden.",
    };
  }
  if (target.id === params.adminUserId) {
    return { success: false, status: 400, error: "Du kannst dich nicht selbst sperren." };
  }
  if (target.role === "ADMIN" && !actingIsSuperAdmin) {
    return {
      success: false,
      status: 403,
      error: "Nur der Super-Admin (lukasreinle0@gmail.com) kann andere Admins sperren.",
    };
  }

  const cleanReason = params.isBanned && params.reason ? String(params.reason).trim().slice(0, 300) || null : null;
  const now = new Date();
  let revokedInvitesCount = 0;

  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const updated = await prisma.user.update({
      where: { id: target.id },
      data: {
        isBanned: params.isBanned,
        bannedAt: params.isBanned ? now : null,
        banReason: cleanReason,
      },
    });

    if (params.isBanned) {
      const [revoked] = await Promise.all([
        prisma.whitelistedEmail.updateMany({
          where: {
            invitedByUserId: target.id,
            acceptedAt: null,
            revokedAt: null,
          },
          data: { revokedAt: now },
        }),
        prisma.inviteApprovalRequest.updateMany({
          where: { requesterUserId: target.id, status: "PENDING" },
          data: {
            status: "REJECTED",
            reviewedByUserId: params.adminUserId,
            reviewedAt: now,
          },
        }),
      ]);
      revokedInvitesCount = revoked.count;
    } else {
      await addEmailToWhitelist(target.email);
    }

    return { success: true, user: mapPrismaUser(updated), revokedInvitesCount };
  }

  const db = readLocalDb();
  const localUser = db.users.find((u) => u.id === target.id);
  if (!localUser) return { success: false, status: 404, error: "Benutzer nicht gefunden." };
  localUser.isBanned = params.isBanned;
  localUser.bannedAt = params.isBanned ? now.toISOString() : null;
  localUser.banReason = cleanReason;

  if (params.isBanned) {
    for (const w of db.whitelist) {
      if (w.invitedByUserId === target.id && !w.acceptedAt && !w.revokedAt) {
        w.revokedAt = now.toISOString();
        revokedInvitesCount++;
      }
    }
    for (const r of db.inviteApprovalRequests || []) {
      if (r.requesterUserId === target.id && r.status === "PENDING") {
        r.status = "REJECTED";
        r.reviewedByUserId = params.adminUserId;
        r.reviewedAt = now.toISOString();
      }
    }
  }
  writeLocalDb(db);
  if (!params.isBanned) {
    await addEmailToWhitelist(target.email);
  }
  return { success: true, user: localUser, revokedInvitesCount };
}

// --- Friendships & Access Control ---

export async function getAcceptedFriendIds(userId: string): Promise<string[]> {
  if (await isPostgresAvailable()) {
    try {
      const friendships = await prisma.friendship.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ userId }, { friendId: userId }],
        },
      });
      const ids = new Set<string>();
      friendships.forEach((f) => {
        if (f.userId === userId) ids.add(f.friendId);
        else ids.add(f.userId);
      });
      return Array.from(ids);
    } catch {
      // fallback
    }
  }

  const db = readLocalDb();
  const ids = new Set<string>();
  (db.friendships || []).forEach((f) => {
    if (f.status === "ACCEPTED") {
      if (f.userId === userId) ids.add(f.friendId);
      else if (f.friendId === userId) ids.add(f.userId);
    }
  });
  return Array.from(ids);
}

export async function getUserFriendRequests(userId: string) {
  if (await isPostgresAvailable()) {
    try {
      const [received, sent] = await Promise.all([
        prisma.friendship.findMany({
          where: { friendId: userId, status: "PENDING" },
          include: { user: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.friendship.findMany({
          where: { userId, status: "PENDING" },
          include: { friend: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return {
        pendingReceived: received
          .filter((r) => !r.user.isBanned)
          .map((r) => ({
            requestId: r.id,
            user: {
              id: r.user.id,
              name: r.user.name,
              email: r.user.email,
              image: r.user.image,
            },
            createdAt: r.createdAt.toISOString(),
          })),
        pendingSent: sent
          .filter((s) => !s.friend.isBanned)
          .map((s) => ({
            requestId: s.id,
            user: {
              id: s.friend.id,
              name: s.friend.name,
              email: s.friend.email,
              image: s.friend.image,
            },
            createdAt: s.createdAt.toISOString(),
          })),
      };
    } catch {
      // fallback
    }
  }

  const db = readLocalDb();
  const friendships = db.friendships || [];

  const pendingReceived = friendships
    .filter((f) => f.friendId === userId && f.status === "PENDING")
    .flatMap((f) => {
      const u = db.users.find((user) => user.id === f.userId);
      if (u?.isBanned) return [];
      return [
        {
          requestId: f.id,
          user: u
            ? { id: u.id, name: u.name, email: u.email, image: u.image }
            : { id: f.userId, name: "Unbekannt", email: "", image: null },
          createdAt: f.createdAt,
        },
      ];
    });

  const pendingSent = friendships
    .filter((f) => f.userId === userId && f.status === "PENDING")
    .flatMap((f) => {
      const u = db.users.find((user) => user.id === f.friendId);
      if (u?.isBanned) return [];
      return [
        {
          requestId: f.id,
          user: u
            ? { id: u.id, name: u.name, email: u.email, image: u.image }
            : { id: f.friendId, name: "Unbekannt", email: "", image: null },
          createdAt: f.createdAt,
        },
      ];
    });

  return { pendingReceived, pendingSent };
}

export async function sendFriendRequest(requesterId: string, targetIdentifier: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const cleanTarget = targetIdentifier.trim().toLowerCase();
  if (!cleanTarget) {
    return { success: false, error: "Bitte gib eine E-Mail-Adresse oder einen Namen ein." };
  }

  if (await isPostgresAvailable()) {
    try {
      await ensureInviteAndModerationSchema();
      const targetUser = await prisma.user.findFirst({
        where: {
          isBanned: false,
          OR: [
            { email: { equals: cleanTarget, mode: "insensitive" } },
            { name: { equals: cleanTarget, mode: "insensitive" } },
          ],
        },
      });

      if (!targetUser) {
        return { success: false, error: `Kein Nutzer mit "${targetIdentifier}" gefunden.` };
      }
      if (targetUser.id === requesterId) {
        return { success: false, error: "Du kannst dir nicht selbst eine Anfrage schicken." };
      }

      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: requesterId, friendId: targetUser.id },
            { userId: targetUser.id, friendId: requesterId },
          ],
        },
      });

      if (existing) {
        if (existing.status === "ACCEPTED") {
          return { success: false, error: `Du bist mit ${targetUser.name} bereits befreundet!` };
        }
        if (existing.status === "PENDING") {
          if (existing.userId === requesterId) {
            return { success: false, error: `Du hast ${targetUser.name} bereits eine Anfrage gesendet.` };
          } else {
            await prisma.friendship.update({
              where: { id: existing.id },
              data: { status: "ACCEPTED" },
            });
            return {
              success: true,
              message: `Ihr seid jetzt befreundet! ${targetUser.name} hatte dir bereits eine Anfrage geschickt.`,
            };
          }
        }
      }

      await prisma.friendship.create({
        data: {
          userId: requesterId,
          friendId: targetUser.id,
          status: "PENDING",
        },
      });

      return {
        success: true,
        message: `Freundschaftsanfrage an ${targetUser.name} erfolgreich gesendet!`,
      };
    } catch {
      // fallback
    }
  }

  const db = readLocalDb();
  const targetUser = db.users.find(
    (u) => !u.isBanned && (u.email.toLowerCase() === cleanTarget || u.name.toLowerCase() === cleanTarget)
  );

  if (!targetUser) {
    return { success: false, error: `Kein Nutzer mit "${targetIdentifier}" gefunden.` };
  }
  if (targetUser.id === requesterId) {
    return { success: false, error: "Du kannst dir nicht selbst eine Anfrage schicken." };
  }

  if (!db.friendships) db.friendships = [];
  const existingIndex = db.friendships.findIndex(
    (f) =>
      (f.userId === requesterId && f.friendId === targetUser.id) ||
      (f.userId === targetUser.id && f.friendId === requesterId)
  );

  const now = new Date().toISOString();
  if (existingIndex >= 0) {
    const existing = db.friendships[existingIndex];
    if (existing.status === "ACCEPTED") {
      return { success: false, error: `Du bist mit ${targetUser.name} bereits befreundet!` };
    }
    if (existing.status === "PENDING") {
      if (existing.userId === requesterId) {
        return { success: false, error: `Du hast ${targetUser.name} bereits eine Anfrage gesendet.` };
      } else {
        existing.status = "ACCEPTED";
        existing.updatedAt = now;
        writeLocalDb(db);
        return {
          success: true,
          message: `Ihr seid jetzt befreundet! ${targetUser.name} hatte dir bereits eine Anfrage geschickt.`,
        };
      }
    }
  }

  db.friendships.unshift({
    id: `fs_${Date.now()}`,
    userId: requesterId,
    friendId: targetUser.id,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  });
  writeLocalDb(db);

  return {
    success: true,
    message: `Freundschaftsanfrage an ${targetUser.name} erfolgreich gesendet!`,
  };
}

export async function acceptFriendRequest(userId: string, requestId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (await isPostgresAvailable()) {
    try {
      const req = await prisma.friendship.findUnique({ where: { id: requestId } });
      if (!req || req.friendId !== userId) {
        return { success: false, error: "Anfrage nicht gefunden oder keine Berechtigung." };
      }
      await prisma.friendship.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });
      return { success: true };
    } catch {
      // fallback
    }
  }

  const db = readLocalDb();
  if (!db.friendships) db.friendships = [];
  const idx = db.friendships.findIndex((f) => f.id === requestId && f.friendId === userId);
  if (idx < 0) {
    return { success: false, error: "Anfrage nicht gefunden." };
  }

  db.friendships[idx].status = "ACCEPTED";
  db.friendships[idx].updatedAt = new Date().toISOString();
  writeLocalDb(db);
  return { success: true };
}

export async function declineFriendRequest(userId: string, requestId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (await isPostgresAvailable()) {
    try {
      await prisma.friendship.deleteMany({
        where: { id: requestId, friendId: userId },
      });
      return { success: true };
    } catch {
      // fallback
    }
  }

  const db = readLocalDb();
  if (!db.friendships) db.friendships = [];
  db.friendships = db.friendships.filter((f) => !(f.id === requestId && f.friendId === userId));
  writeLocalDb(db);
  return { success: true };
}

export async function removeFriendship(userId: string, targetUserId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (await isPostgresAvailable()) {
    try {
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId, friendId: targetUserId },
            { userId: targetUserId, friendId: userId },
          ],
        },
      });
      return { success: true };
    } catch {
      // fallback
    }
  }

  const db = readLocalDb();
  if (!db.friendships) db.friendships = [];
  db.friendships = db.friendships.filter(
    (f) =>
      !(
        (f.userId === userId && f.friendId === targetUserId) ||
        (f.userId === targetUserId && f.friendId === userId)
      )
  );
  writeLocalDb(db);
  return { success: true };
}

export async function searchUsersForFriendship(currentUserId: string, query: string) {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ || cleanQ.length < 2) return [];

  if (await isPostgresAvailable()) {
    try {
      await ensureInviteAndModerationSchema();
      const users = await prisma.user.findMany({
        where: {
          id: { not: currentUserId },
          isBanned: false,
          OR: [
            { name: { contains: cleanQ, mode: "insensitive" } },
            { email: { contains: cleanQ, mode: "insensitive" } },
          ],
        },
        take: 10,
      });

      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { userId: currentUserId, friendId: { in: users.map((u) => u.id) } },
            { friendId: currentUserId, userId: { in: users.map((u) => u.id) } },
          ],
        },
      });

      return users.map((u) => {
        const fs = friendships.find(
          (f) =>
            (f.userId === currentUserId && f.friendId === u.id) ||
            (f.friendId === currentUserId && f.userId === u.id)
        );

        let relationship: "NONE" | "FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED" = "NONE";
        let requestId: string | undefined = undefined;

        if (fs) {
          if (fs.status === "ACCEPTED") {
            relationship = "FRIENDS";
          } else if (fs.status === "PENDING") {
            if (fs.userId === currentUserId) {
              relationship = "REQUEST_SENT";
            } else {
              relationship = "REQUEST_RECEIVED";
              requestId = fs.id;
            }
          }
        }

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          image: u.image,
          relationship,
          requestId,
        };
      });
    } catch {
      // fallback
    }
  }

  const db = readLocalDb();
  const matchedUsers = db.users
    .filter(
      (u) =>
        u.id !== currentUserId &&
        !u.isBanned &&
        (u.name.toLowerCase().includes(cleanQ) || u.email.toLowerCase().includes(cleanQ))
    )
    .slice(0, 10);

  const friendships = db.friendships || [];

  return matchedUsers.map((u) => {
    const fs = friendships.find(
      (f) =>
        (f.userId === currentUserId && f.friendId === u.id) ||
        (f.friendId === currentUserId && f.userId === u.id)
    );

    let relationship: "NONE" | "FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED" = "NONE";
    let requestId: string | undefined = undefined;

    if (fs) {
      if (fs.status === "ACCEPTED") {
        relationship = "FRIENDS";
      } else if (fs.status === "PENDING") {
        if (fs.userId === currentUserId) {
          relationship = "REQUEST_SENT";
        } else {
          relationship = "REQUEST_RECEIVED";
          requestId = fs.id;
        }
      }
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      relationship,
      requestId,
    };
  });
}

export interface AppUserWithStats {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isBanned?: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
  invitedByUserId?: string | null;
  invitedByName?: string | null;
  subscriptions: string[];
  watchedCount: number;
  watchingCount: number;
  watchlistCount: number;
  ratedCount: number;
  avgRating: number | null;
  recommendationsCount: number;
  lastActivityAt: string;
  createdAt: string;
}

export interface AdminUserProfile {
  user: AppUserWithStats & {
    watchlistAlertsEnabled: boolean;
    isFriendWithAdmin: boolean;
  };
  mediaStatuses: AppMediaStatus[];
  recommendations: AppRecommendation[];
  customCollections: AppCustomCollection[];
  friendGroups: AppFriendGroup[];
  friends: Array<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  }>;
  invitedUsers?: Array<{
    id: string;
    name: string;
    email: string;
    isBanned: boolean;
    createdAt: string;
  }>;
}

function toIsoString(val: Date | string | null | undefined): string {
  if (val instanceof Date) return val.toISOString();
  return typeof val === "string" && val ? val : new Date().toISOString();
}

function computeUserActivityStats(
  createdAt: Date | string,
  mediaStatuses: Array<{
    status: string;
    mediaType: string;
    rating?: number | null;
    updatedAt?: Date | string;
  }>,
  recommendations: Array<{ createdAt?: Date | string }>
) {
  let watchedCount = 0;
  let watchingCount = 0;
  let watchlistCount = 0;
  let ratedCount = 0;
  let ratingSum = 0;
  let latestTs = new Date(createdAt).getTime() || 0;

  for (const m of mediaStatuses) {
    if (m.status === "WATCHED") watchedCount++;
    else if (m.status === "WATCHING" && m.mediaType === "tv") watchingCount++;
    else if (m.status === "WATCHLIST") watchlistCount++;

    if (typeof m.rating === "number" && m.rating > 0) {
      ratedCount++;
      ratingSum += m.rating;
    }
    if (m.updatedAt) {
      const ts = new Date(m.updatedAt).getTime();
      if (ts > latestTs) latestTs = ts;
    }
  }

  for (const r of recommendations) {
    if (r.createdAt) {
      const ts = new Date(r.createdAt).getTime();
      if (ts > latestTs) latestTs = ts;
    }
  }

  return {
    watchedCount,
    watchingCount,
    watchlistCount,
    ratedCount,
    avgRating: ratedCount > 0 ? Math.round((ratingSum / ratedCount) * 10) / 10 : null,
    recommendationsCount: recommendations.length,
    lastActivityAt: latestTs > 0 ? new Date(latestTs).toISOString() : toIsoString(createdAt),
  };
}

function mapRawMediaStatus(
  s: any,
  fallbackUser?: { name: string; image?: string | null }
): AppMediaStatus {
  return {
    id: s.id,
    userId: s.userId,
    userName: s.user?.name ?? fallbackUser?.name ?? s.userName ?? "Nutzer",
    userImage: s.user?.image ?? fallbackUser?.image ?? s.userImage ?? null,
    tmdbId: s.tmdbId,
    mediaType: s.mediaType as "movie" | "tv",
    title: s.title,
    posterPath: s.posterPath ?? null,
    releaseYear: s.releaseYear ?? null,
    status: s.status as "WATCHED" | "WATCHLIST" | "WATCHING",
    rating: s.rating ?? null,
    watchedSeasons: s.watchedSeasons ? parseJsonSafe<number[] | null>(s.watchedSeasons, null) : null,
    totalSeasons: s.totalSeasons ?? null,
    updatedAt: toIsoString(s.updatedAt),
  };
}

function mapRawRecommendation(
  r: any,
  fallbackUser?: { name: string; image?: string | null }
): AppRecommendation {
  return {
    id: r.id,
    userId: r.userId,
    userName: r.user?.name ?? fallbackUser?.name ?? r.userName ?? "Nutzer",
    userImage: r.user?.image ?? fallbackUser?.image ?? r.userImage ?? null,
    tmdbId: r.tmdbId,
    mediaType: r.mediaType as "movie" | "tv",
    title: r.title,
    posterPath: r.posterPath ?? null,
    backdropPath: r.backdropPath ?? null,
    releaseYear: r.releaseYear ?? null,
    rating: r.rating,
    comment: r.comment,
    tags: Array.isArray(r.tags) ? r.tags : r.tags ? String(r.tags).split(",").filter(Boolean) : [],
    upvoterIds: Array.isArray(r.upvoterIds)
      ? r.upvoterIds
      : Array.isArray(r.upvotes)
      ? r.upvotes.map((u: any) => u.userId)
      : [],
    targetType: r.targetType || "ALL",
    targetNames: parseStringList(r.targetNames),
    targetGroupIds: parseStringList(r.targetGroupIds),
    targetUserIds: parseStringList(r.targetUserIds),
    replies: Array.isArray(r.replies)
      ? r.replies
          .map((rep: any) => ({
            id: rep.id,
            recommendationId: rep.recommendationId,
            userId: rep.userId,
            userName: rep.userName,
            userImage: rep.userImage ?? null,
            text: rep.text,
            createdAt: toIsoString(rep.createdAt),
          }))
          .sort(
            (a: AppRecommendationReply, b: AppRecommendationReply) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
      : [],
    createdAt: toIsoString(r.createdAt),
  };
}

function buildAdminUserProfile(params: {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
    isBanned?: boolean;
    bannedAt?: Date | string | null;
    banReason?: string | null;
    invitedByUserId?: string | null;
    invitedByName?: string | null;
    subscriptions: string[];
    watchlistAlertsEnabled?: boolean | null;
    createdAt: Date | string;
  };
  adminUserId: string;
  acceptedFriendIds: string[];
  mediaStatuses: AppMediaStatus[];
  recommendations: AppRecommendation[];
  customCollections: AppCustomCollection[];
  friendGroups: AppFriendGroup[];
  friends: Array<{
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
  }>;
  invitedUsers?: Array<{
    id: string;
    name: string;
    email: string;
    isBanned?: boolean;
    createdAt: Date | string;
  }>;
}): AdminUserProfile {
  const {
    user,
    adminUserId,
    acceptedFriendIds,
    mediaStatuses,
    recommendations,
    customCollections,
    friendGroups,
    friends,
    invitedUsers = [],
  } = params;
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      role: user.role,
      isBanned: Boolean(user.isBanned),
      bannedAt: user.bannedAt ? toIsoString(user.bannedAt) : null,
      banReason: user.banReason ?? null,
      invitedByUserId: user.invitedByUserId ?? null,
      invitedByName: user.invitedByName ?? null,
      subscriptions: user.subscriptions,
      watchlistAlertsEnabled: user.watchlistAlertsEnabled ?? true,
      createdAt: toIsoString(user.createdAt),
      isFriendWithAdmin: user.id === adminUserId || acceptedFriendIds.includes(adminUserId),
      ...computeUserActivityStats(user.createdAt, mediaStatuses, recommendations),
    },
    mediaStatuses,
    recommendations,
    customCollections,
    friendGroups,
    friends: friends.map((f) => ({
      id: f.id,
      name: f.name,
      email: f.email,
      image: f.image ?? null,
      role: f.role,
    })),
    invitedUsers: invitedUsers.map((iu) => ({
      id: iu.id,
      name: iu.name,
      email: iu.email,
      isBanned: Boolean(iu.isBanned),
      createdAt: toIsoString(iu.createdAt),
    })),
  };
}

export async function getAllFriendsWithStats(
  currentUserId?: string,
  options?: { includeAllForAdmin?: boolean }
): Promise<AppUserWithStats[]> {
  if (!currentUserId && !options?.includeAllForAdmin) {
    return [];
  }
  const forAdmin = Boolean(options?.includeAllForAdmin);
  let friendIdSet: Set<string> | null = null;
  if (currentUserId) {
    const ids = await getAcceptedFriendIds(currentUserId);
    friendIdSet = new Set(ids);
  }

  if (await isPostgresAvailable()) {
    await ensureInviteAndModerationSchema();
    const users = await prisma.user.findMany({
      where: {
        ...(friendIdSet ? { id: { in: Array.from(friendIdSet) } } : {}),
        ...(forAdmin ? {} : { isBanned: false }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        invitedByUserId: true,
        subscriptions: true,
        createdAt: true,
        mediaStatuses: {
          select: { status: true, mediaType: true, rating: true, updatedAt: true },
        },
        recommendations: {
          select: { createdAt: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    const nameById = new Map(users.map((u) => [u.id, u.name]));
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image ?? null,
      role: u.role,
      ...(forAdmin
        ? {
            isBanned: Boolean(u.isBanned),
            bannedAt: u.bannedAt ? u.bannedAt.toISOString() : null,
            banReason: u.banReason ?? null,
            invitedByUserId: u.invitedByUserId ?? null,
            invitedByName: u.invitedByUserId ? nameById.get(u.invitedByUserId) ?? null : null,
          }
        : {}),
      subscriptions: parseSubscriptions(u.subscriptions),
      ...computeUserActivityStats(u.createdAt, u.mediaStatuses, u.recommendations),
      createdAt: u.createdAt.toISOString(),
    }));
  }

  const db = readLocalDb();
  const nameById = new Map(db.users.map((u) => [u.id, u.name]));
  const filteredUsers = db.users.filter((u) => {
    if (friendIdSet && !friendIdSet.has(u.id)) return false;
    if (!forAdmin && u.isBanned) return false;
    return true;
  });

  return filteredUsers.map((u) => {
    const userStatuses = db.mediaStatuses.filter((m) => m.userId === u.id);
    const userRecs = db.recommendations.filter((r) => r.userId === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image ?? null,
      role: u.role,
      ...(forAdmin
        ? {
            isBanned: Boolean(u.isBanned),
            bannedAt: u.bannedAt ?? null,
            banReason: u.banReason ?? null,
            invitedByUserId: u.invitedByUserId ?? null,
            invitedByName: u.invitedByUserId ? nameById.get(u.invitedByUserId) ?? null : null,
          }
        : {}),
      subscriptions: u.subscriptions || ["netflix", "prime", "disney"],
      ...computeUserActivityStats(u.createdAt, userStatuses, userRecs),
      createdAt: u.createdAt,
    };
  });
}

export async function getAdminUserProfile(
  targetIdentifier: string,
  adminUserId: string
): Promise<AdminUserProfile | null> {
  const cleanTarget = targetIdentifier.trim();
  if (!cleanTarget) return null;
  const targetLower = cleanTarget.toLowerCase();

  if (await isPostgresAvailable()) {
    await Promise.all([
      ensureMediaStatusColumns(),
      ensureWatchlistAlertSchema(),
      ensureInviteAndModerationSchema(),
    ]);

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: cleanTarget },
          { email: { equals: cleanTarget, mode: "insensitive" } },
          { name: { equals: cleanTarget, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBanned: true,
        bannedAt: true,
        banReason: true,
        invitedByUserId: true,
        subscriptions: true,
        watchlistAlertsEnabled: true,
        createdAt: true,
      },
    });

    if (!dbUser) return null;

    const isSelf = dbUser.id === adminUserId;
    const [statuses, recs, rawCollections, acceptedFriendIds, friendGroups, inviter, invitedUsers] =
      await Promise.all([
        prisma.mediaStatus.findMany({
          where: { userId: dbUser.id },
          orderBy: { updatedAt: "desc" },
        }),
        (prisma as any).recommendation
          .findMany({
            where: { userId: dbUser.id },
            include: { upvotes: true, replies: true },
            orderBy: { createdAt: "desc" },
          })
          .catch(() =>
            prisma.recommendation.findMany({
              where: { userId: dbUser.id },
              include: { upvotes: true },
              orderBy: { createdAt: "desc" },
            })
          ),
        (prisma as any).customCollection
          .findMany({
            where: isSelf ? { ownerId: dbUser.id } : { ownerId: dbUser.id, visibility: { not: "PRIVATE" } },
            orderBy: { updatedAt: "desc" },
          })
          .catch(() => []),
        getAcceptedFriendIds(dbUser.id),
        getUserFriendGroups(dbUser.id, dbUser.name).catch(() => []),
        dbUser.invitedByUserId
          ? prisma.user.findUnique({
              where: { id: dbUser.invitedByUserId },
              select: { name: true },
            })
          : Promise.resolve(null),
        prisma.user.findMany({
          where: { invitedByUserId: dbUser.id },
          select: { id: true, name: true, email: true, isBanned: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    const friends =
      acceptedFriendIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: acceptedFriendIds } },
            select: { id: true, name: true, email: true, image: true, role: true },
            orderBy: { name: "asc" },
          })
        : [];

    const fallbackUser = { name: dbUser.name, image: dbUser.image };
    return buildAdminUserProfile({
      user: {
        ...dbUser,
        invitedByName: inviter?.name ?? null,
        subscriptions: parseSubscriptions(dbUser.subscriptions),
      },
      adminUserId,
      acceptedFriendIds,
      mediaStatuses: statuses.map((s: any) => mapRawMediaStatus(s, fallbackUser)),
      recommendations: recs.map((r: any) => mapRawRecommendation(r, fallbackUser)),
      customCollections: rawCollections.map((c: any) =>
        mapRawCustomCollection({ ...c, owner: fallbackUser })
      ),
      friendGroups,
      friends,
      invitedUsers,
    });
  }

  const db = readLocalDb();
  const localUser = db.users.find(
    (u) =>
      u.id === cleanTarget ||
      u.email.toLowerCase() === targetLower ||
      u.name.toLowerCase() === targetLower
  );
  if (!localUser) return null;

  const [acceptedFriendIds, friendGroups] = await Promise.all([
    getAcceptedFriendIds(localUser.id),
    getUserFriendGroups(localUser.id, localUser.name),
  ]);

  const inviter = localUser.invitedByUserId
    ? db.users.find((u) => u.id === localUser.invitedByUserId)
    : null;
  const invitedUsers = db.users
    .filter((u) => u.invitedByUserId === localUser.id)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isBanned: Boolean(u.isBanned),
      createdAt: u.createdAt,
    }));

  const allReplies = db.recommendationReplies || [];
  const fallbackUser = { name: localUser.name, image: localUser.image ?? null };
  const isSelf = localUser.id === adminUserId;

  return buildAdminUserProfile({
    user: {
      ...localUser,
      invitedByName: inviter?.name ?? null,
      subscriptions: localUser.subscriptions || ["netflix", "prime", "disney"],
    },
    adminUserId,
    acceptedFriendIds,
    mediaStatuses: db.mediaStatuses
      .filter((s) => s.userId === localUser.id)
      .map((s) => mapRawMediaStatus(s, fallbackUser))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    recommendations: db.recommendations
      .filter((r) => r.userId === localUser.id)
      .map((r) =>
        mapRawRecommendation(
          { ...r, replies: allReplies.filter((rep) => rep.recommendationId === r.id) },
          fallbackUser
        )
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    customCollections: (db.customCollections || [])
      .filter((c) => c.ownerId === localUser.id && (isSelf || c.visibility !== "PRIVATE"))
      .map(mapRawCustomCollection),
    friendGroups,
    friends: db.users.filter((u) => acceptedFriendIds.includes(u.id)),
    invitedUsers,
  });
}

// --- Media Statuses & Recommendations ---

function parseStringList(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean);
    } catch {
      // ignore
    }
    return val
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

function isRecommendationVisibleToUser(
  rec: {
    userId: string;
    targetType?: string | null;
    targetNames?: string[];
    targetGroupIds?: string[];
    targetUserIds?: string[];
  },
  currentUserId?: string,
  currentUserName?: string,
  myGroupIds?: Set<string>,
  myGroupNames?: Set<string>
): boolean {
  const targetType = rec.targetType || "ALL";
  const targetNames = rec.targetNames || [];
  const targetGroupIds = rec.targetGroupIds || [];
  const targetUserIds = rec.targetUserIds || [];

  const isAll =
    targetType === "ALL" &&
    targetNames.length === 0 &&
    targetGroupIds.length === 0 &&
    targetUserIds.length === 0;

  if (!currentUserId) {
    return isAll;
  }

  // 1. Author always sees their own recommendations
  if (rec.userId === currentUserId) {
    return true;
  }

  // 2. Broadcast to all friends
  if (isAll) {
    return true;
  }

  // 3. User targeted directly by user ID
  if (targetUserIds.includes(currentUserId)) {
    return true;
  }

  // 4. User targeted directly by name or alias
  if (currentUserName && targetNames.some((t) => isSamePerson(t, currentUserName))) {
    return true;
  }

  // 5. Targeted to a group where the user is a member or owner
  if (myGroupIds && targetGroupIds.some((gid) => myGroupIds.has(gid))) {
    return true;
  }
  if (
    myGroupNames &&
    targetNames.some((t) => {
      const clean = t.replace(/^@/, "").toLowerCase();
      return myGroupNames.has(clean);
    })
  ) {
    return true;
  }

  return false;
}

let mediaStatusColumnsEnsured = false;
async function ensureMediaStatusColumns() {
  if (mediaStatusColumnsEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "MediaStatus" ADD COLUMN IF NOT EXISTS "watchedSeasons" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "MediaStatus" ADD COLUMN IF NOT EXISTS "totalSeasons" INTEGER;
    `);
    mediaStatusColumnsEnsured = true;
  } catch {
    // ignore
  }
}

export async function getAllCommunityData(
  currentUserId?: string,
  currentUserName?: string
): Promise<{
  mediaStatuses: AppMediaStatus[];
  recommendations: AppRecommendation[];
}> {
  if (!currentUserId) {
    return {
      mediaStatuses: [],
      recommendations: [],
    };
  }
  const friendIds = await getAcceptedFriendIds(currentUserId);
  const allowedUserIds = new Set([currentUserId, ...friendIds]);

  let myGroupIds: Set<string> | undefined;
  let myGroupNames: Set<string> | undefined;
  if (currentUserId) {
    try {
      const myGroups = await getUserFriendGroups(currentUserId, currentUserName);
      myGroupIds = new Set(myGroups.map((g) => g.id));
      myGroupNames = new Set(myGroups.map((g) => g.name.toLowerCase()));
    } catch {
      // ignore
    }
  }

  if (await isPostgresAvailable()) {
    await ensureMediaStatusColumns();
    let statuses: any[] = [];
    let recs: any[] = [];
    try {
      [statuses, recs] = await Promise.all([
        prisma.mediaStatus.findMany({
          where: allowedUserIds ? { userId: { in: Array.from(allowedUserIds) } } : undefined,
          include: { user: true },
          orderBy: { updatedAt: "desc" },
        }),
        (prisma as any).recommendation.findMany({
          where: allowedUserIds ? { userId: { in: Array.from(allowedUserIds) } } : undefined,
          include: { user: true, upvotes: true, replies: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);
    } catch {
      [statuses, recs] = await Promise.all([
        prisma.mediaStatus.findMany({
          where: allowedUserIds ? { userId: { in: Array.from(allowedUserIds) } } : undefined,
          include: { user: true },
          orderBy: { updatedAt: "desc" },
        }),
        prisma.recommendation.findMany({
          where: allowedUserIds ? { userId: { in: Array.from(allowedUserIds) } } : undefined,
          include: { user: true, upvotes: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);
    }

    const activeStatuses = statuses.filter(
      (s: any) => !s.user?.isBanned || s.userId === currentUserId
    );
    const mappedRecs: AppRecommendation[] = recs
      .filter((r: any) => !r.user?.isBanned || r.userId === currentUserId)
      .map((r: any) => mapRawRecommendation(r));

    const visibleRecs = mappedRecs.filter((r) =>
      isRecommendationVisibleToUser(r, currentUserId, currentUserName, myGroupIds, myGroupNames)
    );

    return {
      mediaStatuses: activeStatuses.map((s: any) => mapRawMediaStatus(s)),
      recommendations: visibleRecs,
    };
  }

  const db = readLocalDb();
  const bannedUserIds = new Set(db.users.filter((u) => u.isBanned).map((u) => u.id));
  const allReplies = db.recommendationReplies || [];
  const statuses = db.mediaStatuses.filter(
    (s) =>
      (!allowedUserIds || allowedUserIds.has(s.userId)) &&
      (!bannedUserIds.has(s.userId) || s.userId === currentUserId)
  );
  const rawRecs = db.recommendations.filter(
    (r) =>
      (!allowedUserIds || allowedUserIds.has(r.userId)) &&
      (!bannedUserIds.has(r.userId) || r.userId === currentUserId)
  );

  const visibleRecs = rawRecs
    .map((r) =>
      mapRawRecommendation({
        ...r,
        replies: allReplies.filter((rep) => rep.recommendationId === r.id),
      })
    )
    .filter((r) =>
      isRecommendationVisibleToUser(r, currentUserId, currentUserName, myGroupIds, myGroupNames)
    );

  return {
    mediaStatuses: statuses,
    recommendations: visibleRecs,
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
  status: "WATCHED" | "WATCHLIST" | "WATCHING" | "NONE";
  rating?: number | null;
  watchedSeasons?: number[] | null;
  totalSeasons?: number | null;
}) {
  // "WATCHING" is strictly reserved for TV series; never allow it on movies.
  const effectiveStatus =
    params.status === "WATCHING" && params.mediaType !== "tv" ? "WATCHED" : params.status;
  const normalizedParams = { ...params, status: effectiveStatus };

  if (await isPostgresAvailable()) {
    await ensureMediaStatusColumns();
    await ensureWatchlistAlertSchema();
    if (normalizedParams.status === "NONE") {
      await prisma.mediaStatus.deleteMany({
        where: {
          userId: normalizedParams.userId,
          tmdbId: normalizedParams.tmdbId,
          mediaType: normalizedParams.mediaType,
        },
      });
      return null;
    }

    try {
      const upsertData: any = {
        userId: normalizedParams.userId,
        tmdbId: normalizedParams.tmdbId,
        mediaType: normalizedParams.mediaType,
        title: normalizedParams.title,
        posterPath: normalizedParams.posterPath,
        releaseYear: normalizedParams.releaseYear,
        status: normalizedParams.status,
        rating: normalizedParams.rating ?? null,
      };
      if (normalizedParams.watchedSeasons !== undefined) {
        upsertData.watchedSeasons = normalizedParams.watchedSeasons ? JSON.stringify(normalizedParams.watchedSeasons) : null;
      }
      if (normalizedParams.totalSeasons !== undefined) {
        upsertData.totalSeasons = normalizedParams.totalSeasons;
      }

      const updateData: any = {
        status: normalizedParams.status,
        rating: normalizedParams.rating !== undefined ? normalizedParams.rating : undefined,
        title: normalizedParams.title,
        posterPath: normalizedParams.posterPath,
        releaseYear: normalizedParams.releaseYear,
        ...(normalizedParams.status === "WATCHLIST" ? { alertedAt: null } : {}),
      };
      if (normalizedParams.watchedSeasons !== undefined) {
        updateData.watchedSeasons = normalizedParams.watchedSeasons ? JSON.stringify(normalizedParams.watchedSeasons) : null;
      }
      if (normalizedParams.totalSeasons !== undefined) {
        updateData.totalSeasons = normalizedParams.totalSeasons;
      }

      const upserted = await prisma.mediaStatus.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId: normalizedParams.userId,
            tmdbId: normalizedParams.tmdbId,
            mediaType: normalizedParams.mediaType,
          },
        },
        update: updateData,
        create: upsertData,
      });
      if (normalizedParams.status === "WATCHLIST") {
        void seedSnapshotIfMissing(normalizedParams.tmdbId, normalizedParams.mediaType);
      }
      return upserted;
    } catch {
      // If table lacks new columns, retry with base fields
      const fallbackUpserted = await prisma.mediaStatus.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId: normalizedParams.userId,
            tmdbId: normalizedParams.tmdbId,
            mediaType: normalizedParams.mediaType,
          },
        },
        update: {
          status: normalizedParams.status,
          rating: normalizedParams.rating !== undefined ? normalizedParams.rating : undefined,
          title: normalizedParams.title,
          posterPath: normalizedParams.posterPath,
          releaseYear: normalizedParams.releaseYear,
        },
        create: {
          userId: normalizedParams.userId,
          tmdbId: normalizedParams.tmdbId,
          mediaType: normalizedParams.mediaType,
          title: normalizedParams.title,
          posterPath: normalizedParams.posterPath,
          releaseYear: normalizedParams.releaseYear,
          status: normalizedParams.status,
          rating: normalizedParams.rating ?? null,
        },
      });
      return fallbackUpserted;
    }
  }

  const db = readLocalDb();
  const idx = db.mediaStatuses.findIndex(
    (m) => m.userId === normalizedParams.userId && m.tmdbId === normalizedParams.tmdbId && m.mediaType === normalizedParams.mediaType
  );

  if (normalizedParams.status === "NONE") {
    if (idx !== -1) {
      db.mediaStatuses.splice(idx, 1);
      writeLocalDb(db);
    }
    return null;
  }

  const now = new Date().toISOString();
  if (idx !== -1) {
    db.mediaStatuses[idx].status = normalizedParams.status;
    if (normalizedParams.status === "WATCHLIST") db.mediaStatuses[idx].alertedAt = null;
    if (normalizedParams.rating !== undefined) db.mediaStatuses[idx].rating = normalizedParams.rating;
    if (normalizedParams.watchedSeasons !== undefined) db.mediaStatuses[idx].watchedSeasons = normalizedParams.watchedSeasons;
    if (normalizedParams.totalSeasons !== undefined) db.mediaStatuses[idx].totalSeasons = normalizedParams.totalSeasons;
    db.mediaStatuses[idx].updatedAt = now;
  } else {
    db.mediaStatuses.unshift({
      id: `ms_${Date.now()}`,
      userId: normalizedParams.userId,
      userName: normalizedParams.userName,
      userImage: normalizedParams.userImage,
      tmdbId: normalizedParams.tmdbId,
      mediaType: normalizedParams.mediaType,
      title: normalizedParams.title,
      posterPath: normalizedParams.posterPath,
      releaseYear: normalizedParams.releaseYear,
      status: normalizedParams.status,
      rating: normalizedParams.rating ?? null,
      watchedSeasons: normalizedParams.watchedSeasons ?? null,
      totalSeasons: normalizedParams.totalSeasons ?? null,
      updatedAt: now,
    });
  }
  writeLocalDb(db);
  if (normalizedParams.status === "WATCHLIST") {
    void seedSnapshotIfMissing(normalizedParams.tmdbId, normalizedParams.mediaType);
  }
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
  targetType?: "ALL" | "GROUPS" | "FRIENDS" | "CUSTOM" | string;
  targetNames?: string[];
  targetGroupIds?: string[];
  targetUserIds?: string[];
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

  const targetType = params.targetType || "ALL";
  const targetNames = params.targetNames || [];
  const targetGroupIds = params.targetGroupIds || [];
  const targetUserIds = params.targetUserIds || [];

  if (await isPostgresAvailable()) {
    try {
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
          targetType,
          targetNames: targetNames.length > 0 ? JSON.stringify(targetNames) : null,
          targetGroupIds: targetGroupIds.length > 0 ? JSON.stringify(targetGroupIds) : null,
          targetUserIds: targetUserIds.length > 0 ? JSON.stringify(targetUserIds) : null,
        },
      });
      return created;
    } catch (err) {
      console.warn("Could not save targeted fields to recommendation, falling back:", err);
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
    targetType,
    targetNames,
    targetGroupIds,
    targetUserIds,
    createdAt: new Date().toISOString(),
  };
  db.recommendations.unshift(newRec);
  writeLocalDb(db);
  return newRec;
}

export async function updateRecommendation(params: {
  recommendationId: string;
  userId: string;
  rating: number;
  comment: string;
  tags: string[];
  targetType?: "ALL" | "GROUPS" | "FRIENDS" | "CUSTOM" | string;
  targetNames?: string[];
  targetGroupIds?: string[];
  targetUserIds?: string[];
}): Promise<boolean> {
  const targetType = params.targetType || "ALL";
  const targetNames = params.targetNames || [];
  const targetGroupIds = params.targetGroupIds || [];
  const targetUserIds = params.targetUserIds || [];

  if (await isPostgresAvailable()) {
    try {
      const rec = await prisma.recommendation.findUnique({
        where: { id: params.recommendationId },
      });
      if (rec && rec.userId === params.userId) {
        await (prisma as any).recommendation.update({
          where: { id: params.recommendationId },
          data: {
            rating: params.rating,
            comment: params.comment.trim(),
            tags: params.tags.join(","),
            targetType,
            targetNames: targetNames.length > 0 ? JSON.stringify(targetNames) : null,
            targetGroupIds: targetGroupIds.length > 0 ? JSON.stringify(targetGroupIds) : null,
            targetUserIds: targetUserIds.length > 0 ? JSON.stringify(targetUserIds) : null,
          },
        });
        return true;
      }
    } catch (err) {
      console.warn("Could not update recommendation:", err);
    }
  }

  const db = readLocalDb();
  const rec = db.recommendations.find((r) => r.id === params.recommendationId);
  if (rec && rec.userId === params.userId) {
    rec.rating = params.rating;
    rec.comment = params.comment.trim();
    rec.tags = params.tags;
    rec.targetType = targetType;
    rec.targetNames = targetNames;
    rec.targetGroupIds = targetGroupIds;
    rec.targetUserIds = targetUserIds;
    writeLocalDb(db);
    return true;
  }
  return false;
}

export async function deleteRecommendation(
  userId: string,
  recommendationId: string
): Promise<boolean> {
  if (await isPostgresAvailable()) {
    try {
      const rec = await prisma.recommendation.findUnique({
        where: { id: recommendationId },
      });
      if (rec && rec.userId === userId) {
        await prisma.recommendation.delete({ where: { id: recommendationId } });
        return true;
      }
    } catch (err) {
      console.warn("Could not delete recommendation:", err);
    }
  }

  const db = readLocalDb();
  const rec = db.recommendations.find((r) => r.id === recommendationId);
  if (rec && rec.userId === userId) {
    db.recommendations = db.recommendations.filter((r) => r.id !== recommendationId);
    if (db.recommendationReplies) {
      db.recommendationReplies = db.recommendationReplies.filter(
        (rep) => rep.recommendationId !== recommendationId
      );
    }
    writeLocalDb(db);
    return true;
  }
  return false;
}

export async function toggleRecommendationUpvote(userId: string, recommendationId: string) {
  const friendIds = await getAcceptedFriendIds(userId);
  const allowedAuthorIds = new Set([userId, ...friendIds]);

  if (await isPostgresAvailable()) {
    const rec = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
      select: { userId: true },
    });
    if (!rec || !allowedAuthorIds.has(rec.userId)) {
      return { upvoted: false };
    }
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
  if (!rec || !allowedAuthorIds.has(rec.userId)) return { upvoted: false };
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

export async function addRecommendationReply(params: {
  recommendationId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  text: string;
}): Promise<AppRecommendationReply> {
  const cleanText = params.text.trim().slice(0, 1000);
  if (!cleanText) throw new Error("Reply text cannot be empty");

  const friendIds = await getAcceptedFriendIds(params.userId);
  const allowedAuthorIds = new Set([params.userId, ...friendIds]);

  if (await isPostgresAvailable()) {
    try {
      const rec = await prisma.recommendation.findUnique({
        where: { id: params.recommendationId },
        select: { userId: true },
      });
      if (!rec || !allowedAuthorIds.has(rec.userId)) {
        throw new Error("Keine Berechtigung für diese Empfehlung.");
      }
      const created = await (prisma as any).recommendationReply.create({
        data: {
          recommendationId: params.recommendationId,
          userId: params.userId,
          userName: params.userName,
          userImage: params.userImage || null,
          text: cleanText,
        },
      });
      return {
        id: created.id,
        recommendationId: created.recommendationId,
        userId: created.userId,
        userName: created.userName,
        userImage: created.userImage,
        text: created.text,
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err: any) {
      if (err?.message === "Keine Berechtigung für diese Empfehlung.") {
        throw err;
      }
      console.warn("Could not save to recommendationReply table, falling back to local DB:", err);
    }
  }

  const db = readLocalDb();
  const rec = db.recommendations.find((r) => r.id === params.recommendationId);
  if (!rec || !allowedAuthorIds.has(rec.userId)) {
    throw new Error("Keine Berechtigung für diese Empfehlung.");
  }
  if (!db.recommendationReplies) db.recommendationReplies = [];
  const newReply: AppRecommendationReply = {
    id: `reply_${Date.now()}`,
    recommendationId: params.recommendationId,
    userId: params.userId,
    userName: params.userName,
    userImage: params.userImage || null,
    text: cleanText,
    createdAt: new Date().toISOString(),
  };
  db.recommendationReplies.push(newReply);
  writeLocalDb(db);
  return newReply;
}

export async function deleteRecommendationReply(
  userId: string,
  replyId: string
): Promise<boolean> {
  if (await isPostgresAvailable()) {
    try {
      const rep = await (prisma as any).recommendationReply.findUnique({
        where: { id: replyId },
      });
      if (rep && rep.userId === userId) {
        await (prisma as any).recommendationReply.delete({ where: { id: replyId } });
        return true;
      }
    } catch {
      // ignore
    }
  }

  const db = readLocalDb();
  if (db.recommendationReplies) {
    db.recommendationReplies = db.recommendationReplies.filter(
      (r) => !(r.id === replyId && r.userId === userId)
    );
    writeLocalDb(db);
  }
  return true;
}

// --- Custom User & Friend Collections ---

function parseJsonSafe<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val !== "string") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function sanitizeCustomMoviesList(raw: any): AppCustomCollectionMovie[] {
  if (!Array.isArray(raw)) return [];
  const sanitized: AppCustomCollectionMovie[] = [];
  const seen = new Set<string>();

  for (const item of raw.slice(0, 150)) {
    const id = Number(item?.id);
    if (!Number.isFinite(id) || id <= 0) continue;
    const mediaType: "movie" | "tv" = item?.mediaType === "tv" ? "tv" : "movie";
    const key = `${mediaType}_${id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const title = String(item?.title || "").trim().slice(0, 250);
    if (!title) continue;
    const releaseYear = String(item?.releaseYear || "").trim().slice(0, 10);
    const rawPoster = item?.posterPath ? String(item.posterPath).trim().slice(0, 200) : null;
    const posterPath = rawPoster && rawPoster.startsWith("/") ? rawPoster : null;
    const rawBackdrop = item?.backdropPath ? String(item.backdropPath).trim().slice(0, 200) : null;
    const backdropPath = rawBackdrop && rawBackdrop.startsWith("/") ? rawBackdrop : null;
    const voteAverage = Math.min(10, Math.max(0, Number(item?.voteAverage) || 8.0));

    sanitized.push({
      id,
      title,
      releaseYear,
      posterPath,
      backdropPath,
      voteAverage,
      mediaType,
    });
  }

  return sanitized;
}

function mapRawCustomCollection(row: any): AppCustomCollection {
  const movies = parseJsonSafe<AppCustomCollectionMovie[]>(row.moviesJson || row.movies, []);
  const firstWithPoster = movies.find((m) => m.posterPath);
  const firstWithBackdrop = movies.find((m) => m.backdropPath);

  return {
    id: row.id,
    ownerId: row.ownerId,
    ownerName: row.owner?.name || row.ownerName || "Kino-Freund",
    ownerImage: row.owner?.image ?? row.ownerImage ?? null,
    name: row.name,
    tagline: row.tagline || `${movies.length} handverlesene Titel von ${row.owner?.name || row.ownerName || "Freund"}`,
    description: row.description || "",
    emoji: row.emoji || "🎬",
    posterPath: row.posterPath || firstWithPoster?.posterPath || null,
    backdropPath: row.backdropPath || firstWithBackdrop?.backdropPath || firstWithPoster?.posterPath || null,
    movies,
    visibility: (row.visibility as "PRIVATE" | "FRIENDS" | "PUBLIC") || "PRIVATE",
    approvalStatus: (row.approvalStatus as "NONE" | "PENDING" | "APPROVED" | "REJECTED") || "NONE",
    targetType: row.targetType || "ALL",
    targetNames: parseStringList(row.targetNames),
    targetGroupIds: parseStringList(row.targetGroupIds),
    targetUserIds: parseStringList(row.targetUserIds),
    upvoterIds: parseStringList(row.upvoterIds),
    comments: parseJsonSafe<AppCustomCollectionComment[]>(row.commentsJson || row.comments, []),
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  };
}

function isCustomCollectionVisibleToUser(
  col: AppCustomCollection,
  currentUserId?: string,
  currentUserName?: string,
  isAdmin?: boolean,
  friendIds?: Set<string>,
  myGroupIds?: Set<string>,
  myGroupNames?: Set<string>
): boolean {
  // 1. Admin sees everything (including PENDING collections to approve them) and owner always sees their own
  if (currentUserId && col.ownerId === currentUserId) return true;
  if (currentUserName && isSamePerson(col.ownerName, currentUserName)) return true;

  // 2. Publicly shared & approved collections are visible to everyone
  if (col.visibility === "PUBLIC" && col.approvalStatus === "APPROVED") {
    return true;
  }

  // 3. Admin also sees all PUBLIC PENDING collections so they can review/approve them
  if (isAdmin && col.visibility === "PUBLIC") {
    return true;
  }

  // 4. Private collections are only visible to the owner
  if (col.visibility === "PRIVATE" || !currentUserId) {
    return false;
  }

  // 5. Shared with friends (or PUBLIC still pending approval, visible to friends in the meantime)
  const isFriendOfOwner = friendIds ? friendIds.has(col.ownerId) : false;
  if (!isFriendOfOwner && !isAdmin) {
    return false;
  }

  return isRecommendationVisibleToUser(
    {
      userId: col.ownerId,
      targetType: col.targetType || "ALL",
      targetNames: col.targetNames || [],
      targetGroupIds: col.targetGroupIds || [],
      targetUserIds: col.targetUserIds || [],
    },
    currentUserId,
    currentUserName,
    myGroupIds,
    myGroupNames
  );
}

export async function getVisibleCustomCollections(
  currentUserId?: string,
  currentUserName?: string,
  isAdmin?: boolean
): Promise<AppCustomCollection[]> {
  let friendIdSet = new Set<string>();
  let myGroupIds = new Set<string>();
  let myGroupNames = new Set<string>();

  if (currentUserId) {
    try {
      const fIds = await getAcceptedFriendIds(currentUserId);
      friendIdSet = new Set(fIds);
      const myGroups = await getUserFriendGroups(currentUserId, currentUserName);
      myGroupIds = new Set(myGroups.map((g) => g.id));
      myGroupNames = new Set(myGroups.map((g) => g.name.toLowerCase()));
    } catch {
      // ignore
    }
  }

  let allCollections: AppCustomCollection[] = [];

  if (await isPostgresAvailable()) {
    try {
      const rows = await (prisma as any).customCollection.findMany({
        include: { owner: true },
        orderBy: { updatedAt: "desc" },
      });
      allCollections = rows.map(mapRawCustomCollection);
    } catch {
      const db = readLocalDb();
      allCollections = (db.customCollections || []).map(mapRawCustomCollection);
    }
  } else {
    const db = readLocalDb();
    allCollections = (db.customCollections || []).map(mapRawCustomCollection);
  }

  return allCollections.filter((col) =>
    isCustomCollectionVisibleToUser(
      col,
      currentUserId,
      currentUserName,
      isAdmin,
      friendIdSet,
      myGroupIds,
      myGroupNames
    )
  );
}

export async function getCustomCollectionById(
  collectionId: string,
  currentUserId?: string,
  currentUserName?: string,
  isAdmin?: boolean
): Promise<AppCustomCollection | null> {
  const allVisible = await getVisibleCustomCollections(currentUserId, currentUserName, isAdmin);
  return allVisible.find((c) => c.id === collectionId) || null;
}

export async function saveCustomCollection(params: {
  id?: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  isAdmin?: boolean;
  name: string;
  tagline?: string;
  description: string;
  emoji?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  movies: AppCustomCollectionMovie[];
  visibility: "PRIVATE" | "FRIENDS" | "PUBLIC";
  targetType?: "ALL" | "CUSTOM" | string;
  targetNames?: string[];
  targetGroupIds?: string[];
  targetUserIds?: string[];
}): Promise<AppCustomCollection> {
  const cleanName = params.name.trim().slice(0, 140) || "Meine Kollektion";
  const cleanTagline = (params.tagline || "").trim().slice(0, 180);
  const cleanDesc = params.description.trim().slice(0, 2500);
  const cleanEmoji = (params.emoji || "🎬").trim().slice(0, 10);
  const cleanMovies = sanitizeCustomMoviesList(params.movies);

  const rawFirstPoster = params.posterPath ? String(params.posterPath).trim().slice(0, 200) : null;
  const firstPoster =
    (rawFirstPoster && rawFirstPoster.startsWith("/") ? rawFirstPoster : null) ||
    cleanMovies.find((m) => m.posterPath)?.posterPath ||
    null;

  const rawFirstBackdrop = params.backdropPath ? String(params.backdropPath).trim().slice(0, 200) : null;
  const firstBackdrop =
    (rawFirstBackdrop && rawFirstBackdrop.startsWith("/") ? rawFirstBackdrop : null) ||
    cleanMovies.find((m) => m.backdropPath)?.backdropPath ||
    firstPoster ||
    null;

  const computeApprovalStatus = (
    vis: "PRIVATE" | "FRIENDS" | "PUBLIC",
    existingStatus?: string
  ): "NONE" | "PENDING" | "APPROVED" | "REJECTED" => {
    if (vis !== "PUBLIC") return "NONE";
    if (params.isAdmin) return "APPROVED";
    if (existingStatus === "APPROVED") return "PENDING";
    return "PENDING";
  };

  const targetType = params.targetType === "CUSTOM" ? "CUSTOM" : "ALL";
  const targetNames = (params.targetNames || [])
    .slice(0, 50)
    .map((n) => String(n).trim().slice(0, 100))
    .filter(Boolean);
  const targetGroupIds = (params.targetGroupIds || [])
    .slice(0, 30)
    .map((g) => String(g).trim().slice(0, 100))
    .filter(Boolean);
  const targetUserIds = (params.targetUserIds || [])
    .slice(0, 50)
    .map((u) => String(u).trim().slice(0, 100))
    .filter(Boolean);

  if (await isPostgresAvailable()) {
    try {
      if (params.id) {
        const existing = await (prisma as any).customCollection.findUnique({
          where: { id: params.id },
        });
        if (existing && (existing.ownerId === params.userId || params.isAdmin)) {
          const nextApproval = computeApprovalStatus(params.visibility, existing.approvalStatus);
          const updated = await (prisma as any).customCollection.update({
            where: { id: params.id },
            data: {
              name: cleanName,
              tagline: cleanTagline,
              description: cleanDesc,
              emoji: cleanEmoji,
              posterPath: firstPoster,
              backdropPath: firstBackdrop,
              moviesJson: JSON.stringify(cleanMovies),
              visibility: params.visibility,
              approvalStatus: nextApproval,
              targetType,
              targetNames: JSON.stringify(targetNames),
              targetGroupIds: JSON.stringify(targetGroupIds),
              targetUserIds: JSON.stringify(targetUserIds),
            },
            include: { owner: true },
          });
          return mapRawCustomCollection(updated);
        }
      }

      const newId = `ucol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const approvalStatus = computeApprovalStatus(params.visibility);
      const created = await (prisma as any).customCollection.create({
        data: {
          id: newId,
          ownerId: params.userId,
          ownerName: params.userName,
          ownerImage: params.userImage || null,
          name: cleanName,
          tagline: cleanTagline,
          description: cleanDesc,
          emoji: cleanEmoji,
          posterPath: firstPoster,
          backdropPath: firstBackdrop,
          moviesJson: JSON.stringify(cleanMovies),
          visibility: params.visibility,
          approvalStatus,
          targetType,
          targetNames: JSON.stringify(targetNames),
          targetGroupIds: JSON.stringify(targetGroupIds),
          targetUserIds: JSON.stringify(targetUserIds),
          upvoterIds: JSON.stringify([params.userId]),
          commentsJson: JSON.stringify([]),
        },
        include: { owner: true },
      });
      return mapRawCustomCollection(created);
    } catch (err) {
      console.warn("Prisma customCollection save fallback to local DB:", err);
    }
  }

  const db = readLocalDb();
  if (!db.customCollections) db.customCollections = [];
  const now = new Date().toISOString();

  if (params.id) {
    const idx = db.customCollections.findIndex((c) => c.id === params.id);
    if (idx !== -1 && (db.customCollections[idx].ownerId === params.userId || params.isAdmin)) {
      const existing = db.customCollections[idx];
      const updatedCol: AppCustomCollection = {
        ...existing,
        name: cleanName,
        tagline: cleanTagline || `${cleanMovies.length} handverlesene Titel von ${existing.ownerName}`,
        description: cleanDesc,
        emoji: cleanEmoji,
        posterPath: firstPoster,
        backdropPath: firstBackdrop,
        movies: cleanMovies,
        visibility: params.visibility,
        approvalStatus: computeApprovalStatus(params.visibility, existing.approvalStatus),
        targetType,
        targetNames,
        targetGroupIds,
        targetUserIds,
        updatedAt: now,
      };
      db.customCollections[idx] = updatedCol;
      writeLocalDb(db);
      return updatedCol;
    }
  }

  const newCol: AppCustomCollection = {
    id: `ucol_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ownerId: params.userId,
    ownerName: params.userName,
    ownerImage: params.userImage || null,
    name: cleanName,
    tagline: cleanTagline || `${cleanMovies.length} handverlesene Titel von ${params.userName}`,
    description: cleanDesc,
    emoji: cleanEmoji,
    posterPath: firstPoster,
    backdropPath: firstBackdrop,
    movies: cleanMovies,
    visibility: params.visibility,
    approvalStatus: computeApprovalStatus(params.visibility),
    targetType,
    targetNames,
    targetGroupIds,
    targetUserIds,
    upvoterIds: [params.userId],
    comments: [],
    createdAt: now,
    updatedAt: now,
  };

  db.customCollections.unshift(newCol);
  writeLocalDb(db);
  return newCol;
}

export async function deleteCustomCollection(
  userId: string,
  collectionId: string,
  isAdmin?: boolean
): Promise<boolean> {
  if (await isPostgresAvailable()) {
    try {
      const existing = await (prisma as any).customCollection.findUnique({
        where: { id: collectionId },
      });
      if (existing && (existing.ownerId === userId || isAdmin)) {
        await (prisma as any).customCollection.delete({ where: { id: collectionId } });
        return true;
      }
    } catch {
      // ignore
    }
  }

  const db = readLocalDb();
  if (!db.customCollections) return false;
  const existing = db.customCollections.find((c) => c.id === collectionId);
  if (existing && (existing.ownerId === userId || isAdmin)) {
    db.customCollections = db.customCollections.filter((c) => c.id !== collectionId);
    writeLocalDb(db);
    return true;
  }
  return false;
}

export async function reviewCustomCollectionApproval(params: {
  collectionId: string;
  approvalStatus: "APPROVED" | "REJECTED";
  isAdmin: boolean;
}): Promise<boolean> {
  if (!params.isAdmin) return false;

  if (await isPostgresAvailable()) {
    try {
      await (prisma as any).customCollection.update({
        where: { id: params.collectionId },
        data: {
          approvalStatus: params.approvalStatus,
        },
      });
      return true;
    } catch {
      // ignore
    }
  }

  const db = readLocalDb();
  if (!db.customCollections) return false;
  const col = db.customCollections.find((c) => c.id === params.collectionId);
  if (col) {
    col.approvalStatus = params.approvalStatus;
    col.updatedAt = new Date().toISOString();
    writeLocalDb(db);
    return true;
  }
  return false;
}

export async function toggleCustomCollectionUpvote(
  userId: string,
  collectionId: string
): Promise<{ upvoted: boolean }> {
  // Verify user has visibility permission to this collection before allowing upvote
  const visibleCol = await getCustomCollectionById(collectionId, userId, undefined, false);
  if (!visibleCol) return { upvoted: false };

  if (await isPostgresAvailable()) {
    try {
      const col = await (prisma as any).customCollection.findUnique({
        where: { id: collectionId },
      });
      if (col) {
        const upvoters = parseStringList(col.upvoterIds);
        const idx = upvoters.indexOf(userId);
        let upvoted = false;
        if (idx !== -1) {
          upvoters.splice(idx, 1);
        } else {
          upvoters.push(userId);
          upvoted = true;
        }
        await (prisma as any).customCollection.update({
          where: { id: collectionId },
          data: { upvoterIds: JSON.stringify(upvoters) },
        });
        return { upvoted };
      }
    } catch {
      // ignore
    }
  }

  const db = readLocalDb();
  const col = (db.customCollections || []).find((c) => c.id === collectionId);
  if (!col) return { upvoted: false };
  const idx = col.upvoterIds.indexOf(userId);
  let upvoted = false;
  if (idx !== -1) {
    col.upvoterIds.splice(idx, 1);
  } else {
    col.upvoterIds.push(userId);
    upvoted = true;
  }
  writeLocalDb(db);
  return { upvoted };
}

export async function addCustomCollectionComment(params: {
  collectionId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  text: string;
}): Promise<AppCustomCollectionComment | null> {
  const cleanText = params.text.trim().slice(0, 1000);
  if (!cleanText) return null;

  // Verify user has visibility permission to this collection before allowing comment
  const visibleCol = await getCustomCollectionById(
    params.collectionId,
    params.userId,
    params.userName,
    false
  );
  if (!visibleCol) return null;

  const newComment: AppCustomCollectionComment = {
    id: `cc_rep_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    collectionId: params.collectionId,
    userId: params.userId,
    userName: params.userName.slice(0, 100),
    userImage: params.userImage || null,
    text: cleanText,
    createdAt: new Date().toISOString(),
  };

  if (await isPostgresAvailable()) {
    try {
      const col = await (prisma as any).customCollection.findUnique({
        where: { id: params.collectionId },
      });
      if (col) {
        const comments = parseJsonSafe<AppCustomCollectionComment[]>(col.commentsJson, []).slice(-200);
        comments.push(newComment);
        await (prisma as any).customCollection.update({
          where: { id: params.collectionId },
          data: { commentsJson: JSON.stringify(comments) },
        });
        return newComment;
      }
    } catch {
      // ignore
    }
  }

  const db = readLocalDb();
  const col = (db.customCollections || []).find((c) => c.id === params.collectionId);
  if (!col) return null;
  if (!col.comments) col.comments = [];
  col.comments = col.comments.slice(-200);
  col.comments.push(newComment);
  writeLocalDb(db);
  return newComment;
}

export async function deleteCustomCollectionComment(
  userId: string,
  collectionId: string,
  commentId: string,
  isAdmin?: boolean
): Promise<boolean> {
  if (await isPostgresAvailable()) {
    try {
      const col = await (prisma as any).customCollection.findUnique({
        where: { id: collectionId },
      });
      if (col) {
        const comments = parseJsonSafe<AppCustomCollectionComment[]>(col.commentsJson, []);
        const filtered = comments.filter(
          (c) => !(c.id === commentId && (c.userId === userId || col.ownerId === userId || isAdmin))
        );
        await (prisma as any).customCollection.update({
          where: { id: collectionId },
          data: { commentsJson: JSON.stringify(filtered) },
        });
        return true;
      }
    } catch {
      // ignore
    }
  }

  const db = readLocalDb();
  const col = (db.customCollections || []).find((c) => c.id === collectionId);
  if (!col || !col.comments) return false;
  col.comments = col.comments.filter(
    (c) => !(c.id === commentId && (c.userId === userId || col.ownerId === userId || isAdmin))
  );
  writeLocalDb(db);
  return true;
}

// --- Watchlist Streaming Alerts & Notification Preferences ---

export interface WatchlistAlertCandidate {
  mediaStatusId: string;
  userId: string;
  userName: string;
  userEmail: string;
  subscriptions: string[];
  watchlistAlertsEnabled: boolean;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  alertedAt: string | null;
}

export async function getUserWatchlistAlertsEnabled(userId: string): Promise<boolean> {
  if (await isPostgresAvailable()) {
    await ensureWatchlistAlertSchema();
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { watchlistAlertsEnabled: true },
    });
    return u?.watchlistAlertsEnabled ?? true;
  }
  const db = readLocalDb();
  const user = db.users.find((u) => u.id === userId);
  return user?.watchlistAlertsEnabled ?? true;
}

export async function updateUserWatchlistAlerts(userId: string, enabled: boolean): Promise<boolean> {
  if (await isPostgresAvailable()) {
    await ensureWatchlistAlertSchema();
    await prisma.user.update({
      where: { id: userId },
      data: { watchlistAlertsEnabled: enabled },
    });
    return enabled;
  }
  const db = readLocalDb();
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.watchlistAlertsEnabled = enabled;
    writeLocalDb(db);
  }
  return enabled;
}

export async function getWatchlistAlertContext(): Promise<{
  candidates: WatchlistAlertCandidate[];
  snapshots: Map<string, string[]>;
}> {
  const snapshots = new Map<string, string[]>();

  if (await isPostgresAvailable()) {
    await Promise.all([ensureWatchlistAlertSchema(), ensureInviteAndModerationSchema()]);
    const [rows, snapshotRows] = await Promise.all([
      prisma.mediaStatus.findMany({
        where: { status: "WATCHLIST", user: { isBanned: false } },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isBanned: true,
              subscriptions: true,
              watchlistAlertsEnabled: true,
            },
          },
        },
      }),
      prisma.streamingProviderSnapshot.findMany(),
    ]);

    for (const s of snapshotRows) {
      snapshots.set(`${s.mediaType}:${s.tmdbId}`, parseJsonSafe<string[]>(s.providersDE, []));
    }

    const candidates: WatchlistAlertCandidate[] = rows
      .filter((r) => Boolean(r.user?.email) && !r.user?.isBanned)
      .map((r) => ({
        mediaStatusId: r.id,
        userId: r.user.id,
        userName: r.user.name,
        userEmail: r.user.email,
        subscriptions: parseSubscriptions(r.user.subscriptions),
        watchlistAlertsEnabled: r.user.watchlistAlertsEnabled ?? true,
        tmdbId: r.tmdbId,
        mediaType: r.mediaType === "tv" ? "tv" : "movie",
        title: r.title,
        posterPath: r.posterPath || null,
        releaseYear: r.releaseYear || null,
        alertedAt: r.alertedAt ? r.alertedAt.toISOString() : null,
      }));

    return { candidates, snapshots };
  }

  const db = readLocalDb();
  for (const s of db.streamingSnapshots || []) {
    snapshots.set(`${s.mediaType}:${s.tmdbId}`, s.providersDE || []);
  }
  const usersById = new Map(db.users.map((u) => [u.id, u]));
  const candidates: WatchlistAlertCandidate[] = [];
  for (const m of db.mediaStatuses) {
    if (m.status !== "WATCHLIST") continue;
    const u = usersById.get(m.userId);
    if (!u?.email || u.isBanned) continue;
    candidates.push({
      mediaStatusId: m.id,
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      subscriptions: u.subscriptions || ["netflix", "prime", "disney"],
      watchlistAlertsEnabled: u.watchlistAlertsEnabled ?? true,
      tmdbId: m.tmdbId,
      mediaType: m.mediaType === "tv" ? "tv" : "movie",
      title: m.title,
      posterPath: m.posterPath || null,
      releaseYear: m.releaseYear || null,
      alertedAt: m.alertedAt || null,
    });
  }
  return { candidates, snapshots };
}

export async function hasStreamingSnapshot(tmdbId: number, mediaType: "movie" | "tv"): Promise<boolean> {
  if (await isPostgresAvailable()) {
    await ensureWatchlistAlertSchema();
    const existing = await prisma.streamingProviderSnapshot.findUnique({
      where: { tmdbId_mediaType: { tmdbId, mediaType } },
      select: { id: true },
    });
    return Boolean(existing);
  }
  const db = readLocalDb();
  return (db.streamingSnapshots || []).some((s) => s.tmdbId === tmdbId && s.mediaType === mediaType);
}

async function seedSnapshotIfMissing(tmdbId: number, mediaType: "movie" | "tv"): Promise<void> {
  try {
    if (await hasStreamingSnapshot(tmdbId, mediaType)) return;
    const providers = await fetchDeStreamingProviders(tmdbId, mediaType);
    await upsertStreamingSnapshot(
      tmdbId,
      mediaType,
      providers.map((p) => p.key)
    );
  } catch {
    // non-critical background seed
  }
}

export async function upsertStreamingSnapshot(
  tmdbId: number,
  mediaType: "movie" | "tv",
  providersDE: string[]
): Promise<void> {
  const uniqueKeys = Array.from(new Set(providersDE));
  if (await isPostgresAvailable()) {
    await ensureWatchlistAlertSchema();
    await prisma.streamingProviderSnapshot.upsert({
      where: { tmdbId_mediaType: { tmdbId, mediaType } },
      update: { providersDE: JSON.stringify(uniqueKeys), checkedAt: new Date() },
      create: { tmdbId, mediaType, providersDE: JSON.stringify(uniqueKeys) },
    });
    return;
  }
  const db = readLocalDb();
  if (!db.streamingSnapshots) db.streamingSnapshots = [];
  const idx = db.streamingSnapshots.findIndex((s) => s.tmdbId === tmdbId && s.mediaType === mediaType);
  const entry: StreamingSnapshotEntry = {
    tmdbId,
    mediaType,
    providersDE: uniqueKeys,
    checkedAt: new Date().toISOString(),
  };
  if (idx !== -1) db.streamingSnapshots[idx] = entry;
  else db.streamingSnapshots.push(entry);
  writeLocalDb(db);
}

export async function markWatchlistItemsAlerted(mediaStatusIds: string[]): Promise<void> {
  if (mediaStatusIds.length === 0) return;
  if (await isPostgresAvailable()) {
    await ensureWatchlistAlertSchema();
    await prisma.mediaStatus.updateMany({
      where: { id: { in: mediaStatusIds } },
      data: { alertedAt: new Date() },
    });
    return;
  }
  const db = readLocalDb();
  const idSet = new Set(mediaStatusIds);
  const now = new Date().toISOString();
  for (const m of db.mediaStatuses) {
    if (idSet.has(m.id)) {
      m.alertedAt = now;
    }
  }
  writeLocalDb(db);
}
