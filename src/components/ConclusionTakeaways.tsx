
export default function ConclusionTakeaways() {
  return (
    <section className="max-w-[1080px] mx-auto px-7 py-16">
      <div className="mb-9">
        <div className="font-mono text-[11px] text-text-dim tracking-widest uppercase mb-2">
          05 — Takeaways
        </div>
        <h2 className="font-display font-semibold text-2xl md:text-3xl text-text leading-tight">
          What held up, and what's next
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {/* What Worked */}
        <div>
          <h4 className="font-display font-semibold text-sm text-text-dim tracking-wider uppercase mb-3.5">
            What worked
          </h4>
          <ul className="list-none space-y-3.5 pl-0">
            <li className="text-[13.5px] text-text-soft border-b border-border-soft pb-3.5 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-signal">
              F1-scores above 0.95 on the dataset's dominant attacks — DDoS, DoS, Brute Force.
            </li>
            <li className="text-[13.5px] text-text-soft border-b border-border-soft pb-3.5 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-signal">
              PCA cut dimensionality with negligible accuracy loss, speeding up training meaningfully.
            </li>
            <li className="text-[13.5px] text-text-soft border-b last:border-b-0 pb-3.5 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-signal">
              The RF pre-filter kept the expensive GRU/LSTM stages from ever touching most benign traffic.
            </li>
          </ul>
        </div>

        {/* Where It's Headed */}
        <div>
          <h4 className="font-display font-semibold text-sm text-text-dim tracking-wider uppercase mb-3.5">
            Where it's headed
          </h4>
          <ul className="list-none space-y-3.5 pl-0">
            <li className="text-[13.5px] text-text-soft border-b border-border-soft pb-3.5 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-signal">
              Multi-class classification instead of one-vs-normal binary framing.
            </li>
            <li className="text-[13.5px] text-text-soft border-b border-border-soft pb-3.5 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-signal">
              Class-imbalance handling — SMOTE / ADASYN / GANs — for rare attacks like Botnet.
            </li>
            <li className="text-[13.5px] text-text-soft border-b last:border-b-0 pb-3.5 pl-5 relative before:content-['→'] before:absolute before:left-0 before:text-signal">
              Attention mechanisms for interpretability, and real-time edge-cloud deployment testing.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
