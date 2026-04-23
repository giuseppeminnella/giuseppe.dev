---
title: Engineering as containment
date: 2026-04-23
layout: layouts/post.njk
description: Notes from a talk I gave in Bologna on AI-induced drift, quiet failures, and why engineering should make it expensive to add things.
image: /assets/images/bologna-drift.jpg
---
Yesterday I had the pleasure of speaking at the [BolognaJS](https://www.bolognajs.com/) meetup ([event details here](https://www.meetup.com/bologna-js-meetup/events/314310959/)). The topic is something that’s been bothering me a lot lately: what happens when we let our LLMs do a bit *too* much thinking for us.

---

(By the way, the talk was in Italian, and they'll eventually post the recording on the [BolognaJS YouTube channel](https://www.youtube.com/@bolognajs/featured). But the core message is universal enough.)

![Engineering as Containment](/assets/images/bologna-drift.jpg)

Last year, my talks looked completely different. I was advocating for agent orchestration all the way down, pushing provocative concepts like "Department as a service".

![Building context](/assets/images/bologna-context.jpg)

The idea was simple: you don't tell the machine what to do anymore, you just build the context and let it operate autonomously. The orchestrator delegates to agents, the product owner watches, and so on. It sounded great.

But today, my view has changed. 

---

Here’s the thing. What really scares me about the way we use AI in engineering right now isn't the obvious stuff. I don't care about hallucinated functions or code that doesn't compile. Those are "loud" failures. They break things immediately, someone notices, and they get fixed before lunch.

What scares me is the **quiet failure**.

Quiet failures are insidious. They look totally plausible. They sail right through code review. They get merged, they deploy to production, and then they blow up three sprints later when everyone has completely forgotten why that code was even written in the first place.

LLMs are absolute masters of this.

If you don't keep them on a short leash, they suffer from what I call **drift**. You ask for a simple change—maybe just displaying a date field—and the model decides it should also normalize everything to the server's timezone, regardless of the user's locale. It sounds like a helpful improvement, right? But suddenly, you've just inherited a brand new business rule that nobody actually asked for.

A simple CRUD screen silently grows into a massive operational dashboard. A local frontend change suddenly requires coordinating three different tools. And before you know it, an implementation detail has warped your entire architecture.

---

And this creates a vicious feedback loop.

![The AI doom loop](/assets/images/bologna-doom-loop.jpg)

The AI adds moving parts. That increases the cognitive load on the team. To deal with the extra cognitive load, the team leans even harder on the AI to understand what's going on. The system grows even larger, and suddenly, overengineering doesn't just feel like an accident—**it feels necessary**.

On paper, it looks like you're moving incredibly fast. You're shipping so much code! But your actual throughput plummets, because you're spending all your time reviewing, coordinating, and trying to keep this sprawling mess coherent.

---

The fix isn't some shiny new AI tool. It's boring, old-school engineering discipline.

Before you let the AI add anything, you have to ask: Is this actually required? Is it in the right bounded context? Does it add state, or new semantics, or new authority? Are we willing to maintain this forever?

We're talking about Domain-Driven Design. YAGNI. Clear interfaces. Explicit boundaries.

The other half of the equation is tooling governance. In our team, we use curated whitelists for AI skills, shared versioning, and explicit conventions that tie directly into our workflows. We even run automated evaluations to make sure the models are actually respecting those boundaries over time. Because if you aren't measuring it, you're just hoping for the best.

---

Right now, there's immense social pressure to be "AI-enhanced" at all costs. It shifts the entire conversation from "Is this the right solution?" to "Why is this taking so long when we have AI?"

That second question is toxic. It kills quality.

Containment might feel slower in the short term, but it's the only thing that actually protects your delivery in the long run.

AI has made it incredibly cheap to expand a system. That means the real job of engineering today is to: **make it expensive to add things**.

---

Thanks again to everyone at BolognaJS. It was a great crowd, and exactly the kind of conversation we need to be having right now.