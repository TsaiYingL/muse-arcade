# Muse Arcade: group chats make games, strangers play them, and the game introduces them

A friend group asks **@Muse** in Messenger to make them a game. Muse builds it from their chat: the inside jokes, who likes what, their favorite spots. When they want to share it, Muse makes a **public copy** with the private details removed, suggests **who should see it** (for example, only people in their city) and publishes a **snapshot that never changes**. Strangers play it in their Feed and leave comments. Muse reads the comments and tells the creators what players want, so they can ship **v2** (v1 stays playable). Other group chats can **import** a copy, and Muse rebuilds it around *their* chat. When a stranger keeps playing (and has opted in), Muse suggests them to the creators: **challenge them or say hi**.

Built for the Facebook "Closer Together" AI Hackathon on the Muse Model API. Builds on the Facebook + Messenger mockup from [calvinkarthik/Meta_Hackathon](https://github.com/calvinkarthik/Meta_Hackathon) (MIT).

## Run it

```bash
npm install
MUSE_API_KEY=<your key> npm run dev
```

Open **http://localhost:3100/?director=1**. The panel on the right switches whose phone you're looking at and plays scripted beats. Every beat runs through the same pipeline as a real tap.

Without `MUSE_API_KEY`, or if Muse can't be reached, every step uses a scripted fallback. That way the demo never breaks, and the director panel shows which mode you're in.

You can also open one browser window per person, all live at the same time:
`/?as=alex` (creator), `/?as=dana` (stranger in Austin), `/?as=diego` (another group chat), `/?as=lena` (lives in Chicago).

## The demo, step by step

1. **Alex** opens Messenger, then *the ramen council*, and sends the suggested `@muse make us a game…`. Muse writes a playable game that uses the chat's jokes (Jay's "mid" ratings are the obstacles, Priya's 11/10 egg is the bonus).
2. Tap **Publish**. Muse lists every private detail it rewrote (before → after, and why), writes the post, suggests **People in Austin** with a reason, and runs a safety check. Pick an audience and publish v1.
3. Switch to **Dana**. The game is in her Feed. She can play it, comment, and choose whether creators can reach out to her.
4. Beat **2: A day passes**. Strangers play and leave comments.
5. Back as **Alex**: Muse has grouped the comments ("a hard mode, asked by 5 players"). Tap **Add to next version**, then **Publish v2**. v1 is still listed and playable.
6. Muse also suggests **Dana**: 41 plays, #1, lives in Austin, also into ramen. Tap **Challenge**. As Dana, open the message request, then **Accept and play**. The result is posted back to the creators' chat.
7. Switch to **Diego** and tap **Import**, then *taco tuesday*. Muse rebuilds the game for his chat (soap stamps, because Kenji thinks cilantro tastes like soap) and offers the features players asked for.
8. Switch to **Lena** (Chicago). The game was published to Austin only, so it isn't in her Feed.

## Where Muse does the work

| Step | Model | What it does |
|---|---|---|
| make | Spark | request + chat history → a complete HTML game that uses 2–4 real details from the chat |
| publish pass | Spark | finds what's private (names, inside jokes, ratings tied to a person), rewrites the game, lists each change with a reason, writes the post, picks the smallest audience that fits and explains why, runs a safety check |
| read comments | Ember | groups free-text comments into requests with counts and a representative quote |
| revise | Spark | "add a hard mode" → new game code in the creators' private copy (published versions are never touched) |
| import | Spark | rebuilds a public game around another chat's own jokes and places |
| fans | Spark | picks which opted-in player the creators would most enjoy meeting (plays + skill + nearby + shared interests, never play count alone) and writes the intro |
| intent | Ember | decides what an `@muse` message is asking for |

## Rules the code enforces

- **Published versions never change.** A version stores its own HTML snapshot. Edits only touch the chat's private copy, and publishing again creates v2 next to v1.
- **Only the creating chat can publish new versions.** Anyone else imports a copy into their own chat, and the original's page counts imports.
- **Audience is enforced:** each version is only in the Feed of people its audience covers (`lib/world.ts`).
- **Fans must opt in.** Muse only considers players who turned on "Let creators of games I play reach out", never the creators themselves, and never the same person twice. The person suggested sees a message request they can ignore.
- **Generated games run sandboxed:** `sandbox="allow-scripts"` (no same-origin), a CSP that blocks all network, and a check that rejects `fetch`/`XMLHttpRequest`/`WebSocket`/external scripts. Games talk to the app only through `postMessage` (`init` in, `score` out).

## Code map

- `lib/server/ai.ts`: every Muse call, its prompt and schema, plus the scripted fallback
- `lib/server/engine.ts`: what each action does (build, publish, comment, revise, import, fans, challenge)
- `lib/server/template.ts`: the fallback game (one engine with different configs: private, public, hard mode, taco)
- `lib/server/store.ts`: shared live state, saved to `data/state.json`, pushed to every phone over SSE
- `components/live/*`: the live chat, game cards, publish sheet, Feed card and post page, director
- `components/screens/*`, `components/Phone.tsx`: the Facebook/Messenger mockup shell
