
interface ComparisonRow {
  approach: string;
  accuracy: string;
  precision: string;
  recall: string;
  f1: string;
  isHighlight: boolean;
  paperUrl?: string;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    approach: 'This work — RF → GRU → LSTM',
    accuracy: '99.86%',
    precision: '0.9932',
    recall: '0.9780',
    f1: '0.9855',
    isHighlight: true,
    paperUrl: 'conference-paper.pdf',
  },
  {
    approach: 'PCA + RF + ML (Gautam et al.)',
    accuracy: '99.90%',
    precision: '0.9138',
    recall: '0.8951',
    f1: '—',
    isHighlight: false,
    paperUrl: 'https://doi.org/10.3390/electronics11213529',
  },
  {
    approach: 'Bidirectional RNN (Abdulhammed et al.)',
    accuracy: '99.13%',
    precision: '0.7566',
    recall: '0.7467',
    f1: '—',
    isHighlight: false,
    paperUrl: 'https://doi.org/10.3390/electronics8030322',
  },
  {
    approach: 'LSTM–GRU ensemble (Induru & Pushpakumar)',
    accuracy: '98.86%',
    precision: '0.8800',
    recall: '0.8900',
    f1: '0.8800',
    isHighlight: false,
    paperUrl: 'https://www.researchgate.net/publication/341774351_Combining_LSTM_and_GRU_for_efficient_intrusion_detection_and_alert_correlation_in_cloud_networks',
  },
  {
    approach: 'CNN–GRU hybrid (Henry et al.)',
    accuracy: '98.73%',
    precision: '0.8700',
    recall: '0.8800',
    f1: '0.8600',
    isHighlight: false,
    paperUrl: 'https://doi.org/10.3390/s23020890',
  },
  {
    approach: 'CNN + deep models (Pradeep & Gopalakrishnan)',
    accuracy: '97.40%',
    precision: '0.8600',
    recall: '0.8700',
    f1: '0.8600',
    isHighlight: false,
    paperUrl: 'https://doi.org/10.1109/ICISC62624.2024.00087',
  },
];

export default function ComparisonTable() {
  return (
    <section id="compare" className="max-w-[1080px] mx-auto px-7 py-16 scroll-mt-[62px]">
      <div className="mb-9">
        <div className="font-mono text-[11px] text-text-dim tracking-widest uppercase mb-2">
          03 — Comparison
        </div>
        <h2 className="font-display font-semibold text-2xl md:text-3xl text-text leading-tight">
          Against published literature
        </h2>
        <p className="text-text-soft text-[14.5px] mt-2.5 max-w-[600px] leading-relaxed">
          Benchmarked on the same dataset (CICIDS-2017, DDoS scenario) against five other published approaches.
        </p>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-panel">
        <table className="w-full border-collapse text-left text-xs md:text-[13px]">
          <thead>
            <tr className="border-b border-border bg-panel-2 font-mono text-[10.5px] text-text-dim tracking-wider uppercase">
              <th className="p-4 pl-5">Approach</th>
              <th className="p-4">Accuracy</th>
              <th className="p-4">Precision</th>
              <th className="p-4">Recall</th>
              <th className="p-4 pr-5">F1-Score</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DATA.map((row, i) => (
              <tr 
                key={i} 
                className={`border-b last:border-b-0 transition-colors duration-150 ${
                  row.isHighlight 
                    ? 'bg-signal/5 border-border-soft text-text font-medium' 
                    : 'border-border-soft text-text-soft hover:bg-panel-2/30'
                }`}
              >
                <td className="p-3.5 pl-5">
                  {row.paperUrl ? (
                    <a 
                      href={row.paperUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline inline-flex items-center gap-1.5 transition-colors duration-150 ${
                        row.isHighlight 
                          ? 'text-signal font-semibold hover:text-signal/80' 
                          : 'text-text-soft hover:text-text'
                      }`}
                    >
                      {row.approach}
                      <svg className="w-3.5 h-3.5 opacity-60 hover:opacity-100 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  ) : (
                    <span className={row.isHighlight ? 'text-signal font-semibold' : ''}>
                      {row.approach}
                    </span>
                  )}
                </td>
                <td className="p-3.5 font-mono">{row.accuracy}</td>
                <td className="p-3.5 font-mono">{row.precision}</td>
                <td className="p-3.5 font-mono">{row.recall}</td>
                <td className="p-3.5 pr-5 font-mono">{row.f1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
