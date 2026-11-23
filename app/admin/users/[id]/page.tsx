import React from "react";
import { Metadata } from "next";
import { Shield } from "lucide-react";
import { requireAdminSession } from "@/lib/auth";
import { FriendProfileClient } from "@/app/friends/[id]/FriendProfileClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Nutzerprofil (Admin) | CineCircle",
  description: "Vollständige Admin-Ansicht von Nutzerprofil, Bewertungen, Watchlist und Tipps.",
};

export default async function AdminUserProfilePage({ params }: PageProps) {
  const admin = await requireAdminSession();
  if (!admin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Zugriff verweigert</h2>
        <p className="text-sm text-slate-400">
          Dieser Bereich ist exklusiv für Admins reserviert.
        </p>
      </div>
    );
  }

  const { id } = await params;
  return <FriendProfileClient friendIdParam={id} mode="admin" />;
}
