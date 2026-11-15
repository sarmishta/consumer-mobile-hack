# RAINCHECK — Product Requirements

**One line:** Daily goals with friends and family. A missed day isn't a penalty; it becomes a raincheck: a hangout you owe your group.

**Tagline:** "Bad days, good nights."

## Users

Groups of 2–6 friends or family.

## Core loop

1. **Onboarding.** Three short swipeable intro cards:
   - "Pick one daily goal"
   - "Check in with your people"
   - "Miss a day? You owe them a raincheck, not a fine"

   Then enter your first name and pick an emoji avatar. No passwords: create a Convex user and keep its id on the device with `expo-secure-store`.
2. **Group.** Create a group (name) or join one with a 6-character invite code. Show the code with a Share button (React Native Share API).
3. **Goal.** Each member sets one daily goal: free text plus an emoji (e.g. gym, call Mom, read 10 pages).
4. **Home / Today.** A big card with my goal and a large "Done today" check-in button. Below it, a live list of every member with their goal and today's status (done / not yet), updating in real time via Convex queries, plus each member's current streak.
5. **Rainchecks.** An "End day" button (demo control) closes today. Every member who didn't check in gets a raincheck owed to the group, with a light suggested plan picked at random (coffee, dinner, movie night, call Grandma for family groups).
6. **Group screen.** Open rainchecks ("Sarmi owes the group coffee"), each with a "Cash it in" button that marks it done.

## Out of scope for this PR

Photos, reel, Instagram share, Keiki texts, Whop.

## Schema

| Table | Fields |
| --- | --- |
| users | name, avatar |
| groups | name, inviteCode, kind (friends / family), currentDay |
| members | groupId, userId, goal, emoji, streak |
| checkins | memberId, day (YYYY-MM-DD) |
| rainchecks | groupId, memberId, plan, day, cashedIn |

`groups.kind` drives the plan list (family groups can draw "a call to Grandma"), and `groups.currentDay` is the group's open day, which "End day" closes and advances. The starter's placeholder `items` table and screen are removed.

## Constraints

- Everything runs in Expo Go: no `expo-dev-client`, no native modules outside Expo Go.
- Every button and input carries a `testID` for Revyl.

## Design

Warm evening feel, not a generic template.

- Dark navy background `#0F1530`, cards `#1A2142` with 20px radius.
- Warm amber accent `#FFB547` for primary buttons, soft rain-blue `#7FA7FF` for secondary.
- White text, large friendly type (titles 28–34 bold), big emoji, generous spacing.
- Safe-area aware.
- A small raindrop / umbrella motif on onboarding.
