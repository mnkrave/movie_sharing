const fs = require("fs");

const TMDB_API_KEY = process.env.TMDB_API_KEY || "92dc1c6b15658b43e4c7a71b45addf36";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function fetchItem(id, type = "movie") {
  const url = `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=de-DE`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const title = data.title || data.name || "Titel";
    const originalTitle = data.original_title || data.original_name;
    const dateStr = data.release_date || data.first_air_date || "";
    const releaseYear = dateStr ? dateStr.slice(0, 4) : "";
    return {
      id: data.id,
      title,
      originalTitle,
      releaseYear,
      posterPath: data.poster_path || null,
      backdropPath: data.backdrop_path || null,
      voteAverage: Math.round((data.vote_average || 0) * 10) / 10,
      overview: data.overview || "",
      mediaType: type,
    };
  } catch (err) {
    console.error("Error fetching", type, id, err);
    return null;
  }
}

async function main() {
  console.log("Loading existing lib/collections.ts...");
  const oldContent = fs.readFileSync("lib/collections.ts", "utf-8");
  // Extract COLLECTIONS_DATA JSON
  const match = oldContent.match(/export const COLLECTIONS_DATA: CollectionUniverse\[\] = (\[[\s\S]*?\]);\n\nexport function/);
  if (!match) {
    console.error("Could not find COLLECTIONS_DATA");
    process.exit(1);
  }

  let collections = JSON.parse(match[1]);

  // 1. Update James Bond
  console.log("Fetching James Bond...");
  const bondDefinitions = [
    { id: 646, subGroup: "Sean Connery" },
    { id: 657, subGroup: "Sean Connery" },
    { id: 658, subGroup: "Sean Connery" },
    { id: 660, subGroup: "Sean Connery" },
    { id: 667, subGroup: "Sean Connery" },
    { id: 668, subGroup: "George Lazenby" },
    { id: 681, subGroup: "Sean Connery" },
    { id: 253, subGroup: "Roger Moore" },
    { id: 682, subGroup: "Roger Moore" },
    { id: 691, subGroup: "Roger Moore" },
    { id: 698, subGroup: "Roger Moore" },
    { id: 699, subGroup: "Roger Moore" },
    { id: 700, subGroup: "Roger Moore" },
    { id: 36670, subGroup: "Sean Connery" },
    { id: 707, subGroup: "Roger Moore" },
    { id: 708, subGroup: "Timothy Dalton" },
    { id: 709, subGroup: "Timothy Dalton" },
    { id: 710, subGroup: "Pierce Brosnan" },
    { id: 714, subGroup: "Pierce Brosnan" },
    { id: 36643, subGroup: "Pierce Brosnan" },
    { id: 36669, subGroup: "Pierce Brosnan" },
    { id: 36557, subGroup: "Daniel Craig" },
    { id: 10764, subGroup: "Daniel Craig" },
    { id: 37724, subGroup: "Daniel Craig" },
    { id: 206647, subGroup: "Daniel Craig" },
    { id: 370172, subGroup: "Daniel Craig" }
  ];

  const bondMovies = [];
  for (const b of bondDefinitions) {
    const item = await fetchItem(b.id, "movie");
    if (item) {
      bondMovies.push({ ...item, subGroup: b.subGroup });
    }
  }
  bondMovies.sort((a,b) => (parseInt(a.releaseYear) || 0) - (parseInt(b.releaseYear) || 0));

  const bondUniverse = {
    id: "james-bond",
    name: "James Bond 007 (Gesamtreihe)",
    category: "franchise",
    tagline: "Alle 26 Filme: Von Sean Connery bis Daniel Craig",
    description: "Im Geheimdienst Ihrer Majestät: Die legendärste Spionagereihe der Kinogeschichte. Filtere nach deinem Lieblings-Bond-Darsteller!",
    backdropPath: bondMovies.find(m => m.id === 37724)?.backdropPath || "/iqvsn9eY7Y9ZzB6Jq7P1Fz3Gj7y.jpg",
    posterPath: bondMovies.find(m => m.id === 36557)?.posterPath || "/bU29hR13zEa0XqZ18s2oJ4uK4V4.jpg",
    subGroupLabel: "Schauspieler",
    movies: bondMovies
  };

  // Replace or update james-bond
  const bondIdx = collections.findIndex(c => c.id.startsWith("james-bond"));
  if (bondIdx >= 0) {
    collections[bondIdx] = bondUniverse;
  } else {
    collections.push(bondUniverse);
  }

  // 2. Add Jason Bourne
  console.log("Fetching Jason Bourne...");
  const bourneDefinitions = [
    { id: 2501, subGroup: "Matt Damon" },
    { id: 2502, subGroup: "Matt Damon" },
    { id: 2503, subGroup: "Matt Damon" },
    { id: 49040, subGroup: "Jeremy Renner" },
    { id: 324668, subGroup: "Matt Damon" }
  ];
  const bourneMovies = [];
  for (const b of bourneDefinitions) {
    const item = await fetchItem(b.id, "movie");
    if (item) bourneMovies.push({ ...item, subGroup: b.subGroup });
  }
  bourneMovies.sort((a,b) => (parseInt(a.releaseYear) || 0) - (parseInt(b.releaseYear) || 0));

  const bourneUniverse = {
    id: "jason-bourne",
    name: "Jason Bourne Filmreihe",
    category: "franchise",
    tagline: "Sie gaben ihm ein Gedächtnis – er gab ihnen den Krieg",
    description: "Treadstone, Blackbriar und knallharte Nahkämpfe: Die revolutionäre Spionage-Reihe mit Matt Damon.",
    backdropPath: bourneMovies[1]?.backdropPath || bourneMovies[0]?.backdropPath,
    posterPath: bourneMovies[0]?.posterPath,
    subGroupLabel: "Hauptdarsteller",
    movies: bourneMovies
  };
  const bourneIdx = collections.findIndex(c => c.id === "jason-bourne");
  if (bourneIdx >= 0) collections[bourneIdx] = bourneUniverse;
  else collections.push(bourneUniverse);

  // 3. Add Mission: Impossible
  console.log("Fetching Mission: Impossible...");
  const miDefinitions = [954, 955, 956, 56292, 177677, 353081, 575264];
  const miMovies = [];
  for (const id of miDefinitions) {
    const item = await fetchItem(id, "movie");
    if (item) miMovies.push(item);
  }
  miMovies.sort((a,b) => (parseInt(a.releaseYear) || 0) - (parseInt(b.releaseYear) || 0));

  const miUniverse = {
    id: "mission-impossible",
    name: "Mission: Impossible Saga",
    category: "franchise",
    tagline: "Ihre Mission, sollten Sie sie annehmen...",
    description: "Ethan Hunt und die IMF im Kampf gegen globale Bedrohungen mit den spektakulärsten Stunts der Kinogeschichte.",
    backdropPath: miMovies[5]?.backdropPath || miMovies[0]?.backdropPath,
    posterPath: miMovies[5]?.posterPath || miMovies[0]?.posterPath,
    movies: miMovies
  };
  const miIdx = collections.findIndex(c => c.id === "mission-impossible");
  if (miIdx >= 0) collections[miIdx] = miUniverse;
  else collections.push(miUniverse);

  // 4. Update Marvel (MCU) Complete (Movies & TV Series)
  console.log("Fetching Complete Marvel Cinematic Universe (MCU)...");
  const mcuDefinitions = [
    // Phase 1
    { id: 1726, type: "movie", subGroup: "Phase 1" },
    { id: 1724, type: "movie", subGroup: "Phase 1" },
    { id: 10138, type: "movie", subGroup: "Phase 1" },
    { id: 10195, type: "movie", subGroup: "Phase 1" },
    { id: 1771, type: "movie", subGroup: "Phase 1" },
    { id: 24428, type: "movie", subGroup: "Phase 1" },

    // Phase 2
    { id: 68721, type: "movie", subGroup: "Phase 2" },
    { id: 76338, type: "movie", subGroup: "Phase 2" },
    { id: 100402, type: "movie", subGroup: "Phase 2" },
    { id: 118340, type: "movie", subGroup: "Phase 2" },
    { id: 99861, type: "movie", subGroup: "Phase 2" },
    { id: 102899, type: "movie", subGroup: "Phase 2" },

    // Phase 3
    { id: 271110, type: "movie", subGroup: "Phase 3" },
    { id: 284052, type: "movie", subGroup: "Phase 3" },
    { id: 283995, type: "movie", subGroup: "Phase 3" },
    { id: 315635, type: "movie", subGroup: "Phase 3" },
    { id: 284053, type: "movie", subGroup: "Phase 3" },
    { id: 284054, type: "movie", subGroup: "Phase 3" },
    { id: 299536, type: "movie", subGroup: "Phase 3" },
    { id: 363088, type: "movie", subGroup: "Phase 3" },
    { id: 299537, type: "movie", subGroup: "Phase 3" },
    { id: 299534, type: "movie", subGroup: "Phase 3" },
    { id: 429617, type: "movie", subGroup: "Phase 3" },

    // Phase 4
    { id: 85271, type: "tv", subGroup: "Phase 4" },
    { id: 88396, type: "tv", subGroup: "Phase 4" },
    { id: 84958, type: "tv", subGroup: "Phase 4" },
    { id: 497698, type: "movie", subGroup: "Phase 4" },
    { id: 91363, type: "tv", subGroup: "Phase 4" },
    { id: 566525, type: "movie", subGroup: "Phase 4" },
    { id: 524434, type: "movie", subGroup: "Phase 4" },
    { id: 88329, type: "tv", subGroup: "Phase 4" },
    { id: 634649, type: "movie", subGroup: "Phase 4" },
    { id: 92749, type: "tv", subGroup: "Phase 4" },
    { id: 453395, type: "movie", subGroup: "Phase 4" },
    { id: 92782, type: "tv", subGroup: "Phase 4" },
    { id: 616037, type: "movie", subGroup: "Phase 4" },
    { id: 92783, type: "tv", subGroup: "Phase 4" },
    { id: 1013860, type: "movie", subGroup: "Phase 4" },
    { id: 505642, type: "movie", subGroup: "Phase 4" },

    // Phase 5
    { id: 640146, type: "movie", subGroup: "Phase 5" },
    { id: 447365, type: "movie", subGroup: "Phase 5" },
    { id: 114479, type: "tv", subGroup: "Phase 5" },
    { id: 609681, type: "movie", subGroup: "Phase 5" },
    { id: 138502, type: "tv", subGroup: "Phase 5" },
    { id: 533535, type: "movie", subGroup: "Phase 5" },
    { id: 138501, type: "tv", subGroup: "Phase 5" }
  ];

  const mcuMovies = [];
  for (const m of mcuDefinitions) {
    const item = await fetchItem(m.id, m.type);
    if (item) mcuMovies.push({ ...item, subGroup: m.subGroup });
  }

  const mcuUniverse = {
    id: "marvel-mcu",
    name: "Marvel Cinematic Universe (MCU)",
    category: "franchise",
    tagline: "Das komplette Multiversum: Alle Filme & Serien von Phase 1 bis 5",
    description: "Von Iron Man und den Avengers bis hin zu Loki, WandaVision und Deadpool & Wolverine. Verfolge deinen Fortschritt durch jede einzelne MCU-Phase!",
    backdropPath: "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    posterPath: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    subGroupLabel: "MCU Phase",
    movies: mcuMovies
  };

  const mcuIdx = collections.findIndex(c => c.id.startsWith("marvel"));
  if (mcuIdx >= 0) collections[mcuIdx] = mcuUniverse;
  else collections.push(mcuUniverse);

  // Write updated collections.ts
  const outputContent = `// Curated Universes and Franchise/Director Collections for CineCircle
export interface CollectionMovie {
  id: number;
  title: string;
  originalTitle?: string;
  releaseYear: string;
  posterPath: string | null;
  backdropPath?: string | null;
  voteAverage: number;
  overview?: string;
  mediaType?: "movie" | "tv";
  subGroup?: string;
}

export interface CollectionUniverse {
  id: string;
  name: string;
  category: "franchise" | "director";
  tagline: string;
  description: string;
  backdropPath: string | null;
  posterPath: string | null;
  subGroupLabel?: string;
  movies: CollectionMovie[];
}

export const COLLECTIONS_DATA: CollectionUniverse[] = ${JSON.stringify(collections, null, 2)};

export function getAllCollections(): CollectionUniverse[] {
  return COLLECTIONS_DATA;
}

export function getCollectionById(id: string): CollectionUniverse | undefined {
  return COLLECTIONS_DATA.find((c) => c.id === id);
}
`;

  fs.writeFileSync("lib/collections.ts", outputContent);
  console.log("Done! Updated collections:", collections.length);
}

main();
