# Hackathon log

- **Project:** RAINCHECK
- **Event:** YC Consumer Mobile Hackathon
- **What it does:** A small-crew daily check-in app ("Bad days, good nights."): each person sets a goal, checks in with a photo or a text, and a missed day earns a raincheck you owe your crew (tacos, a favor, a dare).
- **Live app:** https://peaceful-pony-277.convex.site
- **Repo:** private
- **Frontend:** Convex static hosting
- **Convex deployment:** https://peaceful-pony-277.convex.cloud
- **Components:** @convex-dev/static-hosting
- **Convex features:** schema, indexes, queries (live via useQuery), mutations, internal functions, file storage, HTTP actions, static hosting
- **Auth:** none
- **AI models:** none
- **Started:** 2026-11-15T17:42:34Z
- **Last updated:** 2026-11-16T01:27:20Z

## How it was built

Built in one day by Capy agents: a Captain thread planned the work and ran crew
threads and subagents in parallel (foundation, Keiki endpoint, home, onboarding,
rainchecks, restyle, mascot, multi-crew, web build). Each shipped as its own PR
(#3–#15); every PR was reviewed before merge, and merges waited for Sarmi's ok.
Revyl cloud iPhones (iPhone 17 Pro Max, iOS sim, Release builds, no dev client)
ran the real app between merges and fed bugs back as new PRs.

## Log

### 2026-11-15 - 35e82b9
Created the repository with a README naming the event. No app code or Convex
backend yet (`README.md`).

### 2026-11-15 - 5687cde, 6d3a3af
Started from an Expo Router + Convex starter (#2), then built the first RAINCHECK
MVP: onboarding, groups, goals, a live Today board and rainchecks (#3).
Convex features: schema, queries, mutations.

### 2026-11-15 - 66dd26a
Foundation (#4): tables for users, groups (invite codes), members, check-ins and
rainchecks with indexes (`by_phone`, `by_inviteCode`, `by_userId`,
`by_groupId_and_day`, …). Every check-in stores `source: 'app' | 'text'`.
Photo uploads go through Convex file storage (`convex/files.ts`:
`generateUploadUrl`, `getUrl`). Light iOS theme and UI primitives.

### 2026-11-15 - 9f188f9
Keiki text check-ins (#5): an HTTP action `POST /checkin` (`convex/http.ts`)
with a bearer shared secret, phone normalization, and an optional `mediaUrl` that
the backend fetches into file storage. Keiki runs the shared iMessage line
+1 779-625-1378, so a person can text their check-in and it appears live in the
app as "via text". Contract in `docs/keiki.md`.

### 2026-11-15 - d209905, 3156c18, b857e59
Home screen with a live today feed and check-in modal (#6); onboarding quiz,
"making your crew", invite code, text-nudge phone step and profile (#7); Crew tab
with rainchecks, cash-in with a photo, and a Sunday Reel shared to Stories via
`react-native-view-shot` + `expo-sharing` (#8). All screens read Convex with
`useQuery`, so check-ins from other phones or from text show up live.

### 2026-11-15 - 2961529
First Revyl run (T6) on main b857e59 caught a blocker: on the onboarding phone
step the keyboard covered "Text me" and "Skip" and couldn't be dismissed. It also
caught two clipped emoji (raincheck moment, last reel slide). Fixed in #9:
keyboard avoidance in the shared `Screen`, plus line heights. F1 re-ran on Revyl
and all four fixes passed.

### 2026-11-15 - 1d823f7
Snapchat/IG-feel restyle (#10): Avenir Next + Lilita One, springy reanimated
press states, haptics, gradients, and the Drizzle and Luna SVG mascots. S1
verified the full flow on a Revyl iPhone.

### 2026-11-15 - 0157f63
Multiple crews (#11), from Sarmi's ask to keep groups of people separate: one
person can be in friends, family and roommates crews, each with its own goal,
rainchecks and reel. Added `crews.mine` (`convex/crews.ts`), an active crew in
the session, a crew switcher, and new/join crew screens. A Keiki text check-in now
records in every crew the person belongs to and returns per-crew results. The PR
title says "photo-required", but that rule was reverted before merge: photos are
optional on text check-ins.

### 2026-11-15 - d31fd77
Revyl round 2 (T6b) on main 0157f63 confirmed the round-1 fixes and the
multi-crew flow. It caught a clipped join code, a letter-spaced placeholder, and
check-in not being one tap. #12 fixed these: one-tap check-in from the goal card,
an unclipped join code, a padded switcher, and the stake icon. Round 3 (T6c)
passed the one-tap check-in and the join code. Two follow-ups went in on the same
PR after T6c, the Crew-tab switcher and the placeholder spacing, and no Revyl run
has re-tested them.

### 2026-11-15 - af375f2, 835b93a, ad8ed90
Web build for the judge link (#13): the Expo web export served by
`@convex-dev/static-hosting` (`convex/convex.config.ts`, `registerStaticRoutes`
in `convex/http.ts`) at https://peaceful-pony-277.convex.site, with fallbacks for
icons, fonts and storage on web. Fixed web text inputs losing focus (#14). One
warm peach palette across the app (#15).

### 2026-11-16 - ad8ed90 (Revyl round 4)
After redeploying Convex to dev, Revyl round 4 (T6d) ran main ad8ed90 on a cloud
iPhone 17 Pro Max with no crashes. It covered fresh onboarding with a dare stake,
one-tap check-in, End day and the raincheck moment, cash-in with party Drizzle,
and the reel ending on Luna. Text in the peach palette stayed legible, and
`/checkin` still returned 401 without auth.

## Not done or not verified

- No real auth: the session is a stored user id on the device.
- The Revyl runs used iOS simulators. Nobody tested Expo Go on a physical phone,
  Android, or real push notifications.
- Since #9, the text-nudge phone step only saves the number; scheduled nudge
  texts are Keiki's side and aren't verified here.
- Revyl round 4 (T6d) re-ran main ad8ed90 with the #15 palette and passed, but
  it didn't specifically exercise the two #12 follow-ups after T6c (the Crew-tab
  switcher and the join-goal placeholder spacing).
- The judge link runs on the shared dev deployment, not a production deployment.
