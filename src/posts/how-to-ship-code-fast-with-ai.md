---
title: How to ship code fast with AI without paying for it later
date: 2026-10-22
layout: layouts/post.njk
title_struck: "How to ship code <s>fast</s> with AI <s>without paying for it later</s>"
description: "My buildersklub keynote, the titles I did not pick, and every link I shared on stage."
image: /assets/images/buildersklub-drift.png
image_alt: "A line leaves its intended path and lands away from the target, the drift marked in yellow."
image_width: 1200
image_height: 630
---
On 22 October I gave the keynote at [buildersklub](https://luma.com/builde-xnpy), at the Deutsche Bank Berlin Technology Centre. It was the fourth edition of [Engineering as containment](/posts/engineering-as-containment-bologna-talk/).

The hardest part to prepare was the title. I wanted something a bit provocative, and I went through a lot of them. This is more or less how it went, as I showed it on stage:

<video class="on-dark" src="/assets/videos/buildersklub-titles.mp4" poster="/assets/videos/buildersklub-titles.jpg" width="1440" height="600" autoplay muted loop playsinline aria-label="The buildersklub title card. A cursor types and deletes the titles I did not pick: Eat your own slop. Human in the soup. Slop as a service. It works on my agent. Enterprise-grade brainrot. Then it types the real one, How to ship code fast with AI without paying for it later, while my portrait gets clown makeup and my role turns into AI Entertainer. Then fast and without paying for it later are struck through."></video>

I settled on the last one because it was the cheekiest of them all: unrealistic, clickbait, grotesque enough that nothing could beat it. Ship fast, with AI, and never pay for it? Sure.

It was also a challenge, because you actually can do something about it: go a bit faster, and regret a bit less. So I kept it, and spent 45 minutes correcting it.

The biggest problem is not the tooling. It's on the human side: our attention span, and our tendency to drift away from what we meant to do.

That's the good and the bad at the same time, because drifting is also where creativity thrives. The trick is to know where you are drifting. Drifting at home is not the same as drifting in a regulated environment. You can still do it there, but on purpose: not by mistake, and surely not because a machine suggests more complexity just because it can, and because today it's cheap.

<video src="/assets/videos/buildersklub-drift.mp4" poster="/assets/videos/buildersklub-drift.jpg" width="1440" height="600" autoplay muted loop playsinline aria-label="A line leaves the plan from start to goal and lands away from it, the drift marked in yellow. Zoom out: everyone in the team drifts. Zoom out again: squad, tribe, department, company, industry, everyone drifts, and every way back to the goal costs something. Then: And that was before AI."></video>

From there the talk went looking for answers. We talked about tooling and governance, about attention span, and about context, with OKF and OpenSpec. I won't spoil all of it here, just a taste:

<video src="/assets/videos/buildersklub-attention-and-context.mp4" poster="/assets/videos/buildersklub-attention-and-context.jpg" width="1440" height="600" autoplay muted loop playsinline aria-label="Attention as a cone of light. Spread over six agents, it fades before it reaches what is needed. Focused on one thread, it gets there, and while the agent works you go deeper into the problem. Then the brain next to the code: an OKF bundle in git, its pages written by an agent and vouched for by a person, changed through OpenSpec proposals."></video>

And in the end, it turns out we can unstrike the title. Somehow, and with realistic expectations: **How to ship code fast with AI without paying for it later**. After all, it's possible to be a bit faster, and to have fewer regrets.

<figure>
<img src="/assets/images/buildersklub-hypnotized.jpg" width="1400" height="933" alt="The room at buildersklub from the back, everyone watching the loop's spiral on the big screens. On it: This time I managed to hypnotize them. Now they really believe they can use AI fast, and without regrets.">
<figcaption>Photo: buildersklub</figcaption>
</figure>

## Every link from the talk

In the order it came up.

### Where the time goes

- [If you thought the speed of writing code was your problem, you have bigger problems](https://youtu.be/kSzbuPFjdQo), Andrew Murphy. The pipeline behind the bottleneck: widen one stage and the queue moves to the next.

### Stack the great filters

- [Retort](https://github.com/adrianco/retort), Adrian Cockcroft. Compares tooling stacks across models and environments, baseline against candidate, to decide what to promote or retire.
- [promptfoo](https://github.com/promptfoo/promptfoo). Tests prompts, models and agents against your own cases, so a change to your agents can be checked before it ships.

### Governance

- [skills.sh](https://skills.sh/). The public skills registry our own is a fork of, with trusted sources only.
- [Angular skills](https://github.com/angular/skills). Angular's own skills for coding agents.
- [mattpocock/skills](https://github.com/mattpocock/skills). Matt Pocock's skills, from his own agents directory.

### Keep it in a human head

- [Why is it so hard to do my work? The challenge of attention residue when switching between work tasks](https://doi.org/10.1016/j.obhdp.2009.04.002), Sophie Leroy, 2009. When you switch tasks, part of your attention stays on the one you left.
- [Executive control of cognitive processes in task switching](https://doi.org/10.1037/0096-1523.27.4.763), Joshua Rubinstein, David Meyer and Jeffrey Evans, 2001. Every switch costs time, and the cost grows with the complexity of the tasks.
- [Measuring the impact of early-2025 AI on experienced open-source developer productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), METR, 2025. Experienced developers with AI tools felt about 20% faster and were 19% slower. 16 developers, 246 tasks: read the authors' caveats before generalising.
- [How AI assistance impacts the formation of coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills), Anthropic, 2026. Developers who kept asking conceptual questions learned more than those who handed the code over.

### Write down what we know

- [Open Knowledge Format (OKF), spec v0.2](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md), Google Cloud. Plain markdown in git, where every page says who wrote it and who vouched for it.
- [OpenSpec](https://github.com/Fission-AI/OpenSpec), Fission AI. Every change is proposed before it lands.

### Tomorrow

- [Redesigning source control at Anthropic](https://www.anthropic.com/engineering/redesigning-source-control), Anthropic Engineering, 13 October 2026. What happens when coding stops being the bottleneck, and why the engineers' job becomes saying no.
- [Build your own AI software factory with Claude Code](https://www.youtube.com/watch?v=ctoaIC4LHmI), ZazenCodes, 7 October 2026. A small factory you can run today ([source code](https://github.com/zazencodes/zazencodes-season-3/tree/main/src/software-factory-claude-code)).

### Thanks

- [Brian Rigoni](https://www.linkedin.com/in/brian-rigoni/) and [Abdel Fortas](https://www.linkedin.com/in/fcmam5/), for the skills.
- [Paul Vitic](https://www.linkedin.com/in/paul-vitic/), for the curated brain close to the code.
- [Claudio Cicali](https://www.linkedin.com/in/claudiocicali/), for reviewing the talk.
