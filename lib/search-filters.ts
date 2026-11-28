export type SortByOption =
  | "popularity.desc"
  | "vote_average.desc"
  | "primary_release_date.desc";

export const EXTENDED_GENRES = [
  { id: null, label: "Alle Genres", emoji: "✨" },
  { id: 28, label: "Action", emoji: "💥" },
  { id: 878, label: "Sci-Fi", emoji: "🚀" },
  { id: 53, label: "Thriller", emoji: "😱" },
  { id: 35, label: "Komödie", emoji: "😂" },
  { id: 18, label: "Drama", emoji: "🎭" },
  { id: 80, label: "Krimi", emoji: "🕵️" },
  { id: 12, label: "Abenteuer", emoji: "🗺️" },
  { id: 14, label: "Fantasy", emoji: "🧙‍♂️" },
  { id: 16, label: "Animation", emoji: "✨" },
  { id: 27, label: "Horror", emoji: "🩸" },
  { id: 99, label: "Doku", emoji: "🎥" },
  { id: 10749, label: "Romantik", emoji: "❤️" },
  { id: 36, label: "Historie", emoji: "📜" },
  { id: 10752, label: "Kriegsfilm", emoji: "🪖" },
] as const;

export const COUNTRIES = [
  { code: "ALL", label: "Alle Länder", flag: "🌍" },
  { code: "US", label: "USA", flag: "🇺🇸" },
  { code: "DE", label: "Deutschland", flag: "🇩🇪" },
  { code: "GB", label: "Großbritannien", flag: "🇬🇧" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
  { code: "KR", label: "Südkorea", flag: "🇰🇷" },
  { code: "FR", label: "Frankreich", flag: "🇫🇷" },
  { code: "ES", label: "Spanien", flag: "🇪🇸" },
  { code: "IT", label: "Italien", flag: "🇮🇹" },
  { code: "CA", label: "Kanada", flag: "🇨🇦" },
  { code: "AU", label: "Australien", flag: "🇦🇺" },
  { code: "DK", label: "Dänemark", flag: "🇩🇰" },
  { code: "SE", label: "Schweden", flag: "🇸🇪" },
] as const;

export const POPULAR_DIRECTORS = [
  "Christopher Nolan",
  "Quentin Tarantino",
  "Martin Scorsese",
  "Steven Spielberg",
  "David Fincher",
  "Denis Villeneuve",
  "James Cameron",
  "Ridley Scott",
  "Wes Anderson",
  "Hayao Miyazaki",
] as const;

export const POPULAR_ACTORS = [
  "Leonardo DiCaprio",
  "Cillian Murphy",
  "Brad Pitt",
  "Christian Bale",
  "Tom Hardy",
  "Margot Robbie",
  "Ryan Gosling",
  "Keanu Reeves",
  "Robert De Niro",
  "Tom Hanks",
] as const;

export const ERAS = [
  { id: "all", label: "Alle Jahre" },
  { id: "new", label: "✨ 2024–2026" },
  { id: "2020s", label: "2020er" },
  { id: "2010s", label: "2010er" },
  { id: "2000s", label: "2000er" },
  { id: "1990s", label: "90er" },
  { id: "classics", label: "🎞️ Klassiker (<1990)" },
] as const;

export const RATINGS = [
  { value: 0, label: "Alle" },
  { value: 7.0, label: "★ 7.0+" },
  { value: 7.5, label: "★ 7.5+" },
  { value: 8.0, label: "★ 8.0+ (Top)" },
  { value: 8.5, label: "★ 8.5+ (Meisterwerke)" },
] as const;

export const SORT_OPTIONS: ReadonlyArray<{ value: SortByOption; label: string }> = [
  { value: "popularity.desc", label: "Beliebteste" },
  { value: "vote_average.desc", label: "Beste Bewertung" },
  { value: "primary_release_date.desc", label: "Neueste" },
];
