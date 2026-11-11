"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMedia } from "./MediaContext";
import { Send, Trash2, MessageSquare, X, Sparkles } from "lucide-react";

interface ReplyItem {
  id: string;
  recommendationId?: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  text: string;
  createdAt: string;
}

interface RecommendationThreadProps {
  recommendationId: string;
  recAuthorName: string;
  recAuthorId?: string;
  replies?: ReplyItem[];
  onClose?: () => void;
}

export function RecommendationThread({
  recommendationId,
  recAuthorName,
  recAuthorId,
  replies = [],
  onClose,
}: RecommendationThreadProps) {
  const { data: session } = useSession();
  const {
    addRecommendationReply,
    deleteRecommendationReply,
    currentUserAvatar,
    communityData,
  } = useMedia();

  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUserId = (session?.user as any)?.id;
  const currentUserName = session?.user?.name;

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      alert("Bitte logge dich ein, um eine Antwort zu schreiben!");
      return;
    }
    const trimmed = replyText.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    await addRecommendationReply(recommendationId, trimmed);
    setReplyText("");
    setSubmitting(false);
  };

  const isReplyMine = (reply: ReplyItem) => {
    if (currentUserId && reply.userId === currentUserId) return true;
    if (currentUserName && reply.userName.toLowerCase() === currentUserName.toLowerCase()) return true;
    return false;
  };

  const isReplyAuthorOfRec = (reply: ReplyItem) => {
    if (recAuthorId && reply.userId === recAuthorId) return true;
    if (recAuthorName && reply.userName.toLowerCase() === recAuthorName.toLowerCase()) return true;
    return false;
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return "Gerade eben";
      if (diffMins < 60) return `vor ${diffMins}m`;
      if (diffHours < 24) return `vor ${diffHours}h`;
      if (diffDays === 1) return "Gestern";
      if (diffDays < 7) return `vor ${diffDays}d`;
      return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="mt-3 p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-3.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-bold text-slate-200">
            Diskussion / Antworten ({replies.length})
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition"
            title="Thread schließen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Replies List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {replies.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500 italic">
            Noch keine Antworten. Schreib als Erste(r) eine Nachricht an @{recAuthorName}!
          </div>
        ) : (
          replies.map((rep) => {
            const mine = isReplyMine(rep);
            const isAuthor = isReplyAuthorOfRec(rep);
            const authorImg = mine
              ? currentUserAvatar || rep.userImage
              : rep.userImage ||
                communityData.friends.find(
                  (f) => f.name === rep.userName || f.id === rep.userId
                )?.image;

            return (
              <div
                key={rep.id}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 group transition ${
                  mine
                    ? "bg-purple-950/20 border-purple-500/25"
                    : "bg-slate-900/70 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {authorImg ? (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-purple-500/30 flex-shrink-0 mt-0.5">
                      <Image
                        src={authorImg}
                        alt={rep.userName}
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 shadow-sm ${
                        mine
                          ? "bg-purple-500 text-white"
                          : "bg-gradient-to-br from-amber-500 to-rose-500 text-black"
                      }`}
                    >
                      {rep.userName.slice(0, 1)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={mine ? "/profile" : `/friends/${encodeURIComponent(rep.userId || rep.userName)}`}
                        className="text-xs font-bold text-white hover:text-purple-300 transition-colors truncate"
                      >
                        {rep.userName}
                      </Link>
                      {mine && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/25 text-purple-300 font-bold border border-purple-500/30">
                          Du
                        </span>
                      )}
                      {isAuthor && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                          Ersteller
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {formatTimestamp(rep.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 mt-1 leading-relaxed break-words whitespace-pre-wrap">
                      {rep.text}
                    </p>
                  </div>
                </div>

                {mine && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Möchtest du diese Antwort löschen?")) {
                        deleteRecommendationReply(rep.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition opacity-60 hover:opacity-100 flex-shrink-0"
                    title="Antwort löschen"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="pt-1 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={`Antwort an @${recAuthorName} schreiben...`}
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={!replyText.trim() || submitting}
          className="px-3.5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5 shadow"
        >
          <Send className="w-3 h-3" />
          <span>{submitting ? "..." : "Senden"}</span>
        </button>
      </form>
    </div>
  );
}
