---
title: The fastest way to lose control
date: 2026-06-03
layout: layouts/post.njk
description: "A shorter follow-up to Engineering as Containment, from the Berlin talk: speed is fun in prototypes, but production AI needs posture, boundaries, and tooling controls."
image: /assets/images/cheese-rolling-chris-anderson.jpg
---
<p>Outside work, I am probably the last person who should lecture anyone about engineering discipline.</p>

<p>Give me a weekend, a stupid idea, and a decent model, and I become exactly the kind of person I warn teams about. I code like there is no tomorrow. No tests. No safety net. No migration plan. No turning back. Just reckless rolling down the hill after the cheese.</p>

<figure>
  <img src="/assets/images/cheese-rolling-chris-anderson.jpg" alt="Chris Anderson leading a men's downhill cheese rolling race at Cooper's Hill.">
  <figcaption>More or less the energy. Photo by <a href="https://commons.wikimedia.org/wiki/File:Cheese_Rolling_2006_-_Chris_Anderson_leading_the_3rd_men%27s_downhill_race.jpg">Flickr user chrisjglos</a>, <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>, via Wikimedia Commons.</figcaption>
</figure>

<p><strong>When it comes to prototypes, I am the developer your mother told you to stay away from.</strong></p>

<p>At the beginning of 2026, I built an entire little trading platform. Not a couple of screens, not a landing page. A whole thing: strategies, backtests, charts, a dashboard, enough moving parts to make it feel real.</p>

<p>Then I threw it away.</p>

<p>Then I rebuilt it. Then I threw that away too. I did it three times, with different stacks, because the point was not to create a bank-grade system. The point was to chase the idea while it was still hot, learn something, laugh at the weird parts, and not care too much if the whole thing collapsed under its own enthusiasm.</p>

<figure>
  <img src="/assets/images/berlin-side-projects.png" alt="A slide showing a trading platform screenshot and the line: Do it. Throw it away. Do it again, and again, and again.">
  <figcaption>If this already sounds like an expensive hobby, yes, that is part of the problem.</figcaption>
</figure>

<p>I love that mode. AI is absurdly fun there. You can follow every impulse. You can spike, delete, restart, change stack, change architecture, pretend you are a very serious quant with a 100 euro paper-trading experiment and a suspicious amount of confidence.</p>

<p>I thrive there. I like speed with very few controls.</p>

<section>
  <h2>Then work is different</h2>

  <p>But that is exactly why I do not trust the same instinct in my everyday job.</p>

  <figure>
    <img src="/assets/images/berlin-dirty-tricky-business.png" alt="A slide showing miners and the line: And everyday job is a dirty, tricky business.">
  </figure>

  <p>At work, especially in regulated environments, AI kicks different. The stakes are not a weekend side project. They are not my tiny paper-trading fantasy. You are inside a large organization, with customers, money, audit trails, compliance, production incidents, and other teams who have to live with what you ship.</p>

  <p>Rules are not there for decoration. Some of them are boring. Some of them are badly explained. Some of them are painful. But a lot of them are just institutional memory in disguise: this thing broke before, this ambiguity hurt someone, this shortcut became expensive, this data must not move casually.</p>

  <p>So the problem is not that AI makes you fast. I like fast. The problem is that the side-project mode can sneak into places where speed is not the main constraint.</p>
</section>

<section>
  <h2>The clean wrong shape</h2>

  <p>It is not that the model writes bad code.</p>

  <p><strong>Bad code is easy.</strong> Bad code gives itself away. It fails tests, looks weird, breaks the build, triggers the ordinary instincts of a developer.</p>

  <p>The dangerous code is the code that looks fine.</p>

  <p>It has the right naming style. The folder structure is plausible. The tests are not embarrassing. The abstraction has a respectable shape. You can imagine someone defending it in a review with words like <strong>future-proof</strong>, <strong>scalable</strong>, or <strong>clean separation of concerns</strong>.</p>

  <p>And still, something has slipped.</p>

  <p>The problem was smaller than the solution. The prototype accidentally became architecture. A temporary label became a domain concept. A simple workflow grew a permission system, a cache, an event stream, or a generic error framework because the model has seen that shape before and it knows how to make it look professional.</p>
</section>

<section>
  <h2>Faster than what?</h2>

  <p>This is why <strong>"AI writes code faster"</strong> is such an incomplete sentence.</p>

  <p>Faster than we can type? Obviously.</p>

  <p>Faster than we can understand? Often.</p>

  <p><strong>Faster than we can decide whether the code should exist?</strong> That is where it gets expensive.</p>

  <figure>
    <img src="/assets/images/berlin-cognitive-budget.png" alt="Giuseppe presenting a slide that says: As a team, you must defend your cognitive budget.">
    <figcaption>Berlin, 2026. The slide I probably should have left on screen for longer.</figcaption>
  </figure>

  <p>Software used to have a built-in brake: human effort. Writing code was slow enough that we had time to notice what we were doing. That brake was annoying, but it also protected us. It limited the size of changes. It made complexity expensive. It forced some amount of local understanding before a system could grow.</p>

  <p>AI removes a lot of that friction. That is useful. It is also why engineering has to change function.</p>

  <p>The job is no longer just to produce movement. The job is to keep movement governable.</p>
</section>

<figure>
  <img src="/assets/images/berlin-expansion-cheap.png" alt="A slide saying: AI makes expansion cheap. Engineering must make acceptance expensive.">
  <figcaption>The line that survived the talk: expansion is cheap now, acceptance should not be.</figcaption>
</figure>

<section>
  <h2>A different posture</h2>

  <p>This is where I think the word <strong>containment</strong> helps.</p>

  <p>Containment is not being scared of AI. It is not pretending that hand-written code is morally better. It is a change of posture.</p>

  <p>In a side project, I want the model to run ahead of me. I want it to open doors I did not ask for. I want it to try a weird stack, invent a shortcut, generate the ugly first version, and give me something to react to.</p>

  <p>At work, that same energy needs friction. Not because speed is bad, but because acceptance has consequences. A prototype can be deleted on Sunday night. A production concept might sit in a bank for years, acquire owners, appear in audit logs, shape other teams' assumptions, and become expensive to undo.</p>

  <p>So containment is the senior engineer looking at a beautiful AI-generated abstraction and saying: <strong>nice, delete it</strong>.</p>
</section>

<section>
  <h2>...and posture is not enough</h2>

  <p>But this cannot live only as an attitude in someone's head. "Be careful" is not a system. "Use judgment" is not a control.</p>

  <p>Containment needs tooling controls.</p>

  <p>Tool access is authority. If an assistant can read Jira, Figma, Confluence, the repo, production logs, analytics, policy documents, translation files, and old incidents, it has not just gained context. It has gained many ways to make the wrong thing feel relevant.</p>

  <p><strong>This is why I like specs in the repo. Keep the intent, the business logic, the reason we are doing something, and the shape of the decision as close as possible to the code.</strong></p>

  <figure>
    <img src="/assets/images/repo-specs-tree-rings.jpg" alt="Close-up of tree rings in a cut trunk.">
    <figcaption>Tree rings are not a report about the tree. They are the history, stored in the material. Photo by <a href="https://unsplash.com/photos/close-up-of-a-tree-trunk-cross-section-with-rings-R_AEkZakqCE">Diego Romeo</a>.</figcaption>
  </figure>

  <p>Then the specs are versioned. Changes can be evaluated against the current codebase. A pipeline can detect the gap, suggest the tickets, and agents can work through those tickets under the same controls as everyone else.</p>
</section>

<section>
  <h2>Keep it together over time</h2>

  <p>But even that is not enough by itself. A pipeline that judges a spec change and creates tickets is useful. It is not containment if the agents running those tickets drift freely, change their habits silently, or evolve outside the team's understanding.</p>

  <p>The hard part is keeping the whole loop coherent: specs, code, tickets, agents, prompts, tools, evaluations, and quality gates. <strong>When the spec changes, the system should react predictably.</strong> When an agent changes, the system should notice. When generated work crosses a boundary, something should push back.</p>

  <p>I have been trying tools in this space: Angular's <a href="https://github.com/angular/web-codegen-scorer">web code generation scorer</a>, <a href="https://github.com/promptfoo/promptfoo">Promptfoo</a>, and especially <a href="https://github.com/adrianco/retort">Retort</a>. They are useful because they move the conversation from vibes to evidence. But the exact tools are not the point. This landscape changes every few months.</p>

  <p>The point is to keep the workflow together in time: maintain control, reduce drift, react when specs change, and keep those reactions legible.</p>
</section>

<section>
  <h2>The containment test</h2>

  <p>Before accepting AI-assisted work, ask:</p>

  <ol>
    <li>Is this solving the actual problem, or a more impressive adjacent one?</li>
    <li>Which assumption became code?</li>
    <li>Which tool or document gave the model authority to make that assumption?</li>
    <li>What will we have to own if this survives for two years?</li>
  </ol>

  <p>The theme is not discipline for its own sake. It is the difference between side-project speed, where consequences are disposable, and production work, where decisions accumulate.</p>

  <p>Containment is how that difference stays visible: intent close to the code, tools under control, agents evaluated over time, and changes accepted only when the organization can still explain them.</p>
</section>
