# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

The main application code is in the `web/` directory. All development commands should be run from there.

## Build and Development Commands

```bash
cd web
npm install
npm run dev        # Start development server at http://localhost:3002
npm run build      # Production build
npx tsc --noEmit   # Type check (there is no lint script in package.json)
```

## Project Overview

This is the official website for **きたげん（居酒屋）** - a Japanese izakaya restaurant.

**Purpose:**
- Convey the restaurant's atmosphere to first-time visitors
- Create trust and a "proper, reliable shop" impression
- Guide visitors to the menu, shop info and Instagram

**Pages:** Top, Menu (dinner / lunch), Takeout, Shop Info, Owner, News

## Content and Updates

- The site runs standalone. It does not depend on any external API or database
  (the former review-support API is no longer used).
- Menus, news and photos live in the repository:
  - `web/app/content/` — data files (`menus.ts`, `news.ts`) and the single loader (`index.ts`)
  - `web/public/images/` — photos
- There is no admin screen (CMS). News and photos will be connected to Instagram (phase 2);
  the loader in `web/app/content/index.ts` is the place to switch the source.
- Menu changes are handled by CoreLiftSystem by editing the code.

## Technical Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Design Principles

- Simple and stable over advanced features
- Content is kept in plain TS files and `public/` images
- No CMS, admin screen or complex state management
- Avoid over-engineering
