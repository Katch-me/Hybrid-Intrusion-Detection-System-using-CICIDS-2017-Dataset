
export default function StatsStrip() {
  const stats = [
    { value: '99.86%', label: 'Best accuracy — DDoS' },
    { value: '0.9855', label: 'Best F1-score — DDoS' },
    { value: '6', label: 'Attack classes evaluated' },
    { value: '3', label: 'Models cascaded — RF, GRU, LSTM' },
  ];

  return (
    <section className="max-w-[1080px] mx-auto px-7 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border-soft border border-border-soft rounded-lg overflow-hidden">
        {stats.map((stat, i) => (
          <div key={i} className="bg-panel p-5.5 flex flex-col justify-center min-h-[110px]">
            <div className="font-display text-2xl md:text-3xl font-semibold text-signal tracking-tight">
              {stat.value}
            </div>
            <div className="font-mono text-[10.5px] text-text-dim tracking-wider uppercase mt-1.5">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
