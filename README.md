# 🎬 CineCircle – Movie & Series Sharing with VPN Streaming Finder

Eine moderne Web-App für dich und deine Freunde zum Entdecken, Bewerten und Teilen von Filmen und Serien – inklusive **globalem VPN-Streaming-Finder**, **Oscar-Gewinnern**, **IMDb / TMDB Top-Listen**, **Freundes-Feed** und einem **Whitelist-Einladungssystem**.

---

## 🌟 Features

1. **Top-Listen & IMDb / TMDB Ratings:**
   - 🍿 Top 250 Filme aller Zeiten (IMDb / TMDB)
   - 📺 Top bewertete Serien (Breaking Bad, Game of Thrones, Arcane etc.)
   - 🔥 Aktuell im Trend (Wöchentliche Charts)
   - 🔍 Sofortige Volltextsuche mit Auto-Vervollständigung

2. **🏆 Oscar-Gewinner Katalog:**
   - Alle Best Picture Gewinner von *Oppenheimer* und *Parasite* bis zu Klassikern wie *Der Pate* und *Titanic*.
   - Filterbar nach Jahrzehnten mit Detailangaben zu gewonnenen Oscars, Regie und Nominierungen.

3. **🌍 Globaler VPN Streaming-Finder (Kern-Feature):**
   - Klicke auf einen beliebigen Film/Serie: Die App fragt TMDB & JustWatch über alle Länder weltweit ab.
   - Zeigt an, in welchem Land der Film im Flatrate-Abo läuft (z. B. 🇯🇵 Netflix Japan, 🇬🇧 UK, 🇺🇸 USA, 🇨🇦 Kanada etc.).
   - **Abos-Filter:** Du kannst deine eigenen Abos (Netflix, Prime, Disney+, WOW, Apple TV+, etc.) hinterlegen – die App zeigt dir sofort an, wo dein Film mit VPN kostenlos streambar ist!

4. **👥 Freunde-Community & Feed:**
   - **Gesehen & Bewertet:** Sieh sofort auf einen Blick, welche Freunde einen Film gesehen haben und wie viele Punkte (1-10) sie vergeben haben.
   - **Watchlist:** Sieh, wer einen Film noch schauen möchte.
   - **Empfehlungen verfassen:** Schreibe Film-Empfehlungen mit Tags wie *#Mindfuck*, *#MustWatch*, *#Taschentücher*.
   - **Upvotes:** Freunde können Empfehlungen als hilfreich upvoten.
   - **Freunde-Übersicht:** Sieh nach, wer im Freundeskreis welche Streaming-Abos besitzt.

5. **🔐 Authentifizierung & Freundes-Whitelist (Wie bei deiner Zitate-App):**
   - NextAuth mit **Google Login** und **E-Mail/Passwort**.
   - **Admin-Dashboard (`/admin`):** Exklusiv für Lukas (`lukasreinle0@gmail.com`).
   - Schalte neue Freunde per E-Mail frei und generiere personalisierte Einladungslinks (`/register?email=freund@...`).
   - *(Optional)* Automatische Einladungs-E-Mail über Resend.

---

## 🚀 Lokale Entwicklung

1. Repository klonen & Abhängigkeiten installieren:
   ```bash
   git clone https://github.com/mnkrave/movie_sharing.git
   cd movie_sharing
   npm install
   ```

2. `.env` Datei anlegen:
   Kopiere `.env.example` zu `.env`:
   ```bash
   cp .env.example .env
   ```

3. Development-Server starten:
   ```bash
   npm run dev
   ```
   Öffne [http://localhost:3000](http://localhost:3000) im Browser.

---

## ☁️ Deployment auf Vercel

1. **GitHub Repository pushen:**
   Das Repository ist verknüpft mit `https://github.com/mnkrave/movie_sharing.git`.

2. **In Vercel importieren:**
   - Gehe auf [vercel.com](https://vercel.com) -> **Add New...** -> **Project**.
   - Wähle das Repository `mnkrave/movie_sharing` aus.

3. **Umgebungsvariablen (Environment Variables) in Vercel hinterlegen:**
   | Variable | Wert / Beschreibung |
   |---|---|
   | `TMDB_API_KEY` | `92dc1c6b15658b43e4c7a71b45addf36` |
   | `NEXTAUTH_SECRET` | Beliebiger zufälliger String (z. B. `movie_sharing_secret_2026`) |
   | `NEXTAUTH_URL` | Deine Vercel-Domain (z. B. `https://movie-sharing.vercel.app`) |
   | `DATABASE_URL` | PostgreSQL Connection String (z. B. von Neon / Supabase) |
   | `GOOGLE_CLIENT_ID` | Deine Google OAuth Client-ID |
   | `GOOGLE_CLIENT_SECRET`| Dein Google OAuth Client-Secret |
   | `WHITELISTED_EMAILS` | `lukasreinle0@gmail.com` |
   | `RESEND_API_KEY` | (Optional) Für automatischen E-Mail-Versand bei Einladungen |

4. **Deployen:**
   Klicke auf **Deploy**. Vercel baut Next.js automatisch und die Seite ist live!
