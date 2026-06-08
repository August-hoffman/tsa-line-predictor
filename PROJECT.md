# PROJECT.md — TSA Line Predictor

Read this first at the start of every session.

## What we're building
A consumer app that **predicts how long the airport security (TSA) line will be**,
so a traveler knows when to leave home and what to expect — before they get there.

## The bet (Week 1, from August's draft)
- **What:** App that aggregates pre-existing TSA reporting tools into one source for travelers.
- **Who:** People who travel through large airports. *(Gate rating: VAGUE — needs a real person.)*
- **How:** Standalone app on the iOS / Android stores.
- **Numbers:** 10% of ~5B global travelers × $1.99. *(Gate rating: EMPTY — invented market, circular logic.)*

Specificity Gate flagged **Q4 (Numbers)** as the line most likely to be wrong:
it assumes 10% of all global flyers pay $1.99 for data they can get free. The open
question to validate: *find one monthly+ flyer and ask what they actually did last
time TSA lines were a problem, and whether they'd have paid $2 to predict it.*

## What the prototype is (and isn't)
First build = a **working MVP to put in front of a flyer**, not the full venture.
- Pick an airport → see predicted wait now (standard + PreCheck), best time to
  arrive in the next 6 hrs, and a 12-hour forecast.
- 6 airports seeded, **SEA featured** (August's home airport).

### Data — the honest state
- **Prediction is the hero.** Waits are modeled from a hand-built heuristic that
  mirrors published TSA throughput shapes (4–7am rush, midday dip, 4–6pm peak,
  day-of-week effects). It is **not yet trained on real historical data** — the code
  is structured so a real per-airport/per-hour table drops in without UI changes.
- **Live data is thin.** The only official feed is the MyTSA web service
  (`apps.tsa.dhs.gov/MyTSAWebService`) — crowd-sourced, HTTP-only, often stale.
  The app tries it with a 2.5s timeout and falls back to the model. TSA also
  publishes historical throughput on data.gov (future training source).

## Stack
Next.js 14 (App Router) + React 18 + Tailwind 3. Supabase / auth / payments
**not yet added** — not needed to test the core value. Target deploy: Vercel; source: GitHub.

## File map
- `app/page.js` — UI (client): airport picker, hero card, best-time, forecast bars.
- `app/api/wait/route.js` — API: tries live MyTSA, returns model prediction + forecast.
- `lib/airports.js` — airport reference data (base waits, PreCheck factor, timezone).
- `lib/predict.js` — prediction engine (hour/day curves, timezone-aware, forecast, best window).

## Status / where we left off
- [x] Prototype built and tested locally (build passes; API + edge cases + timezone verified).
- [ ] Deploy to a live URL (GitHub + Vercel) — needs August to authorize connectors.
- [ ] Use it to run the Week-1 validation interview with one real frequent flyer.

## Known limitations
- Predictions are modeled, not real-time/accurate yet — labeled as such in the UI.
- No accounts, no payments, no notifications.
- 6 airports only.
