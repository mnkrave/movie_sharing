import React from "react";
import { Metadata } from "next";
import { getAllCollections } from "@/lib/collections";
import { CollectionsClient } from "./CollectionsClient";

export const metadata: Metadata = {
  title: "Kollektionen & Universen | CineCircle",
  description:
    "Erkunde Film-Universen wie Star Wars, Marvel, Indiana Jones und Meisterwerke legendärer Regisseure wie Steven Spielberg und Christopher Nolan.",
};

export const revalidate = 3600;

export default function CollectionsPage() {
  const collections = getAllCollections();
  return <CollectionsClient collections={collections} />;
}
