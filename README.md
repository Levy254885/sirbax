# sirbax

**Share freely. Connect anonymously.**

A modern anonymous social network built with Next.js, Firebase, and Cloudinary.

## Features

- Anonymous identity (random nicknames + abstract avatars)
- Feed, stories, reactions, comments
- Messaging, communities, explore, notifications
- Saved, events, marketplace, memories
- Privacy settings, report system
- Light / Dark / System theme
- Demo mode (no Firebase keys required)

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Try demo mode**.

## Deploy (Vercel)

1. Import this repo in [Vercel](https://vercel.com/new)
2. Framework: Next.js (auto-detected)
3. Add env vars from `.env.example` when ready
4. Deploy

Or:

```bash
npx vercel
```

## Environment

See `.env.example` for Firebase + Cloudinary variables.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Firebase Auth + Firestore (ready to wire)
- Cloudinary for media uploads
