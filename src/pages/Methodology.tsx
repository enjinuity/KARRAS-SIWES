const principles = [
  {
    title: 'What the MVP models',
    body: 'KARRAS evaluates concept-stage bridge crossing feasibility by combining waterway conditions, span demand, navigation clearance, support strategy, and material choice in a deterministic rule engine.',
  },
  {
    title: 'What the scores mean',
    body: 'Feasibility and stability indicate concept strength. Cost and complexity act as counterweights so users can compare practical trade-offs rather than chase a single number.',
  },
  {
    title: 'What the MVP does not claim',
    body: 'This is not certified structural analysis and not construction approval software. It is a decision-support layer for early exploration and option screening.',
  },
];

const workflow = [
  'Normalize raw user inputs into a stable scenario object.',
  'Calculate span demand, hydraulic demand, clearance adequacy, support coverage, and load stress.',
  'Aggregate weighted scores into feasibility, stability, cost, and complexity.',
  'Generate dominant risks and practical recommendations from threshold rules.',
];

export default function Methodology() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Methodology</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] text-zinc-50 xl:text-6xl">
          An explainable simulation layer built for concept-stage decision quality.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400">
          The MVP is intentionally rule-based and transparent. Every score on the dashboard traces back to visible
          inputs and understandable model assumptions, which keeps the platform useful even before richer datasets or
          advanced calibration arrive.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {principles.map((principle) => (
          <article key={principle.title} className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Principle</p>
            <h2 className="mt-3 font-display text-3xl text-zinc-50">{principle.title}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{principle.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <article className="rounded-[32px] border border-white/10 bg-zinc-950/70 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Scoring Workflow</p>
          <div className="mt-6 space-y-4">
            {workflow.map((item, index) => (
              <div key={item} className="flex gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10 font-display text-lg text-cyan-100">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(255,255,255,0.03))] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Future Expansion</p>
          <h2 className="mt-4 font-display text-4xl text-zinc-50">Why this architecture matters.</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-300">
            The same input-model-output pipeline can support road alignment, urban flow, and capacity planning modules.
            The MVP proves the core contract: structured constraints in, explainable simulation logic through, visual
            insight out.
          </p>
          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Boundaries</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
              <li>Uses local browser persistence for saved scenarios in the MVP.</li>
              <li>Authenticated accounts now sync scenarios into a SQLite-backed backend store.</li>
              <li>Assumes deterministic rule weights instead of machine learning.</li>
              <li>Supports comparison and explanation before collaboration or export workflows.</li>
            </ul>
          </div>
        </article>
      </section>
    </div>
  );
}
