export interface PacketFeatures {
  destPort: number;
  flowDuration: number; // in microseconds
  fwdPackets: number;
  bwdPackets: number;
  flowBytesPs: number;
  flowPacketsPs: number;
  flowIatMean: number; // in microseconds
  avgPacketSize: number; // in bytes
  activeMean: number; // in microseconds
  idleMean: number; // in microseconds
}

export interface DetectionResult {
  verdict: 'Benign' | 'Alert: DDoS Detected' | 'Alert: DoS Detected' | 'Alert: Port Scan Detected' | 'Alert: Brute Force Detected' | 'Alert: Web Attack Detected' | 'Alert: Botnet Detected';
  confidence: number;
  path: 'Edge RF (Bypass Cloud)' | 'Cloud (RF → GRU → LSTM)';
  latencyMs: number;
  bandwidthSavedPercent: number;
  steps: {
    stage: string;
    description: string;
    status: 'success' | 'warning' | 'alert';
  }[];
}

/**
 * Runs a simulated binary classification pipeline (One-vs-Normal) corresponding to the
 * chosen target attack detector from the conference paper.
 * 
 * Stages:
 * 1. Pre-processing & Scale
 * 2. PCA Subspace Projection
 * 3. Edge Filter (Random Forest)
 * 4. Cloud Sequencer (GRU)
 * 5. Cloud Refiner (LSTM)
 */
export function analyzePacket(features: PacketFeatures, targetAttack: string): DetectionResult {
  const steps: DetectionResult['steps'] = [];
  let verdict: DetectionResult['verdict'] = 'Benign';
  let confidence = 0.99;
  let path: DetectionResult['path'] = 'Edge RF (Bypass Cloud)';
  let latencyMs = 0.35; // Edge processing time
  let bandwidthSavedPercent = 100;

  const {
    destPort,
    flowDuration,
    fwdPackets,
    bwdPackets,
    flowBytesPs,
    flowPacketsPs,
    flowIatMean,
    avgPacketSize,
    idleMean
  } = features;

  // -- STAGE 1 & 2: Pre-processing & PCA --
  steps.push({
    stage: 'Preprocessing & Scale',
    description: `StandardScaler normalized packet features. Projected inputs onto PCA space (95% variance).`,
    status: 'success'
  });

  const totalPackets = fwdPackets + bwdPackets;
  const isTypicalBenignPort = [80, 443, 53, 123].includes(destPort);
  const isExtremelyLowTraffic = totalPackets <= 2 && flowDuration < 50000;
  const isNormalFlow = flowPacketsPs < 100 && flowBytesPs < 50000 && avgPacketSize > 40 && avgPacketSize < 1200;

  // Let's determine matching heuristics for each specific binary detector model
  let modelMaliciousScore = 0.0;
  let isTargetMatch = false;

  switch (targetAttack) {
    case 'ddos':
      // DDoS vs Normal Binary Classifier Heuristics
      if ((destPort === 80 || destPort === 443 || destPort === 8234) && (flowPacketsPs > 4000 || flowBytesPs > 2000000)) {
        modelMaliciousScore = 0.98;
        isTargetMatch = true;
      } else if (flowPacketsPs > 1000) {
        modelMaliciousScore = 0.45; // suspicious but not high confidence at edge
      }
      break;

    case 'dos':
      // DoS vs Normal Binary Classifier Heuristics
      if ((destPort === 80 || destPort === 443) && (flowDuration > 10000000 && flowPacketsPs < 15 && totalPackets > 20)) {
        modelMaliciousScore = 0.92;
        isTargetMatch = true;
      } else if (flowPacketsPs > 500 && totalPackets > 150) {
        modelMaliciousScore = 0.88;
        isTargetMatch = true;
      }
      break;

    case 'portscan':
      // Port Scan vs Normal Binary Classifier Heuristics
      if (destPort !== 80 && destPort !== 443 && destPort !== 53 && flowPacketsPs > 5000 && totalPackets <= 5) {
        modelMaliciousScore = 0.91;
        isTargetMatch = true;
      }
      break;

    case 'bruteforce':
      // Brute Force vs Normal Binary Classifier Heuristics
      if ((destPort === 21 || destPort === 22) && totalPackets > 12 && flowIatMean > 80000) {
        modelMaliciousScore = 0.89;
        isTargetMatch = true;
      }
      break;

    case 'webattack':
      // Web Attacks vs Normal Binary Classifier Heuristics
      if ((destPort === 80 || destPort === 443) && avgPacketSize > 1000 && flowPacketsPs > 150) {
        modelMaliciousScore = 0.82;
        isTargetMatch = true;
      }
      break;

    case 'botnet':
      // Botnet vs Normal Binary Classifier Heuristics
      if (destPort > 1024 && idleMean > 4000000 && avgPacketSize < 90 && totalPackets > 8) {
        modelMaliciousScore = 0.86;
        isTargetMatch = true;
      }
      break;

    default:
      break;
  }

  // -- STAGE 3: Edge Filter (Random Forest) --
  // If the model malicious score is low and traffic features are typical benign, clear at the edge.
  if (modelMaliciousScore < 0.20 && (isTypicalBenignPort || isExtremelyLowTraffic) && isNormalFlow) {
    verdict = 'Benign';
    confidence = 0.992;
    path = 'Edge RF (Bypass Cloud)';
    latencyMs = 0.45;
    bandwidthSavedPercent = 100;

    steps.push({
      stage: 'Edge Random Forest',
      description: `Cleared at edge. Flow is highly characteristic of BENIGN traffic. Cloud stages bypassed.`,
      status: 'success'
    });
  } else {
    // Escalate to Cloud deep learning stages
    path = 'Cloud (RF → GRU → LSTM)';
    latencyMs = 41.5 + (totalPackets * 0.04); // Simulated round-trip + inference latency
    bandwidthSavedPercent = 0;

    steps.push({
      stage: 'Edge Random Forest',
      description: `Suspicious/Indeterminate flow signatures detected. Uploading sequence cache to cloud pipeline.`,
      status: modelMaliciousScore > 0.6 ? 'alert' : 'warning'
    });

    // -- STAGE 4: Cloud Sequencer (GRU) --
    steps.push({
      stage: 'Cloud GRU Layer',
      description: 'Reconstructed packet intervals. Processed short-range temporal sequence patterns.',
      status: 'success'
    });

    // -- STAGE 5: Cloud Refiner (LSTM) --
    if (isTargetMatch) {
      // Flagged as the target attack!
      confidence = getModelF1Score(targetAttack);
      
      switch (targetAttack) {
        case 'ddos':
          verdict = 'Alert: DDoS Detected';
          steps.push({
            stage: 'Cloud LSTM Layer',
            description: `DDoS attack flagged. High-density sequence match (Packets/s: ${flowPacketsPs.toFixed(1)}).`,
            status: 'alert'
          });
          break;
        case 'dos':
          verdict = 'Alert: DoS Detected';
          steps.push({
            stage: 'Cloud LSTM Layer',
            description: `DoS attack flagged. Identified slow-rate channel exhaustion parameters.`,
            status: 'alert'
          });
          break;
        case 'portscan':
          verdict = 'Alert: Port Scan Detected';
          steps.push({
            stage: 'Cloud LSTM Layer',
            description: `Port Scan flagged. Sweep pattern detected to port ${destPort}.`,
            status: 'alert'
          });
          break;
        case 'bruteforce':
          verdict = 'Alert: Brute Force Detected';
          steps.push({
            stage: 'Cloud LSTM Layer',
            description: `Brute Force flagged. Detected periodic spaced login retry intervals on port ${destPort}.`,
            status: 'alert'
          });
          break;
        case 'webattack':
          verdict = 'Alert: Web Attack Detected';
          steps.push({
            stage: 'Cloud LSTM Layer',
            description: `Web Attack flagged. Anomalous application payloads detected (Avg size: ${avgPacketSize.toFixed(0)}B).`,
            status: 'alert'
          });
          break;
        case 'botnet':
          verdict = 'Alert: Botnet Detected';
          steps.push({
            stage: 'Cloud LSTM Layer',
            description: `Botnet C&C traffic flagged. Heartbeat pattern match (Idle Interval: ${(idleMean / 1000000).toFixed(1)}s).`,
            status: 'alert'
          });
          break;
        default:
          break;
      }
    } else {
      // Cleared by the binary classifier as Benign
      verdict = 'Benign';
      confidence = 0.954;
      steps.push({
        stage: 'Cloud LSTM Layer',
        description: `Cleared as BENIGN. Sequence signatures do not match the ${targetAttack.toUpperCase()} model profile.`,
        status: 'success'
      });
    }
  }

  return {
    verdict,
    confidence,
    path,
    latencyMs,
    bandwidthSavedPercent,
    steps
  };
}

// Help helper to retrieve corresponding F1-Score from paper data
function getModelF1Score(attack: string): number {
  switch (attack) {
    case 'ddos': return 0.9855;
    case 'dos': return 0.9612;
    case 'portscan': return 0.8692;
    case 'bruteforce': return 0.8499;
    case 'webattack': return 0.7575;
    case 'botnet': return 0.7072;
    default: return 0.95;
  }
}

/**
 * Pre-configured packet profiles for the user to select in the playground.
 */
export const PACKET_PRESETS = [
  {
    name: 'Normal Web Browsing (Benign)',
    description: 'Standard secure HTTPS handshake and asset retrieval.',
    features: {
      destPort: 443,
      flowDuration: 184530,
      fwdPackets: 12,
      bwdPackets: 15,
      flowBytesPs: 14500,
      flowPacketsPs: 146.3,
      flowIatMean: 6834.4,
      avgPacketSize: 620,
      activeMean: 4500,
      idleMean: 0
    }
  },
  {
    name: 'SYN Flood (DDoS Attack)',
    description: 'Flooding the server with connection requests from spoofed IPs.',
    features: {
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
    }
  },
  {
    name: 'Slowloris (DoS Attack)',
    description: 'Holding connection channels open by transmitting headers extremely slowly.',
    features: {
      destPort: 80,
      flowDuration: 120534200, // 120 seconds
      fwdPackets: 45,
      bwdPackets: 32,
      flowBytesPs: 3.4,
      flowPacketsPs: 0.64,
      flowIatMean: 1565380,
      avgPacketSize: 84,
      activeMean: 12400,
      idleMean: 118000000
    }
  },
  {
    name: 'SYN Port Sweep (Port Scan)',
    description: 'Probing thousands of destination ports rapidly to find active services.',
    features: {
      destPort: 8234,
      flowDuration: 85,
      fwdPackets: 2,
      bwdPackets: 0,
      flowBytesPs: 1280000,
      flowPacketsPs: 23529,
      flowIatMean: 42,
      avgPacketSize: 54,
      activeMean: 0,
      idleMean: 0
    }
  },
  {
    name: 'SSH Brute Force',
    description: 'Spaced out login attempts trying common root passwords on port 22.',
    features: {
      destPort: 22,
      flowDuration: 15438200,
      fwdPackets: 24,
      bwdPackets: 22,
      flowBytesPs: 324.5,
      flowPacketsPs: 2.97,
      flowIatMean: 335600,
      avgPacketSize: 74,
      activeMean: 12040,
      idleMean: 12400000
    }
  },
  {
    name: 'SQL Injection Attempt (Web Attack)',
    description: 'Anomalous URL queries containing SQL escape characters and keywords.',
    features: {
      destPort: 80,
      flowDuration: 45200,
      fwdPackets: 6,
      bwdPackets: 5,
      flowBytesPs: 84000,
      flowPacketsPs: 243.3,
      flowIatMean: 4100,
      avgPacketSize: 1140, // anomalous large packet size on forward flow
      activeMean: 0,
      idleMean: 0
    }
  },
  {
    name: 'IRC Botnet C&C Heartbeat',
    description: 'Regular, small periodic polling events to a remote IRC command server.',
    features: {
      destPort: 6667,
      flowDuration: 60234000,
      fwdPackets: 18,
      bwdPackets: 15,
      flowBytesPs: 2.6,
      flowPacketsPs: 0.54,
      flowIatMean: 1825000,
      avgPacketSize: 68,
      activeMean: 8400,
      idleMean: 54000000 // 54 seconds idle heartbeat interval
    }
  }
];
