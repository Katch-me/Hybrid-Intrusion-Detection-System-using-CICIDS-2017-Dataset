
export default function ArchitectureCards() {
  const cards = [
    {
      stage: 'STAGE 1',
      title: 'Pre-processing',
      description: 'StandardScaler normalizes every feature, then PCA compresses the space while retaining 95% of the variance — cutting noise and training time before anything is classified.',
    },
    {
      stage: 'STAGE 2',
      title: 'Edge classification',
      description: "A Random Forest does the first pass. It's fast and interpretable, and clears the bulk of clearly-benign traffic so downstream models only see what's worth their time.",
    },
    {
      stage: 'STAGE 3',
      title: 'Cloud — GRU',
      description: "Suspicious sequences get reshaped into timesteps and passed through a 64-unit GRU layer, which picks up short-range temporal patterns with a lighter gating mechanism than LSTM.",
    },
    {
      stage: 'STAGE 4',
      title: 'Cloud — LSTM',
      description: "A second 64-unit LSTM layer refines the GRU's output, holding longer memory to catch slow, drawn-out attacks that a short window would miss entirely.",
    },
  ];

  return (
    <section id="architecture" className="max-w-[1080px] mx-auto px-7 py-16 scroll-mt-[62px]">
      <div className="mb-9">
        <div className="font-mono text-[11px] text-text-dim tracking-widest uppercase mb-2">
          01 — Architecture
        </div>
        <h2 className="font-display font-semibold text-2xl md:text-3xl text-text leading-tight">
          A fast filter, then a careful second look
        </h2>
        <p className="text-text-soft text-[14.5px] mt-2.5 max-w-[600px] leading-relaxed">
          Most traffic is obviously normal. The architecture is built to spend cheap, fast computation on that majority, and reserve the expensive deep sequence models for the traffic that actually warrants suspicion.
        </p>
      </div>

      {/* Embedded Model Architecture Diagram */}
      <div className="mb-10 bg-panel-2/40 border border-border-soft rounded-lg p-5 flex flex-col items-center">
        <img 
          src={import.meta.env.BASE_URL + "architecture-diagram.png"} 
          alt="Proposed Hybrid Model Architecture Workflow" 
          className="max-h-[300px] md:max-h-[400px] object-contain opacity-90 hover:opacity-100 transition-opacity duration-200"
        />
        <div className="font-mono text-[10.5px] text-text-dim mt-4 uppercase tracking-wider text-center">
          Fig. 1 — Proposed Hybrid Model Architecture Pipeline Workflow (from Conference Paper)
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card, i) => (
          <div 
            key={i} 
            className="bg-panel border border-border rounded-lg p-5 flex flex-col justify-between hover:border-signal/50 transition-colors duration-200"
          >
            <div>
              <div className="font-mono text-[10.5px] text-signal tracking-widest uppercase">
                {card.stage}
              </div>
              <h3 className="font-display font-semibold text-base mt-2 text-text">
                {card.title}
              </h3>
              <p className="text-text-soft text-[13px] leading-relaxed mt-2">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
