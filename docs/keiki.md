# Keiki text check-in endpoint

Keiki (the SMS/iMessage agent) calls this when someone replies to a nudge. Every inbound message counts as a check-in for that person's current day, stored with `source: 'text'`, so it shows up live in the app. A person can be in several crews; one text checks them in to every crew they belong to (one check-in per crew, each crew's feed shows it "via text").

## URL

```
POST https://<deployment>.convex.site/checkin
```

Note the `.convex.site` host (HTTP actions), not `.convex.cloud`. Locally it is `EXPO_PUBLIC_CONVEX_SITE_URL` from `.env.local` (`http://127.0.0.1:3211`).

## Headers

| header | value |
|---|---|
| `Authorization` | `Bearer <KEIKI_SHARED_SECRET>` |
| `Content-Type` | `application/json` |

## Request

```json
{
  "phone": "+14155550142",
  "text": "done! walked the dog",
  "mediaUrl": "https://example.com/photo.jpg",
  "messageId": "msg_123"
}
```

- `phone` (required): any common format. It is normalized to E.164 the way onboarding stores it: 10 digits get `+1`, 11 digits starting with 1 get `+`, and an explicit `+` number keeps its digits.
- `text` (optional): stored as the check-in note, trimmed, max 280 chars.
- `mediaUrl` (optional): fetched by the backend and stored as the check-in photo. It must be publicly fetchable (or pre-signed). If the fetch fails, the check-in still goes through without a photo.
- `messageId` (optional): accepted for Keiki's own logging; not stored.

The person is looked up by phone, then every crew membership they have. Each crew is checked in for its own `currentDay`. A second message on the same day does not double count: that crew's result says `alreadyCheckedIn: true` and only fills in a note or photo the first check-in lacked.

## Response 200

```json
{
  "ok": true,
  "alreadyCheckedIn": false,
  "results": [
    { "group": { "id": "j97...", "name": "Family" }, "alreadyCheckedIn": false, "day": "2026-11-15", "streak": 1 },
    { "group": { "id": "j97...", "name": "Friends" }, "alreadyCheckedIn": false, "day": "2026-11-15", "streak": 3 }
  ],
  "day": "2026-11-15",
  "name": "Maya",
  "goal": "Walk 20 minutes",
  "replyText": "Logged for Family (day one), Friends (3-day streak). Bad days, good nights."
}
```

`replyText` is ready to text back. With one crew it reads like before (`Logged. 3-day streak. Bad days, good nights.` / `Already logged today. 3-day streak, still going.`). Top-level `alreadyCheckedIn` is `true` only when every crew was already checked in (kept for backwards compatibility). Top-level `day` and `goal` come from the most recently joined crew. `goal` and `name` are `null` when unset.

## Errors

| status | body `error` | meaning |
|---|---|---|
| 400 | `invalid_json` | body is not a JSON object |
| 400 | `missing_phone` | no `phone` string |
| 400 | `invalid_phone` | phone can't be normalized to E.164 |
| 401 | `unauthorized` | missing or wrong bearer secret |
| 404 | `unknown_phone` | no user has this phone |
| 404 | `no_group` | user exists but isn't in a crew yet |
| 500 | `KEIKI_SHARED_SECRET is not set on this deployment` | set the secret (below) |

Every error body is `{ "ok": false, "error": "..." }`.

## curl

```bash
SITE=https://<deployment>.convex.site

curl -s -X POST "$SITE/checkin" \
  -H "Authorization: Bearer $KEIKI_SHARED_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"phone":"4155550142","text":"done","mediaUrl":"https://example.com/photo.jpg","messageId":"msg_1"}'

curl -s -X POST "$SITE/checkin" \
  -H "Authorization: Bearer $KEIKI_SHARED_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+14155550142","mediaUrl":"https://example.com/photo.jpg"}'
```

## Setting the secret

Generate a value and set it on the deployment. Give the same value to Keiki. Never commit it or paste it into a PR.

```bash
npx convex env set KEIKI_SHARED_SECRET "$(openssl rand -hex 32)"
npx convex env get KEIKI_SHARED_SECRET   # copy into Keiki's config
```

Use `--prod` to set it on the production deployment.

## Testing locally

`internal.keiki.seedTestUser` creates a user with a phone, a crew, and a member (internal only, not callable from clients):

```bash
npx convex run keiki:seedTestUser '{"phone":"4155550142","name":"Maya","goal":"Walk 20 minutes","today":"2026-11-15"}'
```
