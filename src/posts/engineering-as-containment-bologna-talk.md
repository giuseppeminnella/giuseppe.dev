---
title: Engineering as containment
date: 2026-04-23
layout: layouts/post.njk
description: Notes from a talk I gave in Bologna on AI-induced drift, quiet failures, and why engineering should make it expensive to add things.
---
Yesterday I gave a talk in Bologna at [BolognaJS](https://www.bolognajs.com/) ([event page](https://www.meetup.com/bologna-js-meetup/events/314310959/)).

The talk was in Italian, but the core idea is simple enough in any language:

**AI makes expansion cheap. Engineering has to make admission expensive.**

The recording should show up on the [BolognaJS YouTube channel](https://www.youtube.com/@bolognajs/featured) at some point.

---

[IMAGE_PLACEHOLDER_1]

---

What worries me most is not obvious AI failure.

Obvious failure is loud. It breaks quickly. It gets fixed.

The dangerous one is quiet failure: output that looks plausible, passes review, gets merged, and creates damage later when the original context is gone.

LLMs are very good at producing that kind of failure.

---

The mechanism is drift.

And drift starts before code.

You ask for one thing; the model "improves" the ask and sneaks in extra semantics.

A small display requirement becomes a hidden business rule.
A simple screen becomes a mini platform.
A local change turns into multi-tool orchestration for no reason.
An implementation detail turns into architecture.
Then operations inherit all of it.

Step by step, reasonable-looking additions accumulate.

---

[IMAGE_PLACEHOLDER_2]

---

There is also a feedback loop that teams underestimate:

AI adds moving parts -> cognitive load goes up -> the team uses more AI to keep up -> the system grows further -> overengineering starts to feel necessary.

At that point, speed looks high, but real throughput drops.
You spend more time coordinating, reviewing and preserving coherence than solving the original problem.

---

The response is not magical.
It is mostly discipline.

Before introducing anything, ask:

- Is it actually required now?
- Is it in the right bounded context?
- Does it introduce state?
- Does it introduce new semantics or authority?
- Does it introduce a maintenance burden we are willing to own?

This is old material: DDD, YAGNI, clear interfaces, explicit schemas, ownership of vocabulary, anti-corruption boundaries.

Still boring. Still effective.

---

[IMAGE_PLACEHOLDER_3]

---

On tooling, I shared a practical setup that works well in corporate environments:

- curated skill discoverability through whitelists
- shared lock/versioning of skills
- explicit conventions tied to team workflows
- eval/scoring to verify that models still respect those conventions over time

Because once you add patterns and constraints, you need a way to measure whether the system is still following them.
Otherwise you are just trusting vibes.

---

There is also social pressure now to be "AI-enhanced" at all costs.

That pressure changes the team's internal question from:

"Is this the right solution?"

to:

"Why is this taking so long if AI is so fast?"

That second question is where quality starts to die.

Containment can feel slower in the short term.
In the medium term, it is what protects delivery.

---

Thanks again to everyone who joined in Bologna.
Good questions, good conversations, and exactly the kind of crowd that makes these topics worth discussing in public.
