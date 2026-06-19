import { useState, useEffect } from 'react';
import { 
  analyzePacket, 
  PACKET_PRESETS, 
  PacketFeatures, 
  DetectionResult 
} from '../utils/detector';

interface AttackModel {
  key: string;
  label: string;
}

const ATTACK_MODELS: AttackModel[] = [
  { key: 'ddos', label: 'DDoS' },
  { key: 'dos', label: 'DoS' },
  { key: 'portscan', label: 'Port Scanning' },
  { key: 'bruteforce', label: 'Brute Force' },
  { key: 'webattack', label: 'Web Attacks' },
  { key: 'botnet', label: 'Botnet' }
];

export default function InteractivePlayground() {
  // Target Binary Classifier Model
  const [targetAttack, setTargetAttack] = useState<string>('ddos');

  // Input Type ('single' for custom packet values/presets, 'csv' for uploaded bulk logs)
  const [dataType, setDataType] = useState<'single' | 'csv'>('single');

  // Single Packet Features
  const [features, setFeatures] = useState<PacketFeatures>({
    destPort: 80,
    flowDuration: 2450,
    fwdPackets: 820,
    bwdPackets: 0,
    flowBytesPs: 5420000,
    flowPacketsPs: 334690,
    flowIatMean: 2.9,
    avgPacketSize: 54,
    activeMean: 0,
    idleMean: 0
  });

  // Stored Parsed CSV Rows (to allow multi-testing on the same dataset)
  const [rawCsvRows, setRawCsvRows] = useState<PacketFeatures[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  // Results
  const [singleResult, setSingleResult] = useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [animStage, setAnimStage] = useState<number | null>(null);
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null);
  
  const [bulkResults, setBulkResults] = useState<{
    total: number;
    benign: number;
    malicious: number;
    bypassRate: number;
    avgLatency: number;
    rows: { index: number; port: number; verdict: string; path: string; confidence: number }[];
  } | null>(null);
  const [csvPage, setCsvPage] = useState(0);

  // Auto-populate preset packet inputs
  const applyPreset = (preset: typeof PACKET_PRESETS[0]) => {
    setFeatures({ ...preset.features });
    setDataType('single');
    setSingleResult(null);
    setBulkResults(null);
  };

  // Switch between models resets the outputs but preserves the raw inputs/CSV in state
  useEffect(() => {
    setSingleResult(null);
    setBulkResults(null);
    setCsvPage(0);
  }, [targetAttack]);

  // Run the detection pipeline simulation
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setSingleResult(null);
    setBulkResults(null);
    setCsvPage(0);
    
    const stages = [0, 1, 2, 3, 4, 5];
    stages.forEach((stage, idx) => {
      setTimeout(() => {
        setAnimStage(stage);
        
        if (idx === stages.length - 1) {
          if (dataType === 'single') {
            const res = analyzePacket(features, targetAttack);
            setSingleResult(res);
          } else if (dataType === 'csv' && rawCsvRows) {
            const rowsData = rawCsvRows.map((row, rowIdx) => {
              const res = analyzePacket(row, targetAttack);
              return {
                index: rowIdx + 1,
                port: row.destPort,
                verdict: res.verdict,
                path: res.path,
                confidence: res.confidence,
                latency: res.latencyMs
              };
            });

            const total = rowsData.length;
            const benign = rowsData.filter(r => r.verdict === 'Benign').length;
            const malicious = total - benign;
            const edgeBypass = rowsData.filter(r => r.path.includes('Edge')).length;
            const bypassRate = (edgeBypass / total) * 100;
            const avgLatency = rowsData.reduce((acc, r) => acc + r.latency, 0) / total;

            setBulkResults({
              total,
              benign,
              malicious,
              bypassRate,
              avgLatency,
              rows: rowsData
            });
          }
          setIsAnalyzing(false);
          setAnimStage(null);
        }
      }, idx * 350);
    });
  };

  // Parse uploaded CSV and store raw features in state
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvUploadError(null);
    setBulkResults(null);
    setSingleResult(null);
    setRawCsvRows(null);
    setFileName('');
    setCsvPage(0);
    
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce 10 MB sandbox upload limit to prevent browser string OOM crashes
    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setCsvUploadError(`File exceeds the ${MAX_SIZE_MB} MB sandbox limit (Size: ${(file.size / 1024 / 1024).toFixed(1)} MB). Please crop your file to a smaller sample.`);
      return;
    }

    setFileName(file.name);
    setDataType('csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Split lines by any common line break format (\r\n, \n, or \r)
        const lines = text.split(/\r?\n|\r/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) {
          throw new Error('CSV file is empty.');
        }

        // Detect delimiter: check commas, semicolons, and tabs in the first line
        const firstLine = lines[0];
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semiCount = (firstLine.match(/;/g) || []).length;
        const tabCount = (firstLine.match(/\t/g) || []).length;
        
        let delimiter = ',';
        if (semiCount > commaCount && semiCount > tabCount) delimiter = ';';
        else if (tabCount > commaCount && tabCount > semiCount) delimiter = '\t';

        const firstRowTokens = firstLine.split(delimiter).map(t => t.trim().replace(/^["']|["']$/g, ''));
        
        // Detect if first line is a header by checking if any cell is numeric.
        // If the first row contains numbers, it's headless (no column names).
        const isHeader = !firstRowTokens.some(token => {
          const val = parseFloat(token);
          return !isNaN(val) && isFinite(val);
        });

        let header: string[] = [];
        let dataLines = lines;
        
        if (isHeader) {
          header = firstRowTokens.map(h => h.toLowerCase());
          dataLines = lines.slice(1);
        }

        if (dataLines.length === 0) {
          throw new Error('CSV must contain at least one data row.');
        }

        // Map column indices. If header exists, look up by name.
        // Otherwise (or if not found), fall back to default position index.
        const getColIndex = (names: string[], defaultIdx: number) => {
          if (!isHeader) return defaultIdx;
          const idx = header.findIndex(h => names.some(name => h.includes(name)));
          return idx !== -1 ? idx : defaultIdx;
        };

        const colMap = {
          destPort: getColIndex(['port', 'destination'], 0),
          flowDuration: getColIndex(['duration', 'dur'], 1),
          fwdPackets: getColIndex(['fwd', 'forward', 'total packets'], 2),
          bwdPackets: getColIndex(['bwd', 'backward'], 3),
          flowBytesPs: getColIndex(['bytes', 'bps', 'bytes/s'], 4),
          flowPacketsPs: getColIndex(['packets', 'pps', 'packets/s'], 5),
          flowIatMean: getColIndex(['iat', 'interval', 'mean'], 6),
          avgPacketSize: getColIndex(['size', 'length', 'avg'], 7)
        };

        const parsedRows = dataLines.map(line => {
          const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
          
          const parseVal = (colIdx: number, defVal: number) => {
            if (colIdx === -1 || !values[colIdx]) return defVal;
            const parsed = parseFloat(values[colIdx]);
            return isNaN(parsed) ? defVal : parsed;
          };

          return {
            destPort: parseVal(colMap.destPort, 80),
            flowDuration: parseVal(colMap.flowDuration, 100000),
            fwdPackets: parseVal(colMap.fwdPackets, 5),
            bwdPackets: parseVal(colMap.bwdPackets, 5),
            flowBytesPs: parseVal(colMap.flowBytesPs, 5000),
            flowPacketsPs: parseVal(colMap.flowPacketsPs, 50),
            flowIatMean: parseVal(colMap.flowIatMean, 5000),
            avgPacketSize: parseVal(colMap.avgPacketSize, 120),
            activeMean: 0,
            idleMean: 0
          };
        });

        setRawCsvRows(parsedRows);

      } catch (err: any) {
        setCsvUploadError(err.message || 'Error parsing CSV file. Please verify schema.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <section id="playground" className="max-w-[1080px] mx-auto px-7 py-16 scroll-mt-[62px]">
      <div className="mb-9">
        <div className="font-mono text-[11px] text-text-dim tracking-widest uppercase mb-2">
          Interactive Testing
        </div>
        <h2 className="font-display font-semibold text-2xl md:text-3xl text-text leading-tight">
          Intrusion Detection Sandbox
        </h2>
        <p className="text-text-soft text-[14.5px] mt-2.5 max-w-[600px] leading-relaxed">
          Test the paper's hybrid stages. Select an attack model, upload or select your network dataset, and verify if it is flagged. You can check the same uploaded data against different attacks by switching the detector model.
        </p>
      </div>

      {/* STEP 1: Select Attack Detector Model */}
      <div className="mb-8 p-5 bg-panel-2/30 border border-border-soft rounded-lg">
        <div className="font-mono text-xs text-text font-semibold uppercase tracking-wider mb-3">
          1. Select Attack Detector Model (Binary classification vs Normal)
        </div>
        <div className="flex flex-wrap gap-2">
          {ATTACK_MODELS.map((model) => (
            <button
              key={model.key}
              onClick={() => setTargetAttack(model.key)}
              className={`font-mono text-xs px-4 py-2.5 rounded-md border transition-all duration-150 cursor-pointer ${
                targetAttack === model.key
                  ? 'border-signal text-signal bg-signal/10 font-medium'
                  : 'border-border text-text-soft hover:border-text-dim hover:text-text bg-panel'
              }`}
            >
              Detect {model.label} Model
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* Left Column: Data Input Section (Presets or CSV logs) */}
        <div className="lg:col-span-6 bg-panel border border-border rounded-lg p-5.5 flex flex-col justify-between">
          <div>
            <div className="font-mono text-[11.5px] text-text font-semibold uppercase tracking-wider mb-4 pb-2 border-b border-border-soft flex justify-between items-center">
              <span>2. Select or Upload Dataset</span>
              {dataType === 'csv' && (
                <span className="text-[10px] text-safe font-mono">CSV ACTIVE: {fileName}</span>
              )}
            </div>

            {/* Quick Presets Selection */}
            <div className="mb-5.5">
              <div className="font-mono text-[10px] text-text-dim tracking-wider uppercase mb-2">
                Apply Packet Preset Profile:
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {PACKET_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="font-mono text-[10.5px] px-2.5 py-1.5 rounded border border-border-soft text-text-soft hover:border-signal hover:text-text bg-panel-2/40 cursor-pointer"
                    title={preset.description}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Toggle / CSV Upload */}
            <div className="pt-4.5 border-t border-border-soft">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setDataType('single')}
                  className={`font-mono text-[11px] px-2.5 py-1.5 rounded transition-all duration-150 cursor-pointer ${
                    dataType === 'single'
                      ? 'bg-border-soft text-text'
                      : 'text-text-dim hover:text-text-soft bg-transparent'
                  }`}
                >
                  Manual Parameters
                </button>
                <button
                  onClick={() => setDataType('csv')}
                  disabled={!rawCsvRows}
                  className={`font-mono text-[11px] px-2.5 py-1.5 rounded transition-all duration-150 cursor-pointer ${
                    dataType === 'csv'
                      ? 'bg-border-soft text-text'
                      : rawCsvRows
                      ? 'text-text-dim hover:text-text-soft bg-transparent'
                      : 'text-text-dim/40 cursor-not-allowed bg-transparent'
                  }`}
                  title={rawCsvRows ? 'Switch to uploaded CSV data' : 'Please upload a CSV file below to activate'}
                >
                  Use Uploaded CSV
                </button>
              </div>

              {dataType === 'single' ? (
                /* Manual Inputs Grid */
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-mono text-[10px] text-text-dim uppercase mb-0.5">Dest Port</label>
                    <input
                      type="number"
                      value={features.destPort}
                      onChange={(e) => setFeatures({ ...features, destPort: parseInt(e.target.value) || 0 })}
                      className="w-full bg-panel-2 border border-border-soft rounded p-1.5 text-[12.5px] font-mono text-text focus:border-signal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-text-dim uppercase mb-0.5">Duration (μs)</label>
                    <input
                      type="number"
                      value={features.flowDuration}
                      onChange={(e) => setFeatures({ ...features, flowDuration: parseInt(e.target.value) || 0 })}
                      className="w-full bg-panel-2 border border-border-soft rounded p-1.5 text-[12.5px] font-mono text-text focus:border-signal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-text-dim uppercase mb-0.5">Fwd Packets</label>
                    <input
                      type="number"
                      value={features.fwdPackets}
                      onChange={(e) => setFeatures({ ...features, fwdPackets: parseInt(e.target.value) || 0 })}
                      className="w-full bg-panel-2 border border-border-soft rounded p-1.5 text-[12.5px] font-mono text-text focus:border-signal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-text-dim uppercase mb-0.5">Bwd Packets</label>
                    <input
                      type="number"
                      value={features.bwdPackets}
                      onChange={(e) => setFeatures({ ...features, bwdPackets: parseInt(e.target.value) || 0 })}
                      className="w-full bg-panel-2 border border-border-soft rounded p-1.5 text-[12.5px] font-mono text-text focus:border-signal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-text-dim uppercase mb-0.5">Bytes/s</label>
                    <input
                      type="number"
                      value={features.flowBytesPs}
                      onChange={(e) => setFeatures({ ...features, flowBytesPs: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-panel-2 border border-border-soft rounded p-1.5 text-[12.5px] font-mono text-text focus:border-signal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-text-dim uppercase mb-0.5">Packets/s</label>
                    <input
                      type="number"
                      value={features.flowPacketsPs}
                      onChange={(e) => setFeatures({ ...features, flowPacketsPs: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-panel-2 border border-border-soft rounded p-1.5 text-[12.5px] font-mono text-text focus:border-signal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-text-dim uppercase mb-0.5">IAT Mean (μs)</label>
                    <input
                      type="number"
                      value={features.flowIatMean}
                      onChange={(e) => setFeatures({ ...features, flowIatMean: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-panel-2 border border-border-soft rounded p-1.5 text-[12.5px] font-mono text-text focus:border-signal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-text-dim uppercase mb-0.5">Avg Pkt Size (B)</label>
                    <input
                      type="number"
                      value={features.avgPacketSize}
                      onChange={(e) => setFeatures({ ...features, avgPacketSize: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-panel-2 border border-border-soft rounded p-1.5 text-[12.5px] font-mono text-text focus:border-signal focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* CSV Stats Display */
                <div className="bg-panel-2/50 border border-border-soft rounded-lg p-4 font-mono text-xs space-y-2">
                  <div className="flex justify-between"><span className="text-text-dim">Filename:</span> <span className="text-text">{fileName}</span></div>
                  <div className="flex justify-between"><span className="text-text-dim">Rows Parsed:</span> <span className="text-text">{rawCsvRows?.length} rows</span></div>
                  <div className="flex justify-between"><span className="text-text-dim">Status:</span> <span className="text-safe">Loaded in memory</span></div>
                  <p className="text-[10px] text-text-dim pt-2 border-t border-border-soft/60">
                    *Select a different attack detector model at the top, then click Check to run the model on this CSV dataset.
                  </p>
                </div>
              )}

              {/* Upload Input */}
              <div className="mt-5 pt-4 border-t border-border-soft">
                <label className="block font-mono text-[10px] text-text-dim uppercase mb-2">
                  Upload Custom Log Dataset (.csv):
                </label>
                
                {/* File Size Sandbox Limit Warning */}
                <div className="mb-3 p-3 bg-amber/5 border border-amber/20 rounded-md text-[11px] text-text-soft font-mono leading-normal flex items-start gap-2">
                  <span className="text-amber font-bold text-xs" aria-hidden="true">⚠</span>
                  <div>
                    <span className="text-text font-semibold">Sandbox Upload Limit:</span> Max file size is <span className="text-amber font-semibold">10 MB</span> (approx. 80,000 rows). Committing larger files directly in the browser will exceed local V8 heap allocation thresholds.
                  </div>
                </div>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="w-full text-xs text-text-soft file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10.5px] file:font-mono file:bg-border-soft file:text-text-soft hover:file:bg-border file:cursor-pointer"
                />
                {csvUploadError && (
                  <div className="text-alert font-mono text-[10.5px] mt-2">
                    Upload Error: {csvUploadError}
                  </div>
                )}
              </div>

            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (dataType === 'csv' && !rawCsvRows)}
            className="w-full font-mono text-[12.5px] py-2.5 px-4 rounded-[7px] bg-signal text-[#04101f] font-semibold mt-7 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAnalyzing 
              ? 'Executing Pipeline Cascade...' 
              : `Check for ${ATTACK_MODELS.find(m => m.key === targetAttack)?.label} →`}
          </button>
        </div>

        {/* Right Column: Dynamic Pipeline Telemetry Logs */}
        <div className="lg:col-span-6 bg-panel border border-border rounded-lg p-5.5 flex flex-col justify-between">
          <div>
            <div className="font-mono text-[11.5px] text-text font-semibold uppercase tracking-wider mb-4 pb-2 border-b border-border-soft">
              3. Telemetry & Cascade Trail
            </div>

            {/* Pipeline Stage Indicators (Animate execution progress) */}
            {isAnalyzing && (
              <div className="py-10 flex flex-col justify-center items-center font-mono">
                <div className="relative w-11 h-11 mb-5">
                  <span className="absolute inset-0 rounded-full border-2 border-signal/20 border-t-signal animate-spin" />
                </div>
                <div className="text-xs text-text-soft space-y-1.5 text-center">
                  <p className={animStage === 1 ? 'text-signal font-semibold' : 'text-text-dim'}>
                    [Stage 1] Pre-processing (Scale)...
                  </p>
                  <p className={animStage === 2 ? 'text-signal font-semibold' : 'text-text-dim'}>
                    [Stage 2] Subspace Conversion (PCA)...
                  </p>
                  <p className={animStage === 3 ? 'text-signal font-semibold' : 'text-text-dim'}>
                    [Stage 3] Edge Filtering (Random Forest)...
                  </p>
                  <p className={animStage === 4 ? 'text-signal font-semibold' : 'text-text-dim'}>
                    [Stage 4] Cloud Sequencer (GRU)...
                  </p>
                  <p className={animStage === 5 ? 'text-signal font-semibold' : 'text-text-dim'}>
                    [Stage 5] Cloud Refiner (LSTM)...
                  </p>
                </div>
              </div>
            )}

            {/* Bulk CSV Execution Preview */}
            {bulkResults && !isAnalyzing && (
              <div className="flex flex-col">
                {/* Aggregate Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-panel-2 rounded-lg p-3 border border-border-soft mb-4.5">
                  <div>
                    <div className="text-[9.5px] text-text-dim font-mono uppercase">Rows Checked</div>
                    <div className="text-base font-mono font-semibold text-text">{bulkResults.total}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] text-text-dim font-mono uppercase">Benign (Clear)</div>
                    <div className="text-base font-mono font-semibold text-safe">{bulkResults.benign}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] text-text-dim font-mono uppercase">Alerts (Flagged)</div>
                    <div className="text-base font-mono font-semibold text-alert">{bulkResults.malicious}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] text-text-dim font-mono uppercase">Edge Bypass</div>
                    <div className="text-base font-mono font-semibold text-signal">{bulkResults.bypassRate.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Audit Logs Table */}
                <div className="overflow-y-auto max-h-[480px]">
                  <table className="w-full text-left font-mono text-[10.5px]">
                    <thead>
                      <tr className="text-text-dim border-b border-border-soft pb-1 flex justify-between">
                        <th className="w-16 pl-1">Row</th>
                        <th className="w-20">Dest Port</th>
                        <th className="w-28">Pipeline Path</th>
                        <th className="w-32 text-right pr-1">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="block max-h-[430px] overflow-y-auto mt-1">
                      {bulkResults.rows
                        .slice(csvPage * 100, (csvPage + 1) * 100)
                        .map((row, i) => (
                        <tr key={i} className="border-b border-border-soft/30 hover:bg-panel-2/30 flex justify-between py-1">
                          <td className="w-16 pl-1 text-text-dim">#{row.index}</td>
                          <td className="w-20 text-text">{row.port}</td>
                          <td className="w-28 text-text-soft truncate" title={row.path}>
                            {row.path.includes('Edge') ? 'Edge Bypass' : 'Cloud Cascade'}
                          </td>
                          <td className={`w-32 text-right pr-1 font-semibold ${
                            row.verdict === 'Benign' ? 'text-safe' : 'text-alert'
                          }`}>
                            {row.verdict === 'Benign' ? 'BENIGN' : 'ALERT!'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bulkResults.total > 100 && (
                    <div className="flex justify-between items-center mt-3.5 pt-2.5 border-t border-border-soft/60 font-mono text-[10px]">
                      <button
                        onClick={() => setCsvPage(prev => Math.max(0, prev - 1))}
                        disabled={csvPage === 0}
                        className="px-2 py-1 rounded bg-border-soft hover:bg-border text-text-soft disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
                      >
                        🡨 Previous
                      </button>
                      <span className="text-text-dim">
                        Showing {csvPage * 100 + 1} - {Math.min(bulkResults.total, (csvPage + 1) * 100)} of {bulkResults.total} rows
                      </span>
                      <button
                        onClick={() => setCsvPage(prev => Math.min(Math.ceil(bulkResults.total / 100) - 1, prev + 1))}
                        disabled={csvPage >= Math.ceil(bulkResults.total / 100) - 1}
                        className="px-2 py-1 rounded bg-border-soft hover:bg-border text-text-soft disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
                      >
                        Next 🡪
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Single Packet Execution Telemetry */}
            {singleResult && !isAnalyzing && (
              <div className="flex flex-col">
                
                {/* Result Announcement */}
                <div className="bg-panel-2 border border-border-soft rounded-lg p-4 flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[9.5px] text-text-dim font-mono uppercase tracking-wider block">
                      Pipeline Classification Verdict
                    </span>
                    <div className={`text-xl font-bold tracking-tight mt-1 font-display ${
                      singleResult.verdict === 'Benign' ? 'text-safe' : 'text-alert'
                    }`}>
                      {singleResult.verdict === 'Benign' ? 'BENIGN (Cleared)' : 'ALERT! INTRUSION DETECTED'}
                    </div>
                    <div className="text-[10px] text-text-soft font-mono mt-0.5">
                      Model: {ATTACK_MODELS.find(m => m.key === targetAttack)?.label} Binary Classifier
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9.5px] text-text-dim font-mono uppercase tracking-wider block">
                      F1-Confidence
                    </span>
                    <div className="text-lg font-semibold text-text font-mono mt-1">
                      {(singleResult.confidence * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Processing Specs */}
                <div className="grid grid-cols-3 gap-3 font-mono text-center mb-4.5">
                  <div className="bg-panel-2 border border-border-soft/60 rounded p-2 text-xs">
                    <span className="text-[9px] text-text-dim block uppercase">Inference Location</span>
                    <span className="font-semibold text-text block mt-0.5 truncate" title={singleResult.path}>
                      {singleResult.path.includes('Edge') ? 'Edge Bypass' : 'Cloud Cascade'}
                    </span>
                  </div>
                  <div className="bg-panel-2 border border-border-soft/60 rounded p-2 text-xs">
                    <span className="text-[9px] text-text-dim block uppercase">Latency</span>
                    <span className="font-semibold text-signal block mt-0.5">
                      {singleResult.latencyMs.toFixed(2)} ms
                    </span>
                  </div>
                  <div className="bg-panel-2 border border-border-soft/60 rounded p-2 text-xs">
                    <span className="text-[9px] text-text-dim block uppercase">Cloud BW Saved</span>
                    <span className="font-semibold text-safe block mt-0.5">
                      {singleResult.bandwidthSavedPercent}%
                  </span>
                  </div>
                </div>

                {/* Audit Steps Logs */}
                <div>
                  <span className="text-[10px] text-text-dim font-mono uppercase tracking-wider block mb-2">
                    Execution Steps Trail
                  </span>
                  <div className="space-y-2 max-h-[170px] overflow-y-auto">
                    {singleResult.steps.map((step, idx) => (
                      <div 
                        key={idx} 
                        className={`font-mono text-[10.5px] p-2.5 rounded border border-border-soft/60 flex items-start gap-2 ${
                          step.status === 'alert'
                            ? 'bg-alert/5 border-alert/20 text-alert'
                            : step.status === 'warning'
                            ? 'bg-amber/5 border-amber/20 text-amber'
                            : 'bg-panel-2/60 text-text-soft'
                        }`}
                      >
                        <span className="font-semibold text-[9px] tracking-wider uppercase opacity-80 min-w-[100px] block">
                          Stage {idx + 1}:
                        </span>
                        <span className="flex-1 text-left leading-normal">
                          {step.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Awaiting Inputs Screen */}
            {!singleResult && !bulkResults && !isAnalyzing && (
              <div className="py-14 flex flex-col justify-center items-center text-center text-text-dim border border-dashed border-border-soft rounded-lg">
                <span className="text-3xl mb-3" aria-hidden="true">🛰️</span>
                <p className="font-mono text-xs max-w-[280px] leading-relaxed">
                  Awaiting targeted pipeline checking. Choose an attack detector, select network data, and click "Check".
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
