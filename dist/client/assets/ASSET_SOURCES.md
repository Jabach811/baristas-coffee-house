# Asset sources — Barista's Coffee House, Tracy CA

Collected 2026-08-09 for a **spec / cold-pitch build**. Barista's has not commissioned this site
and has not granted image rights.

Nothing in this folder is cleared for a live, public launch. Every photograph below was published
by a third-party listing platform (DoorDash's merchant CDN, joe coffee's shop gallery). The
merchant supplied most of them to those platforms, but the platform — not this project — holds the
publishing agreement. Before this site goes live, either Barista's re-supplies the photos directly
or they get reshot.

No logins were used, no paywalls or bot walls were bypassed, and no private endpoints were called.
Every URL below is publicly reachable without an account.

## `listings/` — reference only, permission needed

| File | Description | Source page |
|---|---|---|
| `dd-header.jpg` | Wide spread: three iced drinks, panini, bagel sandwiches, muffin on marble | DoorDash store header, `doordash.com/store/baristas-coffee-house-tracy-1250787/` |
| `dd-28829754-…jpg` | Iced latte in a branded Barista's cup on a black mesh table | Same DoorDash store page, item photo |
| `dd-34c30b10-…jpg` | Ham/turkey panini, cut, on parchment | Same DoorDash store page, item photo |
| `dd-343c0db2-…jpg` | Pesto turkey panini, cut, on a glass plate | Same DoorDash store page, item photo |
| `dd-cd08c80c-…jpg` | Asiago bagel sandwich with salami and pepperoncini | Same DoorDash store page, item photo |
| `joe-0.jpg` | Storefront on West 10th — awning, window decal, patio tables | joe coffee shop gallery, `joe.coffee/locations/ca/tracy/baristas-tracy/` |
| `joe-1.jpg` | Table shot: two blended drinks, a panini in foil, a cheese danish | Same joe coffee gallery |
| `joe-2.jpg` | Interior — counter, airpots, hand-written chalk menu boards | Same joe coffee gallery |
| `joe-3.jpg` | Caramel blended drink shot against the Barista's window decal | Same joe coffee gallery |
| `joe-4.jpg` | Two branded iced drinks on a patio table, menu boards behind | Same joe coffee gallery |

## `images/` — the twelve in use on the site

Working copies, renamed for legibility. Same provenance and the same restriction as above.

| File | From |
|---|---|
| `hero-spread.jpg` | `listings/dd-header.jpg` |
| `drink-iced-latte.jpg` | `listings/dd-28829754-…jpg` |
| `drink-caramel-window.jpg` | `listings/joe-3.jpg` |
| `drinks-pair-counter.jpg` | `listings/joe-4.jpg` |
| `panini-ham-turkey.jpg` | `listings/dd-34c30b10-…jpg` |
| `panini-pesto-turkey.jpg` | `listings/dd-343c0db2-…jpg` |
| `bagel-asiago.jpg` | `listings/dd-cd08c80c-…jpg` |
| `storefront.jpg` | `listings/joe-0.jpg` |
| `interior-menu-boards.jpg` | `listings/joe-2.jpg` |
| `drinks-cold-trio.jpg` | Crop of `listings/dd-header.jpg`, left 930×560 |
| `breakfast-bagel-sandwich.jpg` | Crop of `listings/dd-header.jpg`, 1080×625 at x60 y500 |
| `pastry-danish-table.jpg` | Crop of `listings/joe-1.jpg` onto the danish, upscaled 2× to 890×700 |

**`drinks-cold-trio.jpg` is a stand-in.** It runs under the *Smoothies & slushies* heading, but no
photo in this set shows a fruit smoothie or a slushie — it is a cold blended coffee drink. Replace
it when Barista's supplies a real one.

## Rejected sources

**Restaurant Guru** — 13 images pulled and all 13 discarded. Every file was a four-up contact-sheet
collage with a cartoon chef mascot watermark burned in. Not usable at any size. Deleted.

**DoorDash customer-uploaded photos** (the `media/ugc/` path) — two pulled, both discarded. One was
a background-removed phone snapshot; the other looked like generic stock rather than this shop.
Customer uploads also carry the customer's rights, not the merchant's. Deleted.

**Instagram and Facebook** — not attempted. Both require a session for image access, and Barista's
only published outbound link (Instagram bio → `facebook.com/baristastracy`) is broken for
logged-out visitors.

## Menu data

Item names and descriptions came from the Caviar mirror of the DoorDash menu
(`trycaviar.com/store/baristas-coffee-house-tracy-1250787/`), 151 unique items across 17 categories.

**Prices were deliberately left off the site.** The only prices reachable without an account are
delivery-marked-up ones — a Panini reads $7.50 there against $6.25 on the pickup storefront, roughly
a 20% spread. Publishing the delivery figures as the shop's prices would overstate them by about a
fifth. Real counter prices go in when Barista's supplies them.

## Business facts used in the structured data

| Fact | Value | Where it came from |
|---|---|---|
| Address | 112 W 10th St, Tracy, CA 95376 | Consistent across DoorDash, Yelp, joe coffee |
| Phone | (209) 830-6050 | Yelp listing |
| Hours | Mon–Fri 7am–4pm, Sat 7am–3pm, closed Sun | Yelp listing, matches the shop's chalkboard |
| Rating | 4.6 from 550+ | joe coffee shop page — the most conservative verified pair available |

The rating in the page's structured data is deliberately the low estimate. DoorDash alone shows 4.8
across 10,000+ ratings, but mixing platform figures into one `aggregateRating` overstates it.
Swap in the live Google Business Profile numbers before launch.
