# Traveller Lifepath

An unofficial, browser-based character generator for the Traveller roleplaying game.
Walks a player through Mongoose Traveller 2022 character creation step by step:
basics, characteristics, background skills, optional pre-career education, careers
(qualification → basic training → skill tables → survival → events → commission →
advancement → aging), mustering out, skill packages, and a printable sheet.

**Live demo:** https://bytesbynelson.github.io/traveller-lifepath/

> ⚠️ This is a non-commercial fan tool. It is not affiliated with, endorsed by, or
> sponsored by Mongoose Publishing or Far Future Enterprises. See the
> [legal notice](#legal-notice) below.

## Status

In active development. Most of the canonical lifepath flow works end-to-end across
all twelve careers and both the University and Military Academy pre-career tracks,
including: pre-career events, military academy auto-entry, term continuation,
commission/officer carry-over between terms, aging (with crisis), all four
connection types, the Skills/Equipment/Psionics chapters, and full mustering-out
with carried benefit-roll DMs. Built with a discriminated-union effect DSL so adding
new rules is a matter of writing data, not code.

The repo's commit history doubles as a (verbose) changelog if you want to see what
landed when.

## Stack

- Vite 5 + React 18 + TypeScript (strict)
- Tailwind CSS for styling
- HashRouter (so it deploys clean on GitHub Pages with no SPA fallback config)
- `useSyncExternalStore` for the in-memory store, persisted to `localStorage` with a
  schema-versioned migration
- Vitest + Testing Library + jsdom for unit/component tests
- Playwright for headless smoke tests against the deployed site
- GitHub Actions for type-check, test, build, and Pages deploy on every push to `main`

## Local development

```bash
npm install
npm run dev          # vite dev server on :5173
npm test             # full unit + component suite (vitest)
npm run build        # tsc --noEmit && vite build
npm run smoke        # Playwright smoke tests against the deployed site
```

Append `?debug=1` (or `#debug=1`) to the URL to enable verbose console logging — every
engine effect applied, every prompt resolved, every wizard phase change, every
character delta. Useful when reporting bugs (paste the console transcript).

## Project layout

```
src/
  data/         pure JSON-ish rulebook data (careers, skills, life events,
                aging, equipment, psionics, etc.)
  engine/      pure-functional rules engine: an Effect DSL + state machine
                that pauses on prompts the wizard can resolve
  wizard/      the multi-step character-creation flow
  components/  shared UI primitives (HybridDice, PendingPrompt, sheet, etc.)
  pages/       route-level shells (CharacterListPage, WizardPage, SheetPage)
  store/       persistence + cross-tab sync layer
  types/       shared type definitions, including the discriminated Effect union
```

The engine and the data are deliberately UI-free — they can be exercised entirely
from tests without rendering anything. The wizard is the only layer that translates
engine state into screens.

## Legal notice

Traveller and all related trademarks are the property of Far Future Enterprises.
The Traveller game system is published by Mongoose Publishing under license. This
project is a non-commercial fan tool that uses the Traveller rules system as
reference for a character-creation aid; **no rulebook text or art is reproduced
beyond what is necessary to drive the generator**, and game mechanics are
implemented from the structural rules rather than copied from the book.

If you intend to actually run or play Traveller, **please purchase the
[Mongoose Traveller 2022 Core Rulebook](https://www.mongoosepublishing.com/collections/traveller)**.
This tool is a planning aid, not a substitute for the book.

This project is not affiliated with, endorsed by, or sponsored by Mongoose
Publishing or Far Future Enterprises. If a representative of either rights-holder
has concerns about this project, please open an issue or contact the maintainer
and concerns will be addressed promptly.

## Code license

Source code is released under the MIT License — see `LICENSE` if/when added. The
license applies only to the code, not to any rules content, names, or marks owned
by Far Future Enterprises or Mongoose Publishing.
