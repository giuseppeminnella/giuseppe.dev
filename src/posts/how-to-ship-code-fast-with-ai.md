---
title: How to ship code fast with AI without paying for it later
date: 2026-10-22
layout: layouts/post.njk
description: "My buildersklub talk on drift, where the time really goes, and why engineering has to make acceptance expensive. Two slides, and every link I shared on stage."
image: /assets/images/buildersklub-drift.png
image_alt: "A line leaves its intended path and lands away from the target, the drift marked in yellow."
image_width: 1200
image_height: 630
---
On 22 October I spoke at [buildersklub](https://luma.com/builde-xnpy), at the Deutsche Bank Berlin Technology Centre. It was the fourth edition of [Engineering as containment](/posts/engineering-as-containment-bologna-talk/).

The argument fits in two lines: **AI makes expansion cheap. Engineering must make acceptance expensive.**

![If AI makes expansion cheap, then engineering must make acceptance expensive: adoption must be selective, integration must be constrained, authority must be explicit. You are the bad cop.](/assets/images/buildersklub-thesis.png)

One practical way to do it with agents: give them the big picture, and ask for a small change.

![Curate the context: the agent reads patches from all over the codebase, and changes a few boxes in one of them. Big context, little changes.](/assets/images/buildersklub-curate-the-context.png)

## Glossary

Every link I shared on stage, in the order it came up.

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
