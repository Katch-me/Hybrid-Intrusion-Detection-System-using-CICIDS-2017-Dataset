import { useState, useEffect } from 'react';

interface MetricData {
  label: string;
  acc: number;
  prec: number;
  rec: number;
  f1: number;
  note: string | null;
}

const DATA: Record<string, MetricData> = {
  ddos: { label: 'DDoS', acc: 99.86, prec: 0.9932, rec: 0.9780, f1: 0.9855, note: null },
  dos: { label: 'DoS', acc: 99.36, prec: 0.9804, rec: 0.9427, f1: 0.9612, note: null },
  portscan: { label: 'Port Scanning', acc: 98.92, prec: 0.8694, rec: 0.8691, f1: 0.8692, note: null },
  bruteforce: { label: 'Brute Force', acc: 98.31, prec: 0.8123, rec: 0.8912, f1: 0.8499, note: null },
  webattack: {
    label: 'Web Attacks',
    acc: 96.42,
    prec: 0.7631,
    rec: 0.7520,
    f1: 0.7575,
    note: 'Lower-frequency class in CICIDS-2017 — fewer training samples pull precision and recall down even though accuracy stays high.',
  },
  botnet: {
    label: 'Botnet',
    acc: 95.21,
    prec: 0.7125,
    rec: 0.7019,
    f1: 0.7072,
    note: 'The rarest class in the dataset. This is the clearest case where accuracy alone overstates performance — F1 and recall tell the real story.',
  },
};

export default function ResultsExplorer() {
  const [selectedKey, setSelectedKey] = useState<string>('ddos');
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Retrigger animation on selection change
    setAnimate(false);
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, [selectedKey]);

  const current = DATA[selectedKey];

  return (
    <section id="results" className="max-w-[1080px] mx-auto px-7 py-16 scroll-mt-[62px]">
      <div className="mb-9">
        <div className="font-mono text-[11px] text-text-dim tracking-widest uppercase mb-2">
          02 — Results
        </div>
        <h2 className="font-display font-semibold text-2xl md:text-3xl text-text leading-tight">
          Performance, broken down by attack type
        </h2>
        <p className="text-text-soft text-[14.5px] mt-2.5 max-w-[600px] leading-relaxed">
          Pick an attack category to see how the pipeline performed on binary classification (normal traffic vs. that attack) on CICIDS-2017.
        </p>
      </div>

      {/* Selector Chips */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Attack Type Selection">
        {Object.entries(DATA).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setSelectedKey(key)}
            role="tab"
            aria-selected={selectedKey === key}
            aria-controls="metrics-display-panel"
            id={`tab-${key}`}
            className={`font-mono text-xs px-3.5 py-2.2 rounded-[7px] border transition-all duration-150 cursor-pointer ${
              selectedKey === key
                ? 'border-signal text-signal bg-signal/10'
                : 'border-border text-text-soft hover:border-text-dim hover:text-text bg-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Metrics Panel */}
      <div 
        id="metrics-display-panel"
        role="tabpanel"
        aria-labelledby={`tab-${selectedKey}`}
        className="bg-panel border border-border rounded-lg p-7"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {/* Accuracy */}
          <div className="flex flex-col">
            <span className="font-mono text-[10.5px] text-text-dim tracking-wider uppercase">
              Accuracy
            </span>
            <span className="font-display text-2xl md:text-3xl font-semibold text-text mt-1.5 font-mono">
              {current.acc.toFixed(2)}%
            </span>
            <div className="h-1.5 w-full bg-panel-2 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-signal rounded-full bar-fill-transition" 
                style={{ width: animate ? `${current.acc}%` : '0%' }}
              />
            </div>
          </div>

          {/* Precision */}
          <div className="flex flex-col">
            <span className="font-mono text-[10.5px] text-text-dim tracking-wider uppercase">
              Precision
            </span>
            <span className="font-display text-2xl md:text-3xl font-semibold text-text mt-1.5 font-mono">
              {current.prec.toFixed(4)}
            </span>
            <div className="h-1.5 w-full bg-panel-2 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-signal rounded-full bar-fill-transition" 
                style={{ width: animate ? `${current.prec * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Recall */}
          <div className="flex flex-col">
            <span className="font-mono text-[10.5px] text-text-dim tracking-wider uppercase">
              Recall
            </span>
            <span className="font-display text-2xl md:text-3xl font-semibold text-text mt-1.5 font-mono">
              {current.rec.toFixed(4)}
            </span>
            <div className="h-1.5 w-full bg-panel-2 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-signal rounded-full bar-fill-transition" 
                style={{ width: animate ? `${current.rec * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* F1-Score */}
          <div className="flex flex-col">
            <span className="font-mono text-[10.5px] text-text-dim tracking-wider uppercase">
              F1-Score
            </span>
            <span className="font-display text-2xl md:text-3xl font-semibold text-text mt-1.5 font-mono">
              {current.f1.toFixed(4)}
            </span>
            <div className="h-1.5 w-full bg-panel-2 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-signal rounded-full bar-fill-transition" 
                style={{ width: animate ? `${current.f1 * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Warning Alert Note */}
        {current.note && (
          <div 
            className="flex items-start gap-2.5 p-3.5 border border-amber/25 bg-amber/5 rounded-lg text-[12.5px] text-text-soft"
            role="alert"
          >
            <span className="font-mono font-semibold text-amber text-sm leading-none" aria-hidden="true">
              ⚠
            </span>
            <span>{current.note}</span>
          </div>
        )}
      </div>
    </section>
  );
}
