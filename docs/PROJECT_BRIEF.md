# UnixArena: Project Brief

Problem statement, scope and background survey for the UnixArena graduation project (GP-26-SE-D-22). This document expands the approved proposal into a working reference for the team.

- [1. Problem statement and scope](#1-problem-statement-and-scope)
- [2. Background survey](#2-background-survey)
- [3. Open questions](#3-open-questions)
- [References](#references)

---

## 1. Problem statement and scope

### 1.1 Problem

The command line is a core skill for software engineering, security, DevOps and AI work, but beginners often give up on it early. We see four causes:

1. **Setup comes before learning.** Practising requires a Linux install, a virtual machine, WSL or an SSH client. A student on a locked-down lab PC or a low-end laptop hits this wall before typing a single command.
2. **Practice is solitary.** Existing platforms are single-player. At most they offer a leaderboard, which shows *that* someone else finished but not *how*. Learners get no exposure to alternative solutions.
3. **Real machines cost money.** Platforms that give each learner a real server pay per session, so content ends up behind usage limits or paywalls.
4. **Tutorials do not check your work.** Text-based lessons explain commands but rarely verify that the learner can actually use them.

### 1.2 Who it is for

| User | Need |
|---|---|
| NewUU computing students (primary) | Practise Linux for coursework without installing anything |
| Self-learners (primary) | A free, structured path with feedback |
| Instructors (secondary) | A ready set of auto-graded exercises to point students to |

### 1.3 Proposed solution

UnixArena is a single-page web app that boots a real Alpine Linux image inside the browser tab using v86 (an x86 emulator compiled to WebAssembly) and shows it through xterm.js. Learners work through auto-graded challenges, earn XP, and can race a friend 1v1 on the same task. After a race, both players see each other's command history side by side.

Because the VM runs on the learner's device, the platform needs no compute servers. Supabase's free tier handles accounts, the database, real-time race updates and server-side scoring.

**Primary goal:** a free, browser-based platform to master the Linux command line through hands-on challenges and real-time play with friends.

### 1.4 Objectives

| # | Objective | Done when |
|---|---|---|
| O1 | In-browser Linux | Alpine boots in v86 and is usable through xterm.js; terminal ready in ≤ 10 s on first visit and ≤ 3 s cached |
| O2 | Challenge content | 40+ auto-graded challenges across 8 modules, each defined in YAML and verified in CI |
| O3 | Gamification | XP, streaks, achievements and leaderboards work end to end |
| O4 | Social play | Friends list, 1v1 Race with Elo rating, post-race solution comparison |
| O5 | Deploy and evaluate | Live at $0/month; evaluated with NewUU student volunteers |

### 1.5 Scope

The project runs for about six months, from November 2026 to graduation in May 2027 (28 weeks). Scope is set by what three students can build, test and evaluate in that time.

**In scope**

- In-browser terminal (v86 + Alpine + xterm.js)
- 8 learning modules, 40+ challenges with automatic checking
- Accounts, XP, streaks, achievements, leaderboards
- Friends, 1v1 Race mode, Elo rating, post-race comparison
- Hints and a daily challenge
- A YAML challenge format with a CI validator
- A user evaluation with NewUU students

**Out of scope**

| Excluded | Reason |
|---|---|
| Co-op and spectator modes | Future work; 1v1 is enough to test the social hypothesis |
| Server-hosted VMs | Breaks the $0 constraint |
| Native mobile apps | A terminal needs a keyboard; web only |
| AI tutor | Separate research problem, and has a running cost |
| Payments | The platform is free |
| 64-bit and networking topics | v86 emulates 32-bit x86 and has no network access by default |

### 1.6 Six-month plan

| Iteration | Weeks | Period | Key tasks | Deliverable |
|---|---|---|---|---|
| 1. Foundation & Planning | 1–6 | Nov–Dec 2026 | Student survey (20+ responses), repo, CI, Supabase project, YAML challenge format | Requirements, design, wireframes, working browser terminal |
| 2. Core Development | 7–14 | Dec 2026–Feb 2027 | Auth, challenge engine, database, game logic, Modules 1–3 | Prototype: sign up, solve challenges, earn XP |
| 3. Integration & Secondary Features | 15–22 | Mar–Apr 2027 | Friends, leaderboards, Race + Elo, hints, daily challenge, remaining modules | Deployed system with 40+ challenges |
| 4. Evaluation & Submission | 23–28 | Apr–May 2027 | Pre/post test, SUS survey, 15+ testers, fixes, report | Final system, evaluation results, report, live demo |

Work is split into three areas: frontend & UX, backend & real-time, and Linux environment & content.

### 1.7 Success criteria

**Learning and engagement**

- Post-test score at least 20 points above pre-test (20-question Linux skills test, one-week trial)
- Learners in friend mode complete more challenges than solo learners
- At least 80% of first-time users finish Module 1 unaided
- 40+ challenges across 8 modules, all CI-verified
- Monthly infrastructure cost of $0

**Usability and performance** (measured on a mid-range laptop)

- SUS score ≥ 70 from at least 15 student testers
- Terminal ready in ≤ 10 s on first visit, ≤ 3 s cached
- Checker verdict within 2 s
- Race updates reach the opponent within 1 s
- All in-scope features pass end-to-end tests

### 1.8 Constraints and risks

| Risk | Impact | Mitigation |
|---|---|---|
| v86 boot time is too slow | Fails the 10 s target; users leave | Restore from a saved VM state instead of cold booting; cache the image in IndexedDB |
| The VM runs on the client, so the client cannot be trusted | Cheating in races and on leaderboards | Flags issued and validated server-side in Edge Functions; XP and Elo computed server-side only |
| Supabase free-tier limits (connections, function calls, storage) | Outage during evaluation | Measure usage early; keep the VM image on a static CDN, not in Supabase storage |
| Writing 40+ good challenges takes longer than expected | O2 slips | YAML format and validator ready in Iteration 1; content written continuously from Iteration 2 |
| Too few evaluation volunteers | Weak evaluation results | Recruit during the Iteration 1 survey; keep the trial to one week |
| Low-end devices cannot run the emulator well | Excludes part of the target audience | Test on a mid-range laptop from the first prototype; keep the Alpine image minimal |

---

## 2. Background survey

The survey covers three areas: existing platforms for learning Linux, the technology for running Linux in a browser, and research on gamification and command-line learning.

### 2.1 Existing Linux learning platforms

| Platform | How it works | Strengths | Limitations for our users |
|---|---|---|---|
| **OverTheWire Bandit** [1] | Wargame played over SSH; each level's solution is the password for the next | Real Linux system; well-designed difficulty curve; free | Needs an SSH client; no accounts or progress tracking; single-player |
| **Linux Journey** [2] | Free text lessons with quizzes | Clear beginner path; no setup | Mostly reading; little hands-on checking; no multiplayer |
| **SadServers** [3] | Troubleshooting scenarios on real cloud VMs with automatic checking | Realistic tasks; auto-checked | Each session uses a real server, so it costs the operator money; aimed at intermediate users; single-player |
| **Killercoda** [4] | Interactive scenarios on server-hosted environments, in the browser | No setup; real environment | Server-hosted and time-limited sessions; single-player |
| **pwn.college** [5] | Browser-accessible challenges with flags, including Linux fundamentals | Flag-based auto-grading; free; large content base | Server-hosted containers; security focus; leaderboard only |
| **cmdchallenge** [6] | Short one-line shell tasks in the browser | Instant start; auto-checked | Commands run server-side; one-liners only; no learning path or social features |

**What we take from them**

- From Bandit and pwn.college: the flag model, where finding a secret proves the task is done.
- From SadServers and cmdchallenge: automatic checking of the system state, not just of the typed command.
- From Linux Journey: a module structure that starts from zero.

**What none of them do**

- Run the Linux system on the learner's device, removing server cost.
- Let two learners work on the same task at the same time.
- Show learners each other's solutions after the task.

### 2.2 Running Linux in the browser

| Option | Approach | Licence | Fit |
|---|---|---|---|
| **v86** [7] | x86 emulator compiled to WebAssembly; boots unmodified 32-bit Linux images | BSD (open source) | **Chosen.** Self-hostable as static files, supports saving and restoring VM state |
| **WebVM / CheerpX** [8] | x86-to-WebAssembly virtualisation by Leaning Technologies | Proprietary engine with usage restrictions | Excluded because of hosting and licensing restrictions |
| **JSLinux** [9] | Fabrice Bellard's in-browser emulator | Not designed as an embeddable library | Useful as proof the approach works, not as a base |
| **Server-side containers** | Docker or VM per user, streamed to the browser | n/a | Excluded: costs money per session |

Consequences of choosing v86:

- Only 32-bit x86, so 64-bit-only software is unavailable.
- No network access from the VM by default, so networking topics are out of scope.
- Emulation is slower than native execution. Challenges must stay lightweight, and boot time has to be handled by restoring a saved state.

### 2.3 Research

| Work | Finding | Use in UnixArena |
|---|---|---|
| **Sailer & Homner (2020)** [10], meta-analysis of gamification in learning | Gamification has small but significant positive effects on cognitive, motivational and behavioural learning outcomes. Combining competition with collaboration was more effective for behavioural outcomes than competition alone. | Central justification for the design: a race (competition) followed by solution exchange (collaboration) |
| **Švábenský et al. (2021)** [11], toolset for collecting shell commands in hands-on training | Logging learners' shell commands gives instructors and researchers insight into how tasks were solved | Basis for capturing command history and for the post-race comparison view |
| **Deterding et al. (2011)** [12] | Defines gamification as the use of game design elements in non-game contexts | Vocabulary for our game elements: XP, streaks, achievements, leaderboards |
| **Hamari, Koivisto & Sarsa (2014)** [13], review of empirical gamification studies | Gamification mostly produces positive effects, but results depend on context and on the users | Reason to evaluate with our own users instead of assuming the effect |
| **Elo (1978)** [14]; **Pelánek (2016)** [15] | The Elo system estimates skill from pairwise results; Pelánek shows its use in educational systems | Race matchmaking and rating |
| **Brooke (1996)** [16]; **Bangor et al. (2008)** [17] | The System Usability Scale is a 10-item usability questionnaire; scores around 68–70 are the usual threshold for acceptable usability | Our SUS ≥ 70 target |

### 2.4 Research gap and positioning

1. Linux learning platforms are single-player. Leaderboards exist; shared tasks and solution exchange do not.
2. Platforms that offer a real Linux system rely on paid servers.
3. Research supports mixing competition with collaboration, but we found few studies testing this for command-line learning specifically.

UnixArena is positioned as a friend-first Linux learning platform: real Linux at $0 through v86, with races followed by solution exchange. The evaluation in Iteration 4 tests whether friend mode leads to more completed challenges than solo practice.

---

## 3. Open questions

Points to settle during Iteration 1, several of them worth raising with the supervisor.

1. **Trust model.** The VM runs on the client, so a determined user can read anything inside the image. How strong does anti-cheat need to be for a graduation project: per-session flags generated server-side, or is validating the final state enough?
2. **Checking method.** Should a challenge be checked by flag, by inspecting VM state (files, permissions, processes), or both?
3. **Command capture.** Where is command history captured for the post-race comparison: in the shell inside the VM, or from the xterm.js input stream?
4. **Evaluation design.** Is a one-week pre/post test with 15+ volunteers enough, and do we need a control group for the friend-versus-solo comparison?
5. **Module list.** Which 8 topics, and in what order? The Iteration 1 student survey should inform this.
6. **Ethics.** Does collecting command logs and test scores from student volunteers need formal approval or a consent form?

---

## References

Platform descriptions reflect our reading of each site and should be re-checked before they are cited in the final report.

1. OverTheWire. *Bandit wargame.* https://overthewire.org/wargames/bandit/
2. *Linux Journey.* https://linuxjourney.com/
3. *SadServers.* https://sadservers.com/
4. *Killercoda.* https://killercoda.com/
5. *pwn.college.* https://pwn.college/
6. *cmdchallenge.* https://cmdchallenge.com/
7. copy. *v86: x86 PC emulator and x86-to-wasm JIT, running in the browser.* https://github.com/copy/v86
8. Leaning Technologies. *WebVM.* https://webvm.io/
9. Bellard, F. *JSLinux.* https://bellard.org/jslinux/
10. Sailer, M., & Homner, L. (2020). The gamification of learning: A meta-analysis. *Educational Psychology Review, 32*, 77–112.
11. Švábenský, V., Vykopal, J., Tovarňák, D., & Čeleda, P. (2021). Toolset for collecting shell commands and its application in hands-on cybersecurity training. *IEEE Frontiers in Education Conference (FIE).*
12. Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining "gamification". *Proceedings of the 15th International Academic MindTrek Conference*, 9–15.
13. Hamari, J., Koivisto, J., & Sarsa, H. (2014). Does gamification work? A literature review of empirical studies on gamification. *47th Hawaii International Conference on System Sciences*, 3025–3034.
14. Elo, A. E. (1978). *The Rating of Chessplayers, Past and Present.* Arco.
15. Pelánek, R. (2016). Applications of the Elo rating system in adaptive educational systems. *Computers & Education, 98*, 169–179.
16. Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In *Usability Evaluation in Industry* (pp. 189–194). Taylor & Francis.
17. Bangor, A., Kortum, P. T., & Miller, J. T. (2008). An empirical evaluation of the System Usability Scale. *International Journal of Human–Computer Interaction, 24*(6), 574–594.
