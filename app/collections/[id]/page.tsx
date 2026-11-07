import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCollectionById, getAllCollections } from "@/lib/collections";
import { CollectionDetailClient } from "./CollectionDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const collection = getCollectionById(id);
  if (!collection) return { title: "Kollektion nicht gefunden | CineCircle" };

  return {
    title: `${collection.name} | CineCircle Kollektionen`,
    description: collection.description,
  };
}

export async function generateStaticParams() {
  const collections = getAllCollections();
  return collections.map((col) => ({ id: col.id }));
}

export const revalidate = 3600;

export default async function CollectionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const collection = getCollectionById(id);

  if (!collection) {
    notFound();
  }

  return <CollectionDetailClient collection={collection} />;
}
