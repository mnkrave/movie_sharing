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
  friendGroups?: { id: string; name: string; emoji: string; memberNames: string[] }[];
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

interface LocalDbFile {
  users: AppUser[];
  whitelist: { id: string; email: string; createdAt: string }[];
  mediaStatuses: AppMediaStatus[];
  recommendations: AppRecommendation[];
  friendships: AppFriendship[];
  friendGroups?: AppFriendGroup[];
  recommendationReplies?: AppRecommendationReply[];
  customCollections?: AppCustomCollection[];
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
      friendGroups: parseFriendGroups(u.friendGroups),
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
      friendGroups: parseFriendGroups(u.friendGroups),
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
        friendGroups: parseFriendGroups(updated.friendGroups),
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
      friendGroups: parseFriendGroups(created.friendGroups),
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
        pendingReceived: received.map((r) => ({
          requestId: r.id,
          user: {
            id: r.user.id,
            name: r.user.name,
            email: r.user.email,
            image: r.user.image,
          },
          createdAt: r.createdAt.toISOString(),
        })),
        pendingSent: sent.map((s) => ({
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
    .map((f) => {
      const u = db.users.find((user) => user.id === f.userId);
      return {
        requestId: f.id,
        user: u
          ? { id: u.id, name: u.name, email: u.email, image: u.image }
          : { id: f.userId, name: "Unbekannt", email: "", image: null },
        createdAt: f.createdAt,
      };
    });

  const pendingSent = friendships
    .filter((f) => f.userId === userId && f.status === "PENDING")
    .map((f) => {
      const u = db.users.find((user) => user.id === f.friendId);
      return {
        requestId: f.id,
        user: u
          ? { id: u.id, name: u.name, email: u.email, image: u.image }
          : { id: f.friendId, name: "Unbekannt", email: "", image: null },
        createdAt: f.createdAt,
      };
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
      const targetUser = await prisma.user.findFirst({
        where: {
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
    (u) => u.email.toLowerCase() === cleanTarget || u.name.toLowerCase() === cleanTarget
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
      const users = await prisma.user.findMany({
        where: {
          id: { not: currentUserId },
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

export async function getAllFriendsWithStats(
  currentUserId?: string,
  options?: { includeAllForAdmin?: boolean }
) {
  if (!currentUserId && !options?.includeAllForAdmin) {
    return [];
  }
  let friendIdSet: Set<string> | null = null;
  if (currentUserId) {
    const ids = await getAcceptedFriendIds(currentUserId);
    friendIdSet = new Set(ids);
  }

  if (await isPostgresAvailable()) {
    const users = await prisma.user.findMany({
      where: friendIdSet ? { id: { in: Array.from(friendIdSet) } } : undefined,
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
      watchingCount: u.mediaStatuses.filter((m) => m.status === "WATCHING" && m.mediaType === "tv").length,
      watchlistCount: u.mediaStatuses.filter((m) => m.status === "WATCHLIST").length,
      recommendationsCount: u.recommendations.length,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  const db = readLocalDb();
  const filteredUsers = friendIdSet
    ? db.users.filter((u) => friendIdSet.has(u.id))
    : db.users;

  return filteredUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role,
    subscriptions: u.subscriptions || ["netflix", "prime", "disney"],
    watchedCount: db.mediaStatuses.filter((m) => m.userId === u.id && m.status === "WATCHED").length,
    watchingCount: db.mediaStatuses.filter((m) => m.userId === u.id && m.status === "WATCHING" && m.mediaType === "tv").length,
    watchlistCount: db.mediaStatuses.filter((m) => m.userId === u.id && m.status === "WATCHLIST").length,
    recommendationsCount: db.recommendations.filter((r) => r.userId === u.id).length,
    createdAt: u.createdAt,
  }));
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

    const mappedRecs: AppRecommendation[] = recs.map((r: any) => ({
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
      upvoterIds: r.upvotes ? r.upvotes.map((u: any) => u.userId) : [],
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
              userImage: rep.userImage,
              text: rep.text,
              createdAt:
                rep.createdAt instanceof Date ? rep.createdAt.toISOString() : String(rep.createdAt),
            }))
            .sort(
              (a: any, b: any) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
        : [],
      createdAt: r.createdAt.toISOString(),
    }));

    const visibleRecs = mappedRecs.filter((r) =>
      isRecommendationVisibleToUser(r, currentUserId, currentUserName, myGroupIds, myGroupNames)
    );

    return {
      mediaStatuses: statuses.map((s: any) => ({
        id: s.id,
        userId: s.userId,
        userName: s.user.name,
        userImage: s.user.image,
        tmdbId: s.tmdbId,
        mediaType: s.mediaType as "movie" | "tv",
        title: s.title,
        posterPath: s.posterPath,
        releaseYear: s.releaseYear,
        status: s.status as "WATCHED" | "WATCHLIST" | "WATCHING",
        rating: s.rating,
        watchedSeasons: s.watchedSeasons
          ? typeof s.watchedSeasons === "string"
            ? (() => {
                try {
                  return JSON.parse(s.watchedSeasons);
                } catch {
                  return null;
                }
              })()
            : s.watchedSeasons
          : null,
        totalSeasons: s.totalSeasons ?? null,
        updatedAt: s.updatedAt.toISOString(),
      })),
      recommendations: visibleRecs,
    };
  }

  const db = readLocalDb();
  const allReplies = db.recommendationReplies || [];
  const statuses = allowedUserIds
    ? db.mediaStatuses.filter((s) => allowedUserIds.has(s.userId))
    : db.mediaStatuses;
  const rawRecs = allowedUserIds
    ? db.recommendations.filter((r) => allowedUserIds.has(r.userId))
    : db.recommendations;

  const visibleRecs = rawRecs
    .map((r) => ({
      ...r,
      targetType: r.targetType || "ALL",
      targetNames: parseStringList(r.targetNames),
      targetGroupIds: parseStringList(r.targetGroupIds),
      targetUserIds: parseStringList(r.targetUserIds),
      replies: allReplies
        .filter((rep) => rep.recommendationId === r.id)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    }))
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
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt || new Date().toISOString()),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt || new Date().toISOString()),
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
