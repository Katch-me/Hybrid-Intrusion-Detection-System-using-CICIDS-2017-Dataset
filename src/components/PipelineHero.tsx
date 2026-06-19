import { useState, useEffect, useRef } from 'react';

interface Stage {
  name: string;
  sub: string;
}

const STAGES: Stage[] = [
  { name: 'CICIDS-2017', sub: 'raw traffic' },
  { name: 'PCA · Scale', sub: '95% variance' },
  { name: 'Random Forest', sub: 'edge filter' },
  { name: 'GRU → LSTM', sub: 'cloud, temporal' },
  { name: 'Verdict', sub: 'benign / attack' }
];

interface ActivePacket {
  id: number;
  isAttack: boolean;
  stageIndex: number;
  xOffset: number; // percentage along the track
}

export default function PipelineHero() {
  const [totalCount, setTotalCount] = useState(0);
  const [benignCount, setBenignCount] = useState(0);
  const [attackCount, setAttackCount] = useState(0);
  const [activePackets, setActivePackets] = useState<ActivePacket[]>([]);
  const packetIdRef = useRef(0);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);

  useEffect(() => {
    // Timer to spawn packets
    const spawnInterval = setInterval(() => {
      packetIdRef.current += 1;
      const isAttack = Math.random() < 0.32; // illustrative ratio
      
      const newPacket: ActivePacket = {
        id: packetIdRef.current,
        isAttack,
        stageIndex: 0,
        xOffset: 0
      };

      setActivePackets(prev => [...prev, newPacket]);
    }, 1200);

    return () => clearInterval(spawnInterval);
  }, []);

  useEffect(() => {
    // Timer to step packets along the pipeline
    const stepInterval = setInterval(() => {
      setActivePackets(prevPackets => {
        const updatedPackets: ActivePacket[] = [];
        
        prevPackets.forEach(p => {
          let nextStage = p.stageIndex + 1;
          
          // Heuristic logic: Benign packets have an 80% chance to be filtered out at Stage 2 (Random Forest)
          // to demonstrate the edge bypass.
          if (p.stageIndex === 2 && !p.isAttack && Math.random() < 0.8) {
            // Bypass cloud GRU->LSTM, jump directly to final Verdict stage
            nextStage = 4;
          }

          if (nextStage >= STAGES.length) {
            // Packet has finished processing
            setTotalCount(prev => prev + 1);
            if (p.isAttack) {
              setAttackCount(prev => prev + 1);
            } else {
              setBenignCount(prev => prev + 1);
            }
          } else {
            // Keep packet and update stage index
            updatedPackets.push({
              ...p,
              stageIndex: nextStage,
              xOffset: (nextStage / (STAGES.length - 1)) * 100
            });
          }
        });

        // Set active stage highlights based on current packets locations
        if (updatedPackets.length > 0) {
          setActiveStageIndex(updatedPackets[updatedPackets.length - 1].stageIndex);
        } else {
          setActiveStageIndex(null);
        }

        return updatedPackets;
      });
    }, 450);

    return () => clearInterval(stepInterval);
  }, []);

  return (
    <header className="max-w-[1080px] mx-auto px-7 pt-16 pb-10">
      {/* Eyebrow */}
      <div className="font-mono text-[11.5px] text-signal tracking-[2px] uppercase mb-4.5 flex items-center gap-2.5 before:content-[''] before:w-5.5 before:h-[1px] before:bg-signal">
        Network Intrusion Detection · CICIDS-2017
      </div>

      {/* Title */}
      <h1 className="font-display font-bold text-3xl md:text-5xl lg:text-[54px] leading-[1.08] tracking-tight max-w-[780px] text-text">
        Catching attacks the moment <span className="text-signal">the pattern</span> forms, not after the breach.
      </h1>

      {/* Lede & Credits */}
      <p className="mt-5 max-w-[600px] text-text-soft text-base leading-relaxed">
        A two-stage hybrid intrusion detection system: a Random Forest classifier filters traffic at the edge in real time, while a cascaded GRU → LSTM pipeline studies what's left for slow, sequential, easy-to-miss attacks in the cloud.
      </p>

      <div className="mt-5.5 font-mono text-[12.5px] text-text-dim">
        Vasava Khushi — <span className="text-text-soft font-medium">Nirma University</span>
      </div>

      {/* Actions */}
      <div className="mt-7 flex flex-wrap gap-3">
        <a 
          href="#playground" 
          className="font-mono text-[12.5px] py-2.5 px-4.5 rounded-[7px] bg-signal text-[#04101f] font-semibold hover:bg-signal/80 transition-all duration-200"
        >
          Test the dashboard ↓
        </a>
        <a 
          href="conference-paper.pdf" 
          target="_blank"
          className="font-mono text-[12.5px] py-2.5 px-4.5 rounded-[7px] border border-border text-text-soft hover:border-signal hover:text-text bg-transparent transition-all duration-200"
        >
          Read the paper ↗
        </a>
      </div>

      {/* Interactive Simulation Dashboard */}
      <div className="mt-14 bg-panel border border-border rounded-lg p-6.5 relative overflow-hidden">
        {/* Label */}
        <div className="flex justify-between items-center flex-wrap gap-2.5 mb-5.5">
          <div className="font-mono text-[11px] text-text-dim tracking-wider uppercase">
            Pipeline simulation — illustrative traffic flow
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-safe">
            <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse-glow" aria-hidden="true" />
            SIMULATION ACTIVE
          </div>
        </div>

        {/* Pipeline Track Visual */}
        <div className="relative h-28 my-2.5">
          {/* Horizontal connection line */}
          <div 
            className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" 
            aria-hidden="true"
          />

          {/* Render Active Packets moving along the pipeline */}
          <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
            {activePackets.map(p => (
              <div 
                key={p.id}
                className={`absolute top-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-[420ms] linear ${
                  p.isAttack 
                    ? 'bg-alert text-alert shadow-[0_0_8px_currentColor]' 
                    : 'bg-safe text-safe shadow-[0_0_8px_currentColor]'
                }`}
                style={{ 
                  left: `${p.xOffset}%`,
                }}
              />
            ))}
          </div>

          {/* Stage Nodes */}
          <div className="relative flex justify-between items-center h-full">
            {STAGES.map((stage, idx) => {
              const isActive = activeStageIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`bg-panel-2 border rounded-lg w-[130px] h-[72px] flex flex-col items-center justify-center text-center p-2.5 z-20 transition-all duration-200 ${
                    isActive 
                      ? 'border-signal shadow-[0_0_18px_rgba(94,177,255,0.25)]' 
                      : 'border-border'
                  }`}
                >
                  <span className={`font-mono text-[10.5px] font-semibold leading-tight ${isActive ? 'text-signal' : 'text-text'}`}>
                    {stage.name}
                  </span>
                  <span className="text-[9.5px] text-text-soft mt-1 leading-normal">
                    {stage.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="flex gap-8 mt-4.5 flex-wrap font-mono">
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-text">{totalCount}</span>
            <span className="text-[10.5px] text-text-dim tracking-wider uppercase mt-1">
              packets processed
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-safe">{benignCount}</span>
            <span className="text-[10.5px] text-text-dim tracking-wider uppercase mt-1">
              classed benign
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-alert">{attackCount}</span>
            <span className="text-[10.5px] text-text-dim tracking-wider uppercase mt-1">
              flagged as attack
            </span>
          </div>
        </div>

        {/* Simulation Disclaimer Disclaimer */}
        <div className="mt-4 pt-4 border-t border-border-soft text-[11px] text-text-dim leading-relaxed">
          *Note: This visualization simulates the pipeline routing model described in the research paper. Benign traffic is filtered early at the local edge, bypassing deep sequential cloud execution to save bandwidth and compute.
        </div>
      </div>
    </header>
  );
}
