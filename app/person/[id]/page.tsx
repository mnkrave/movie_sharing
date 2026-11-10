import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPersonDetails } from "@/lib/tmdb";
import { PersonProfileClient } from "./PersonProfileClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const personId = parseInt(id, 10);
  if (isNaN(personId)) {
    return { title: "Person nicht gefunden | CineCircle" };
  }

  const person = await getPersonDetails(personId);
  if (!person) {
    return { title: "Person nicht gefunden | CineCircle" };
  }

  const role = person.knownForDepartment === "Directing" ? "Regisseur:in" : "Schauspieler:in";
  return {
    title: `${person.name} (${role}) | CineCircle`,
    description: `Erfahre mehr über ${person.name}, sieh alle Filme und Serien und finde heraus, wie viel du bereits von ${person.name} gesehen hast.`,
  };
}

export default async function PersonPage({ params }: PageProps) {
  const { id } = await params;
  const personId = parseInt(id, 10);
  if (isNaN(personId)) notFound();

  const person = await getPersonDetails(personId);
  if (!person) notFound();

  return <PersonProfileClient initialPerson={person} personId={personId} />;
}
