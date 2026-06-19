
export default function Methodology() {
  return (
    <section id="method" className="max-w-[1080px] mx-auto px-7 py-16 scroll-mt-[62px]">
      <div className="mb-9">
        <div className="font-mono text-[11px] text-text-dim tracking-widest uppercase mb-2">
          04 — Method
        </div>
        <h2 className="font-display font-semibold text-2xl md:text-3xl text-text leading-tight">
          Why a cascade, not a single model
        </h2>
        <p className="text-text-soft text-[14.5px] mt-2.5 max-w-[600px] leading-relaxed">
          Each stage is chosen for what the previous one can't see.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Random Forest Card */}
        <div className="bg-panel border border-border rounded-lg p-5.5">
          <h4 className="font-display font-semibold text-base text-text mb-2">
            Random Forest — edge layer
          </h4>
          <p className="text-text-soft text-[13px] leading-relaxed">
            Trained on the PCA-reduced feature set, it gives fast, interpretable feature-importance rankings and clears the majority of benign traffic before anything reaches the deep models.
          </p>
        </div>

        {/* GRU Card */}
        <div className="bg-panel border border-border rounded-lg p-5.5 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-base text-text mb-2">
              GRU — short-range temporal signal
            </h4>
            <p className="text-text-soft text-[13px] leading-relaxed">
              Surviving sequences are reshaped into timesteps. The GRU's update and reset gates let it learn recent dependencies without the heavier parameter count of an LSTM.
            </p>
          </div>
          <details className="mt-3.5 group">
            <summary className="font-mono text-[11px] text-signal cursor-pointer hover:underline list-none flex items-center gap-1 select-none">
              <span className="inline-block transition-transform duration-200 group-open:rotate-90">▶</span>
              Show gate equations
            </summary>
            <div className="font-mono text-[11.5px] text-text-soft bg-panel-2/70 border border-border-soft rounded-md p-3.5 mt-2.5 leading-relaxed overflow-x-auto whitespace-pre">
              {`z_t = σ(W_z·x_t + U_z·h_t−1 + b_z)
r_t = σ(W_r·x_t + U_r·h_t−1 + b_r)
h̃_t = tanh(W_h·x_t + U_h·(r_t⊙h_t−1) + b_h)
h_t = (1−z_t)⊙h_t−1 + z_t⊙h̃_t`}
            </div>
          </details>
        </div>

        {/* LSTM Card */}
        <div className="bg-panel border border-border rounded-lg p-5.5 flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-base text-text mb-2">
              LSTM — long-range refinement
            </h4>
            <p className="text-text-soft text-[13px] leading-relaxed">
              Chained after the GRU, its forget/input/output gates and persistent cell state catch slow, drawn-out attack patterns a short window would miss.
            </p>
          </div>
          <details className="mt-3.5 group">
            <summary className="font-mono text-[11px] text-signal cursor-pointer hover:underline list-none flex items-center gap-1 select-none">
              <span className="inline-block transition-transform duration-200 group-open:rotate-90">▶</span>
              Show gate equations
            </summary>
            <div className="font-mono text-[11.5px] text-text-soft bg-panel-2/70 border border-border-soft rounded-md p-3.5 mt-2.5 leading-relaxed overflow-x-auto whitespace-pre">
              {`f_t = σ(W_f·x_t + U_f·h_t−1 + b_f)
i_t = σ(W_i·x_t + U_i·h_t−1 + b_i)
c̃_t = tanh(W_c·x_t + U_c·h_t−1 + b_c)
c_t = f_t⊙c_t−1 + i_t⊙c̃_t
h_t = o_t⊙tanh(c_t)`}
            </div>
          </details>
        </div>

        {/* Evaluation Card */}
        <div className="bg-panel border border-border rounded-lg p-5.5">
          <h4 className="font-display font-semibold text-base text-text mb-2">
            Evaluation
          </h4>
          <p className="text-text-soft text-[13px] leading-relaxed">
            Accuracy, precision, recall, F1, RMSE, MAE, MCC and Cohen's Kappa — chosen specifically because raw accuracy is misleading once class imbalance enters the picture, which it does here for Botnet and Web Attacks.
          </p>
        </div>
      </div>
    </section>
  );
}
