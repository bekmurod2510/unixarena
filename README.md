# UnixArena

**A gamified, social platform for learning Linux together.**

Learn Linux in a real in-browser terminal, then race a friend 1v1 on the same task. After each race both players see how the other solved it, turning competition into peer learning. The Linux VM runs on the learner's own device through WebAssembly, so there is nothing to install and no server to pay for.

> Graduation project (Development, D-Type) · Software Engineering · Faculty of Computing · New Uzbekistan University
> Project code: GP-26-SE-D-22

## Status

**Iteration 1: Foundation & Planning.** The repository contains the planning documents and a first working browser terminal: a Linux VM that boots in the page and gives you a shell. Accounts, challenges and everything else are not built yet.

| Document | Contents |
|---|---|
| [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md) | Problem statement, six-month scope, background survey |

## Run it

Requires Node.js 20 or newer.

```
npm install
npm run dev
```

The browser opens straight into a Linux terminal. The first run downloads the BIOS files and a ~10 MB Linux image into `public/v86/`.

Built with Vite, TypeScript and Tailwind CSS. The terminal currently boots the Buildroot Linux image published by the v86 project. The Alpine Linux image planned in the proposal will replace it.

## Why

The command line is core to software engineering, security, DevOps and AI work, yet beginners find it intimidating. Existing ways to practise have three recurring problems:

- **Setup barrier.** You need Linux, a VM, WSL or an SSH client before the first command.
- **Solo by design.** Most platforms offer a leaderboard at best; nobody sees how anyone else solved a task.
- **Real servers cost money.** Platforms that give learners a real machine have to pay for it, which pushes content behind limits or paywalls.

UnixArena's answer is a real Linux system that boots inside the browser tab, with friends racing on the same task and comparing solutions afterwards.

## What we are building

| # | Objective |
|---|---|
| 1 | In-browser Linux: v86 + Alpine Linux + xterm.js |
| 2 | 40+ auto-graded challenges in 8 modules |
| 3 | XP, streaks, achievements, leaderboards |
| 4 | Friends, 1v1 Race mode with Elo, post-race solution comparison |
| 5 | Deployment at $0/month and evaluation with NewUU students |

**Target users:** NewUU computing students and self-learners; instructors secondarily.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Client      React web app · xterm.js + v86 + Alpine Linux    │
├──────────────────────────────────────────────────────────────┤
│ Backend     Supabase Auth + REST · Edge Functions            │
│             (flags, XP, Elo) · Realtime (races)              │
├──────────────────────────────────────────────────────────────┤
│ Data        PostgreSQL + Row-Level Security · IndexedDB      │
│             image cache · static CDN · command-history logs  │
└──────────────────────────────────────────────────────────────┘
```

The VM runs on the client; the server issues flags, validates and scores.

## Tech stack

| Area | Choice |
|---|---|
| Frontend | React + Vite, TypeScript, Tailwind CSS |
| Terminal & VM | xterm.js, v86, Alpine Linux (32-bit) |
| Backend | Supabase: Auth, Realtime, Edge Functions |
| Database | PostgreSQL (Supabase) with Row-Level Security |
| Testing | Vitest, Playwright, custom challenge validator |
| DevOps | GitHub Actions, Cloudflare Pages / Vercel, Docker |
| Design | Figma, draw.io |

Everything is on a free tier or under an open-source licence, which is a hard constraint of the project.

## Timeline

28 weeks across two semesters, November 2026 to May 2027.

| Iteration | Weeks | Period | Deliverable |
|---|---|---|---|
| 1. Foundation & Planning | 1–6 | Nov–Dec 2026 | Requirements, design, wireframes, browser terminal |
| 2. Core Development | 7–14 | Dec 2026–Feb 2027 | Prototype: sign up, solve challenges, earn XP |
| 3. Integration & Secondary Features | 15–22 | Mar–Apr 2027 | Deployed system: friends, Race mode, 40+ challenges |
| 4. Evaluation & Submission | 23–28 | Apr–May 2027 | Final system, evaluation results, report, live demo |

## Team

| Member | Area |
|---|---|
| Ag'zamxo'ja Nug'monov | TBD |
| Hasan Soliyev | TBD |
| Bekmurod O'ktamov | TBD |

The three areas from the proposal are frontend & UX, backend & real-time, and Linux environment & content.

**Supervisor:** Qobiljon Toshnazarov
