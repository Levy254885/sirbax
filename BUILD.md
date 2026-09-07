# sirbax — Build Progress

## Completed

### Phase 1 — Foundation
- [x] Next.js + TypeScript + Tailwind v4 project
- [x] Brand identity (sirbax)
- [x] Design tokens (light/dark/system)
- [x] Folder architecture
- [x] Auth context + demo mode (no Firebase keys required)
- [x] Anonymous nickname generator + abstract avatars
- [x] App shell: desktop sidebar + right rail + mobile bottom nav
- [x] Landing, Login, Register, Forgot password, Onboarding
- [x] Firestore security rules draft
- [x] Environment example
- [x] PWA manifest

### Phase 2 — Posts & Feed
- [x] Home feed with stories bar
- [x] Post composer (posting-as identity)
- [x] Post cards with reaction picker (7 reactions)
- [x] Post detail + comments UI
- [x] Demo data layer
- [x] postService / userService (demo + Firebase-ready)
- [x] Cloudinary upload service + `/api/upload` stub

### Phase 3 — Profiles, Explore, Notifications
- [x] Profile page (cover, stats, tabs)
- [x] Explore (search, trending, suggested people)
- [x] Notifications list with filters

### Phase 4 — Stories, Messaging, Communities
- [x] Stories bar (create + ring UI)
- [x] Messages list + full conversation view (send works in demo)
- [x] Communities list, detail, create

### Phase 5 — Saved, Memories, Events, Marketplace
- [x] Saved posts + collections
- [x] Memories
- [x] Events
- [x] Marketplace grid

### Phase 6 — Privacy & Moderation
- [x] Privacy settings (who can follow/message/comment/mention)
- [x] Report modal (categories)
- [x] Settings + theme toggle + logout

### Phase 7 — Polish (partial)
- [x] Skeleton loaders
- [x] Empty-state-ready patterns
- [x] Responsive breakpoints in shell
- [ ] Full a11y audit
- [ ] Real Firebase wiring
- [ ] Cloudinary production upload
- [ ] Infinite scroll + pagination
- [ ] Admin dashboard

## Run

```bash
npm install
npm run dev
```

Use **Try demo mode** on the landing page to explore the full UI without Firebase.
