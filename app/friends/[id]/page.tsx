import React from "react";
import { Metadata } from "next";
import { FriendProfileClient } from "./FriendProfileClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  return {
    title: `${decoded} | Freunde-Profil | CineCircle`,
    description: `Sieh dir die geschauten Filme, Bewertungen und Watchlist von ${decoded} an.`,
  };
}

export default async function FriendProfilePage({ params }: PageProps) {
  const { id } = await params;
  return <FriendProfileClient friendIdParam={id} />;
}
