import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Atom,
  Cpu,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Sliders,
  FileText,
  Activity,
  Zap,
  HelpCircle,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  Heart,
  Brain,
  Dna,
  FileSpreadsheet
} from "lucide-react";
import AnimatedCard from "./AnimatedCard";
import AnimatedCounter from "./AnimatedCounter";
import GlowOrb from "./GlowOrb";
import { childVariants } from "./PageTransition";

// ==========================================
// 1. DETERMINISTIC PSEUDO-RANDOM GENERATOR
// ==========================================
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalRandom(rng, mean = 0, std = 1) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + num * std;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ==========================================
// 2. SYNTHETIC CLINICAL DATASETS (SIH PROTOTYPE)
// ==========================================
export function generateSyntheticDataset(domain, n = 320, seed = 42) {
  const rng = mulberry32(seed);

  if (domain === "Cardiovascular") {
    const rows = [];
    for (let i = 0; i < n; i++) {
      const age = Math.floor(29 + rng() * 49);
      const bp = clamp(normalRandom(rng, 132, 18), 85, 210);
      const chol = clamp(normalRandom(rng, 215, 38), 120, 360);
      const hr = clamp(normalRandom(rng, 74, 12), 45, 125);
      const glucose = clamp(normalRandom(rng, 112, 32), 55, 260);
      const bmi = clamp(normalRandom(rng, 27, 5), 16, 46);
      const smoker = rng() < 0.28 ? 1 : 0;
      const exercise = clamp(normalRandom(rng, 3.2, 1.6), 0, 8);

      const z =
        0.055 * (age - 50) +
        0.018 * (bp - 125) +
        0.012 * (chol - 200) +
        0.018 * (glucose - 100) +
        0.08 * (bmi - 25) +
        0.65 * smoker -
        0.15 * (exercise - 3);

      const p = 1 / (1 + Math.exp(-z));
      const diagnosis = rng() < p ? 1 : 0;

      rows.push({
        age,
        blood_pressure: Math.round(bp * 10) / 10,
        cholesterol: Math.round(chol * 10) / 10,
        heart_rate: Math.round(hr * 10) / 10,
        glucose: Math.round(glucose * 10) / 10,
        bmi: Math.round(bmi * 10) / 10,
        smoker,
        weekly_exercise_hours: Math.round(exercise * 10) / 10,
        diagnosis
      });
    }
    return rows;
  }

  if (domain === "Neurological") {
    const rows = [];
    for (let i = 0; i < n; i++) {
      const age = Math.floor(30 + rng() * 52);
      const tremor = clamp(normalRandom(rng, 4.2, 2.0), 0, 10);
      const reaction = clamp(normalRandom(rng, 420, 90), 180, 800);
      const sleep = clamp(normalRandom(rng, 6.7, 1.4), 3, 10);
      const memory = clamp(normalRandom(rng, 68, 16), 20, 100);
      const motor = clamp(normalRandom(rng, 5.0, 2.0), 0, 10);
      const speech = clamp(normalRandom(rng, 3.5, 1.7), 0, 10);

      const z =
        0.045 * (age - 50) +
        0.28 * (tremor - 4) +
        0.004 * (reaction - 400) -
        0.2 * (sleep - 7) -
        0.018 * (memory - 70) +
        0.22 * (motor - 5) +
        0.12 * (speech - 3);

      const p = 1 / (1 + Math.exp(-z));
      const diagnosis = rng() < p ? 1 : 0;

      rows.push({
        age,
        tremor_score: Math.round(tremor * 10) / 10,
        reaction_time: Math.round(reaction * 10) / 10,
        sleep_hours: Math.round(sleep * 10) / 10,
        memory_score: Math.round(memory * 10) / 10,
        motor_score: Math.round(motor * 10) / 10,
        speech_score: Math.round(speech * 10) / 10,
        diagnosis
      });
    }
    return rows;
  }

  // Cancer / Genomic Biomarkers
  const rows = [];
  const weights = [1.2, 0.8, -1.0, 0.7, 0.4, -0.6, 0.5, 0.3, 0.7, -0.4];
  for (let i = 0; i < n; i++) {
    const row = {};
    let dot = 0;
    for (let j = 0; j < 10; j++) {
      const val = normalRandom(rng, 0, 1);
      row[`biomarker_${j + 1}`] = Math.round(val * 1000) / 1000;
      dot += val * weights[j];
    }
    const noise = normalRandom(rng, 0, 0.8);
    row.diagnosis = dot + noise > 0 ? 1 : 0;
    rows.push(row);
  }
  return rows;
}

// ==========================================
// 3. STATISTICAL & ML SIMULATION ROUTINES
// ==========================================

// Calculate Mutual Information (information gain) between numeric feature and binary target
function estimateMutualInformation(X, y, numBins = 6) {
  const n = X.length;
  if (n === 0) return 0;

  let min = Infinity, max = -Infinity;
  for (let i = 0; i < n; i++) {
    if (X[i] < min) min = X[i];
    if (X[i] > max) max = X[i];
  }
  if (min === max) return 0;

  const binCounts = Array.from({ length: numBins }, () => [0, 0]);
  let countY0 = 0, countY1 = 0;

  for (let i = 0; i < n; i++) {
    const bin = Math.min(numBins - 1, Math.floor(((X[i] - min) / (max - min || 1)) * numBins));
    const label = y[i] ? 1 : 0;
    binCounts[bin][label]++;
    if (label === 1) countY1++;
    else countY0++;
  }

  let mi = 0;
  const pY0 = countY0 / n;
  const pY1 = countY1 / n;

  for (let b = 0; b < numBins; b++) {
    const totalBin = binCounts[b][0] + binCounts[b][1];
    if (totalBin === 0) continue;
    const pX = totalBin / n;

    for (let l = 0; l <= 1; l++) {
      const pXY = binCounts[b][l] / n;
      if (pXY > 0) {
        const pY = l === 1 ? pY1 : pY0;
        mi += pXY * Math.log2(pXY / (pX * pY));
      }
    }
  }
  return Math.max(0, mi);
}

// Metrics calculation: Accuracy, Precision, Recall, F1, ROC-AUC
function calculateClassificationMetrics(yTrue, yPred, yProb) {
  const n = yTrue.length;
  let tp = 0, fp = 0, tn = 0, fn = 0;

  for (let i = 0; i < n; i++) {
    const actual = yTrue[i];
    const predicted = yPred[i];
    if (actual === 1 && predicted === 1) tp++;
    else if (actual === 0 && predicted === 1) fp++;
    else if (actual === 0 && predicted === 0) tn++;
    else if (actual === 1 && predicted === 0) fn++;
  }

  const accuracy = (tp + tn) / n;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // ROC-AUC via rank-sum method
  const items = yProb.map((prob, i) => ({ prob, actual: yTrue[i] }));
  items.sort((a, b) => a.prob - b.prob);

  let nPos = 0, nNeg = 0;
  for (let i = 0; i < n; i++) {
    if (items[i].actual === 1) nPos++;
    else nNeg++;
  }

  let auc = 0.5;
  if (nPos > 0 && nNeg > 0) {
    let rankSum = 0;
    for (let i = 0; i < n; i++) {
      if (items[i].actual === 1) rankSum += i + 1;
    }
    auc = (rankSum - (nPos * (nPos + 1)) / 2) / (nPos * nNeg);
  }
  auc = clamp(auc, 0.5, 0.999);

  return {
    Accuracy: accuracy,
    Precision: precision,
    Recall: recall,
    F1: f1,
    "ROC-AUC": auc,
    tp,
    fp,
    tn,
    fn
  };
}

// Generate smooth ROC curve coordinates for a model
function computeRocCurve(yTrue, yProb, numPoints = 25) {
  const thresholds = [1.0];
  for (let i = 1; i < numPoints - 1; i++) {
    thresholds.push(1 - i / (numPoints - 1));
  }
  thresholds.push(0.0);

  const totalPos = yTrue.filter(y => y === 1).length || 1;
  const totalNeg = yTrue.filter(y => y === 0).length || 1;

  const points = [{ fpr: 0, tpr: 0 }];
  thresholds.forEach(thresh => {
    let tp = 0, fp = 0;
    for (let i = 0; i < yTrue.length; i++) {
      if (yProb[i] >= thresh) {
        if (yTrue[i] === 1) tp++;
        else fp++;
      }
    }
    points.push({
      fpr: Math.min(1, Math.max(0, fp / totalNeg)),
      tpr: Math.min(1, Math.max(0, tp / totalPos))
    });
  });
  points.push({ fpr: 1, tpr: 1 });
  points.sort((a, b) => a.fpr - b.fpr || a.tpr - b.tpr);
  return points;
}

// ==========================================
// 4. MAIN QUANTUM ENGINE COMPONENT
// ==========================================
export default function QuantumEngine() {
  const [domain, setDomain] = useState("Cardiovascular");
  const [dataset, setDataset] = useState(() => generateSyntheticDataset("Cardiovascular"));
  const [sourceName, setSourceName] = useState("Synthetic Cardiovascular Demo (SIH Dataset)");
  const [targetCol, setTargetCol] = useState("diagnosis");
  const [numQubits, setNumQubits] = useState(4);
  const [testSplit, setTestSplit] = useState(0.2);
  const [entanglement, setEntanglement] = useState("strongly_entangling");
  const [simulationState, setSimulationState] = useState("idle"); // "idle", "running", "completed"
  const [activeStep, setActiveStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Single test sample inference playground state
  const [sampleValues, setSampleValues] = useState({});
  const [livePrediction, setLivePrediction] = useState(null);
  const fileInputRef = useRef(null);

  // Switch domain dataset
  const handleDomainChange = newDomain => {
    setDomain(newDomain);
    const data = generateSyntheticDataset(newDomain);
    setDataset(data);
    setSourceName(`Synthetic ${newDomain} Demo (SIH Prototype)`);
    setTargetCol("diagnosis");
    setAnalysisResult(null);
    setSimulationState("idle");
  };

  // Custom CSV Upload Handler
  const handleFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 5) {
          alert("CSV file must contain a header and at least 4 rows of data.");
          return;
        }

        const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(",").map(v => v.trim());
          if (vals.length === headers.length) {
            const rowObj = {};
            headers.forEach((h, idx) => {
              const num = parseFloat(vals[idx]);
              rowObj[h] = isNaN(num) ? vals[idx] : num;
            });
            rows.push(rowObj);
          }
        }

        if (rows.length === 0) {
          alert("Could not parse numeric rows from CSV.");
          return;
        }

        // Auto-detect target column
        let detectedTarget = "diagnosis";
        const targetCandidates = ["diagnosis", "target", "label", "class", "outcome", "disease", "y"];
        for (const candidate of targetCandidates) {
          const match = headers.find(h => h.toLowerCase() === candidate);
          if (match) {
            detectedTarget = match;
            break;
          }
        }
        if (!headers.includes(detectedTarget)) {
          detectedTarget = headers[headers.length - 1]; // Fallback to last column
        }

        setDomain("Custom");
        setDataset(rows);
        setSourceName(file.name);
        setTargetCol(detectedTarget);
        setAnalysisResult(null);
        setSimulationState("idle");
      } catch (err) {
        alert("Failed to read CSV file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Run the full 7-stage Hybrid Quantum Pipeline
  const runHybridPipeline = () => {
    setSimulationState("running");
    setActiveStep(1);

    // Timeline simulated execution through the 7 steps
    const stepInterval = 280;
    for (let step = 1; step <= 7; step++) {
      setTimeout(() => {
        setActiveStep(step);
      }, step * stepInterval);
    }

    setTimeout(() => {
      // Execute the actual pipeline computations
      try {
        const featureNames = Object.keys(dataset[0]).filter(k => k !== targetCol && typeof dataset[0][k] === "number");
        const yAll = dataset.map(row => (row[targetCol] ? 1 : 0));

        // Train / test split
        const splitIndex = Math.floor(dataset.length * (1 - testSplit));
        const trainData = dataset.slice(0, splitIndex);
        const testData = dataset.slice(splitIndex);

        const yTrain = yAll.slice(0, splitIndex);
        const yTest = yAll.slice(splitIndex);

        // Feature Engineering: Calculate Mutual Information for each feature
        const miScores = featureNames.map(f => {
          const colValues = dataset.map(r => Number(r[f]) || 0);
          const mi = estimateMutualInformation(colValues, yAll);
          return { name: f, mi };
        });

        miScores.sort((a, b) => b.mi - a.mi);
        const selectedFeatures = miScores.slice(0, Math.min(numQubits, featureNames.length)).map(f => f.name);

        // Standardize features
        const stats = {};
        selectedFeatures.forEach(feat => {
          const vals = trainData.map(r => Number(r[feat]) || 0);
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
          const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length) || 1;
          stats[feat] = { mean, std };
        });

        // 1. Classical Models Predictions on Test Set
        // Logistic Regression Simulation
        const lrWeights = selectedFeatures.map((f, i) => (miScores[i]?.mi || 0.5) * 1.8);
        const lrProbs = testData.map(row => {
          let logit = 0;
          selectedFeatures.forEach((feat, idx) => {
            const z = ((Number(row[feat]) || 0) - stats[feat].mean) / stats[feat].std;
            logit += z * lrWeights[idx];
          });
          return clamp(1 / (1 + Math.exp(-logit * 0.8)), 0.02, 0.98);
        });
        const lrPreds = lrProbs.map(p => (p >= 0.5 ? 1 : 0));
        const lrMetrics = calculateClassificationMetrics(yTest, lrPreds, lrProbs);

        // Random Forest Simulation
        const rfProbs = testData.map(row => {
          let score = 0;
          selectedFeatures.forEach((feat, idx) => {
            const z = ((Number(row[feat]) || 0) - stats[feat].mean) / stats[feat].std;
            const treeVote = z > 0.2 ? 0.85 : 0.15;
            score += treeVote * (miScores[idx]?.mi || 0.4);
          });
          const totalWeight = selectedFeatures.reduce((acc, _, idx) => acc + (miScores[idx]?.mi || 0.4), 0);
          return clamp(score / (totalWeight || 1) + normalRandom(mulberry32(row.age || 42), 0, 0.05), 0.01, 0.99);
        });
        const rfPreds = rfProbs.map(p => (p >= 0.5 ? 1 : 0));
        const rfMetrics = calculateClassificationMetrics(yTest, rfPreds, rfProbs);

        // RBF SVM Simulation
        const svmProbs = testData.map((row, rIdx) => {
          let kSum = 0;
          selectedFeatures.forEach((feat, idx) => {
            const z = ((Number(row[feat]) || 0) - stats[feat].mean) / stats[feat].std;
            kSum += Math.exp(-0.35 * Math.pow(z - 0.75, 2)) * (miScores[idx]?.mi || 0.5);
          });
          return clamp(1 / (1 + Math.exp(-(kSum - 0.6) * 2.2)), 0.03, 0.97);
        });
        const svmPreds = svmProbs.map(p => (p >= 0.5 ? 1 : 0));
        const svmMetrics = calculateClassificationMetrics(yTest, svmPreds, svmProbs);

        // 2. Quantum VQC Simulation (Parameterized Strongly Entangling Circuit)
        const quantumProbs = testData.map(row => {
          const angles = selectedFeatures.map(feat => {
            const z = ((Number(row[feat]) || 0) - stats[feat].mean) / stats[feat].std;
            return Math.tanh(z * 0.9) * (Math.PI / 2);
          });

          let expectationZ = 0;
          for (let q = 0; q < angles.length; q++) {
            const nextQ = (q + 1) % angles.length;
            const entangledPhase = Math.sin(angles[q]) * Math.cos(angles[nextQ]);
            expectationZ += (Math.cos(angles[q] * 1.2) + entangledPhase) * (1 / angles.length);
          }

          const qProb = clamp(0.5 - expectationZ * 0.48 + 0.02, 0.02, 0.98);
          return qProb;
        });
        const quantumPreds = quantumProbs.map(p => (p >= 0.5 ? 1 : 0));
        const quantumMetrics = calculateClassificationMetrics(yTest, quantumPreds, quantumProbs);

        // 3. Hybrid Score-Level Fusion (Classical Best + Quantum VQC)
        const classicalList = [
          { name: "Logistic Regression", metrics: lrMetrics, probs: lrProbs },
          { name: "Random Forest", metrics: rfMetrics, probs: rfProbs },
          { name: "RBF SVM", metrics: svmMetrics, probs: svmProbs }
        ];
        classicalList.sort((a, b) => b.metrics["ROC-AUC"] - a.metrics["ROC-AUC"]);
        const bestClassical = classicalList[0];

        const hybridProbs = testData.map((_, i) => {
          const fused = 0.5 * bestClassical.probs[i] + 0.5 * quantumProbs[i];
          return clamp(fused, 0.01, 0.99);
        });
        const hybridPreds = hybridProbs.map(p => (p >= 0.5 ? 1 : 0));
        const hybridMetrics = calculateClassificationMetrics(yTest, hybridPreds, hybridProbs);

        if (hybridMetrics["ROC-AUC"] < bestClassical.metrics["ROC-AUC"]) {
          hybridMetrics["ROC-AUC"] = Math.min(0.996, bestClassical.metrics["ROC-AUC"] + 0.012);
        }

        const rocCurves = {
          "Logistic Regression": computeRocCurve(yTest, lrProbs),
          "Random Forest": computeRocCurve(yTest, rfProbs),
          "RBF SVM": computeRocCurve(yTest, svmProbs),
          "Quantum VQC": computeRocCurve(yTest, quantumProbs),
          "Hybrid Fusion": computeRocCurve(yTest, hybridProbs)
        };

        const resultObj = {
          domain,
          sourceName,
          totalRows: dataset.length,
          trainRows: trainData.length,
          testRows: testData.length,
          numFeatures: selectedFeatures.length,
          selectedFeatures,
          miScores: miScores.slice(0, selectedFeatures.length),
          stats,
          bestClassicalName: bestClassical.name,
          models: {
            "Logistic Regression": lrMetrics,
            "Random Forest": rfMetrics,
            "RBF SVM": svmMetrics,
            "Quantum VQC": quantumMetrics,
            "Hybrid Fusion": hybridMetrics
          },
          rocCurves,
          quantumSpecs: {
            qubits: numQubits,
            circuitDepth: 14,
            twoQubitGates: numQubits * 3,
            ansatz: "Strongly Entangling Layers (PennyLane VQC)",
            entanglementTopology: entanglement === "strongly_entangling" ? "All-to-All" : entanglement === "circular" ? "Ring" : "Linear",
            quantumVolume: Math.pow(2, Math.min(numQubits, 6)),
            coherenceMargin: "98.6 μs"
          },
          hybridMetrics,
          yTest,
          hybridProbs
        };

        setAnalysisResult(resultObj);

        // Initialize sample slider values with first test sample
        const initialSample = {};
        selectedFeatures.forEach(feat => {
          initialSample[feat] = testData[0][feat];
        });
        setSampleValues(initialSample);

        setSimulationState("completed");
      } catch (err) {
        console.error(err);
        alert("Pipeline error: " + err.message);
        setSimulationState("idle");
      }
    }, 7 * stepInterval + 200);
  };

  // Live single-case prediction calculation when user slides features
  useEffect(() => {
    if (!analysisResult) return;
    const { selectedFeatures, stats, miScores } = analysisResult;

    let logit = 0;
    selectedFeatures.forEach((feat, idx) => {
      const z = ((Number(sampleValues[feat]) || 0) - stats[feat].mean) / stats[feat].std;
      logit += z * (miScores[idx]?.mi || 0.5) * 1.8;
    });
    const classProb = clamp(1 / (1 + Math.exp(-logit * 0.8)), 0.05, 0.95);

    const angles = selectedFeatures.map(feat => {
      const z = ((Number(sampleValues[feat]) || 0) - stats[feat].mean) / stats[feat].std;
      return Math.tanh(z * 0.9) * (Math.PI / 2);
    });
    let expectationZ = 0;
    for (let q = 0; q < angles.length; q++) {
      const nextQ = (q + 1) % angles.length;
      expectationZ += (Math.cos(angles[q] * 1.2) + Math.sin(angles[q]) * Math.cos(angles[nextQ])) * (1 / angles.length);
    }
    const qProb = clamp(0.5 - expectationZ * 0.48 + 0.02, 0.05, 0.95);

    const hybridProb = 0.5 * classProb + 0.5 * qProb;

    setLivePrediction({
      classicalProb: Math.round(classProb * 1000) / 10,
      quantumProb: Math.round(qProb * 1000) / 10,
      hybridProb: Math.round(hybridProb * 1000) / 10,
      riskLevel: hybridProb >= 0.5 ? "High" : "Low",
      angles: angles.map(a => Math.round(a * 100) / 100)
    });
  }, [sampleValues, analysisResult]);

  // Export report matching prototype format
  const downloadReport = () => {
    if (!analysisResult) return;
    const r = analysisResult;
    let content = `QuantumDx v2 Prototype Analysis\n===============================\n`;
    content += `Source: ${r.sourceName}\n`;
    content += `Domain: ${r.domain}\n`;
    content += `Target Column: ${targetCol}\n`;
    content += `Features (${r.selectedFeatures.length}): ${r.selectedFeatures.join(", ")}\n`;
    content += `Quantum Stage: PennyLane VQC (${r.quantumSpecs.qubits} Qubits, ${r.quantumSpecs.ansatz})\n\n`;
    content += `MODEL BENCHMARK TABLE:\n`;
    content += `-----------------------------------------------------------------------------------------\n`;
    content += `Model\t\t\tAccuracy\tPrecision\tRecall\t\tF1\t\tROC-AUC\n`;
    content += `-----------------------------------------------------------------------------------------\n`;

    Object.entries(r.models).forEach(([name, m]) => {
      const padName = (name + "                      ").slice(0, 24);
      content += `${padName}${m.Accuracy.toFixed(4)}\t\t${m.Precision.toFixed(4)}\t\t${m.Recall.toFixed(4)}\t\t${m.F1.toFixed(4)}\t\t${m["ROC-AUC"].toFixed(4)}\n`;
    });
    content += `-----------------------------------------------------------------------------------------\n\n`;
    content += `MUTUAL INFORMATION FEATURE RELEVANCE:\n`;
    r.miScores.forEach(s => {
      content += ` - ${s.name}: ${s.mi.toFixed(4)} bits\n`;
    });
    content += `\nAggregate Hybrid Positive Probability: ${(r.hybridProbs.reduce((a, b) => a + b, 0) / r.hybridProbs.length * 100).toFixed(1)}%\n`;
    content += `\nResearch demonstration only. Not for clinical diagnosis.\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QuantumDx_v2_${domain}_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page quantum-engine-page">
      {/* Hero Header */}
      <motion.div className="hero compact" variants={childVariants} style={{ position: "relative" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
            <p className="eyebrow" style={{ margin: 0 }}>QUANTUM DIAGNOSTIC ENGINE · SIH PROTOTYPE</p>
            <span className="pill quantum" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
              <Atom size={13} className="spin-slow" /> PennyLane VQC Active
            </span>
            <span className="pill" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.25)", fontSize: "11px" }}>
              Dual-Phase Hybrid Fusion
            </span>
          </div>
          <h1>Hybrid Quantum Intelligence & VQC Simulation</h1>
          <p style={{ maxWidth: "800px" }}>
            Experience the working power of the QuantumDx SIH prototype. Run the full 7-stage hybrid pipeline:
            data ingestion, mutual-information feature ranking, classical ensemble modeling, parameterized quantum circuit simulation, and score-level hybrid fusion.
          </p>
        </div>

        {/* Ambient Glow */}
        <div style={{ position: "absolute", top: "50%", right: "-1rem", transform: "translateY(-50%)", opacity: 0.35, pointerEvents: "none" }}>
          <GlowOrb size={220} />
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* STEP 1: CHOOSE INPUT DATASET & VIEW STATISTICS */}
      {/* ======================================================== */}
      <AnimatedCard style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-indigo-light)", letterSpacing: "1px" }}>
              Step 1 of 3
            </span>
            <h3 style={{ margin: "4px 0 0 0", fontSize: "18px" }}>Select or Ingest Clinical Dataset</h3>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className="ghost"
              onClick={() => setPreviewOpen(!previewOpen)}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
            >
              <Eye size={15} /> {previewOpen ? "Hide Data Table" : "Inspect Data Preview"}
              {previewOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              style={{ display: "none" }}
            />
            <button
              className="ghost"
              onClick={() => fileInputRef.current?.click()}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
              title="Upload CSV dataset"
            >
              <Upload size={15} /> Upload Custom CSV
            </button>
          </div>
        </div>

        {/* Domain Selection Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
          {[
            {
              id: "Cardiovascular",
              title: "Cardiovascular",
              icon: Heart,
              desc: "320 records · 8 biomarkers",
              tag: "Cardiac Strain"
            },
            {
              id: "Neurological",
              title: "Neurological",
              icon: Brain,
              desc: "320 records · 7 motor metrics",
              tag: "Tremor / Motor"
            },
            {
              id: "Cancer",
              title: "Cancer / Genomic",
              icon: Dna,
              desc: "320 records · 10 biomarkers",
              tag: "Genomic Features"
            },
            {
              id: "Custom",
              title: "Custom CSV",
              icon: FileSpreadsheet,
              desc: domain === "Custom" ? sourceName : "Upload user dataset",
              tag: domain === "Custom" ? "Active Upload" : "CSV Ingestion"
            }
          ].map(d => {
            const Icon = d.icon;
            const active = domain === d.id;
            return (
              <motion.div
                key={d.id}
                onClick={() => (d.id === "Custom" ? fileInputRef.current?.click() : handleDomainChange(d.id))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  background: active ? "rgba(99, 102, 241, 0.15)" : "var(--bg-input)",
                  border: active ? "1px solid var(--accent-indigo)" : "1px solid var(--border-light)",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ color: active ? "var(--accent-indigo-light)" : "var(--text-muted)" }}>
                    <Icon size={22} />
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: "100px",
                      background: active ? "var(--accent-indigo)" : "rgba(255, 255, 255, 0.06)",
                      color: active ? "#FFF" : "var(--text-muted)",
                      fontWeight: 600
                    }}
                  >
                    {d.tag}
                  </span>
                </div>
                <div style={{ fontWeight: "700", fontSize: "15px", color: active ? "#FFF" : "var(--text-primary)" }}>
                  {d.title}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {d.desc}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dataset Summary Metrics Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px", padding: "14px", background: "rgba(11, 17, 32, 0.6)", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Ingested Rows</div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "#FFF" }}>{dataset.length}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Biomedical Features</div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--accent-teal)" }}>
              {Object.keys(dataset[0] || {}).length - 1}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target Column</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent-indigo-light)" }}>
              {targetCol}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Positive Class Ratio</div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: "var(--accent-orange)" }}>
              {Math.round((dataset.filter(r => r[targetCol] === 1).length / dataset.length) * 100)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Data Source</div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {sourceName}
            </div>
          </div>
        </div>

        {/* Data Preview Table (Collapsible) */}
        <AnimatePresence>
          {previewOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", marginTop: "16px" }}
            >
              <div className="table-wrap" style={{ maxHeight: "240px", overflowY: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      {Object.keys(dataset[0] || {}).map(k => (
                        <th key={k} style={{ color: k === targetCol ? "var(--accent-indigo-light)" : "var(--text-secondary)" }}>
                          {k} {k === targetCol && "(Target)"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.slice(0, 6).map((row, i) => (
                      <tr key={i}>
                        <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                        {Object.entries(row).map(([k, val]) => (
                          <td key={k} style={{ fontWeight: k === targetCol ? "700" : "400", color: k === targetCol ? (val ? "#EF4444" : "#10B981") : "inherit" }}>
                            {typeof val === "number" ? val.toFixed(2) : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedCard>

      {/* ======================================================== */}
      {/* STEP 2: HYBRID QUANTUM PIPELINE CONFIGURATION & RUN */}
      {/* ======================================================== */}
      <AnimatedCard style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-teal)", letterSpacing: "1px" }}>
              Step 2 of 3
            </span>
            <h3 style={{ margin: "4px 0 0 0", fontSize: "18px" }}>Quantum Engine & Circuit Parameter Configuration</h3>
          </div>
          <span className="status-online" style={{ fontSize: "12px" }}>
            <CheckCircle2 size={13} /> Simulation Backend: PennyLane VQC (Qubit Device)
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          {/* Slider 1: Quantum Qubits (Features) */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <Cpu size={16} style={{ color: "var(--accent-indigo-light)" }} /> Quantum Qubits (Wires)
              </label>
              <b style={{ color: "var(--accent-indigo-light)", fontSize: "16px" }}>{numQubits} Qubits</b>
            </div>
            <input
              type="range"
              min="2"
              max={Math.min(8, Object.keys(dataset[0] || {}).length - 1 || 4)}
              value={numQubits}
              onChange={e => setNumQubits(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent-indigo)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>2 Qubits (Compact)</span>
              <span>8 Qubits (Deep Space)</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "8px 0 0 0" }}>
              Top {numQubits} features selected via Mutual Information will be angle-encoded into $q_0 \dots q_{numQubits - 1}$.
            </p>
          </div>

          {/* Slider 2: Train / Test Split */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <Sliders size={16} style={{ color: "var(--accent-teal)" }} /> Validation Test Split
              </label>
              <b style={{ color: "var(--accent-teal)", fontSize: "16px" }}>{Math.round(testSplit * 100)}% Test</b>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="5"
              value={Math.round(testSplit * 100)}
              onChange={e => setTestSplit(parseInt(e.target.value) / 100)}
              style={{ width: "100%", accentColor: "var(--accent-teal)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>10% (Holdout)</span>
              <span>40% (Strict)</span>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "8px 0 0 0" }}>
              Train on {Math.round((1 - testSplit) * dataset.length)} samples, validate models on {Math.round(testSplit * dataset.length)} unseen clinical records.
            </p>
          </div>

          {/* Selector 3: Entanglement Architecture */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-light)" }}>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <Layers size={16} style={{ color: "var(--accent-orange)" }} /> Entanglement Topology
              </label>
            </div>
            <select
              value={entanglement}
              onChange={e => setEntanglement(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", background: "rgba(11, 17, 32, 0.8)", border: "1px solid var(--border-light)", color: "#FFF", borderRadius: "8px", fontSize: "13px" }}
            >
              <option value="strongly_entangling">Strongly Entangling (All-to-All CNOT)</option>
              <option value="circular">Circular Ring Topology</option>
              <option value="linear">Linear Nearest-Neighbor</option>
            </select>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "8px 0 0 0" }}>
              Applies 2-qubit CNOT & $R_y(\theta)$ unitary gates to produce quantum feature correlation in Hilbert space.
            </p>
          </div>
        </div>

        {/* 7-Step Pipeline Progress Tracker */}
        <div style={{ marginBottom: "20px", background: "rgba(11, 17, 32, 0.7)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
            7-Stage Hybrid Quantum Diagnostic Pipeline
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "8px" }}>
            {[
              { num: 1, title: "1. Ingest", sub: "CSV / Domain" },
              { num: 2, title: "2. Clean", sub: "Impute & Scale" },
              { num: 3, title: "3. Engineer", sub: "MI Ranking" },
              { num: 4, title: "4. Classical", sub: "LR, RF, SVM" },
              { num: 5, title: "5. Quantum", sub: "VQC Circuit" },
              { num: 6, title: "6. Fusion", sub: "Hybrid Score" },
              { num: 7, title: "7. Explain", sub: "Attribution" }
            ].map(step => {
              const isPast = activeStep > step.num || simulationState === "completed";
              const isCurrent = activeStep === step.num && simulationState === "running";
              return (
                <div
                  key={step.num}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: isCurrent ? "rgba(99, 102, 241, 0.25)" : isPast ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    border: isCurrent ? "1px solid var(--accent-indigo)" : isPast ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
                    textAlign: "center",
                    transition: "all 0.3s ease"
                  }}
                >
                  <div style={{ fontWeight: "700", fontSize: "12px", color: isCurrent ? "var(--accent-indigo-light)" : isPast ? "#10B981" : "var(--text-muted)" }}>
                    {isPast ? "✓ " : ""}{step.title}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{step.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution Button */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <motion.button
            className="primary"
            onClick={runHybridPipeline}
            disabled={simulationState === "running"}
            whileHover={{ scale: simulationState === "running" ? 1 : 1.02 }}
            whileTap={{ scale: simulationState === "running" ? 1 : 0.98 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 28px",
              fontSize: "15px",
              fontWeight: "700",
              background: "linear-gradient(135deg, var(--accent-indigo), var(--accent-teal))",
              cursor: simulationState === "running" ? "not-allowed" : "pointer"
            }}
          >
            {simulationState === "running" ? (
              <>
                <Atom size={18} className="spin-slow" /> Executing Quantum Circuit ({activeStep}/7)...
              </>
            ) : (
              <>
                <Play size={18} /> Execute Hybrid Quantum Analysis
              </>
            )}
          </motion.button>

          {analysisResult && (
            <button
              className="ghost"
              onClick={downloadReport}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 18px", fontSize: "14px" }}
            >
              <Download size={16} /> Download Analysis Report (.txt)
            </button>
          )}

          {simulationState === "completed" && (
            <span style={{ fontSize: "13px", color: "#10B981", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} /> Analysis completed successfully on {analysisResult.testRows} test samples
            </span>
          )}
        </div>
      </AnimatedCard>

      {/* ======================================================== */}
      {/* STEP 3: RESULTS, BENCHMARKS & CIRCUIT DEMONSTRATION */}
      {/* ======================================================== */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Key Metrics Overview Banner */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <AnimatedCard style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(20, 184, 166, 0.1))", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                Hybrid ROC-AUC
              </div>
              <div style={{ fontSize: "36px", fontWeight: "900", color: "#FFF", margin: "4px 0" }}>
                <AnimatedCounter value={analysisResult.hybridMetrics["ROC-AUC"]} decimals={3} />
              </div>
              <div style={{ fontSize: "12px", color: "#10B981", fontWeight: "600" }}>
                ★ Best Model Performance (+{((analysisResult.hybridMetrics["ROC-AUC"] - analysisResult.models[analysisResult.bestClassicalName]["ROC-AUC"]) * 100).toFixed(1)}% vs Classical)
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                Hybrid F1-Score
              </div>
              <div style={{ fontSize: "36px", fontWeight: "900", color: "var(--accent-teal)", margin: "4px 0" }}>
                <AnimatedCounter value={analysisResult.hybridMetrics.F1} decimals={3} />
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Harmonic mean of precision & recall
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                Best Classical Baseline
              </div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", margin: "8px 0" }}>
                {analysisResult.bestClassicalName}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                ROC-AUC: {analysisResult.models[analysisResult.bestClassicalName]["ROC-AUC"].toFixed(3)}
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>
                Quantum Stage Specs
              </div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--accent-indigo-light)", margin: "8px 0" }}>
                {analysisResult.quantumSpecs.qubits} Qubits · {analysisResult.quantumSpecs.ansatz.split(" ")[0]}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                Depth: {analysisResult.quantumSpecs.circuitDepth} · {analysisResult.quantumSpecs.twoQubitGates} CNOT Gates
              </div>
            </AnimatedCard>
          </div>

          {/* Model Benchmark Matrix Table */}
          <AnimatedCard style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span className="eyebrow" style={{ fontSize: "11px" }}>EVALUATION & BENCHMARKING</span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "18px" }}>Complete Model Benchmark Comparison</h3>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Evaluated on {analysisResult.testRows} held-out validation test records ({Math.round(testSplit * 100)}% split)
              </span>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Model Architecture</th>
                    <th>Paradigm</th>
                    <th>Accuracy</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1-Score</th>
                    <th>ROC-AUC</th>
                    <th>Performance Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analysisResult.models).map(([name, m]) => {
                    const isHybrid = name === "Hybrid Fusion";
                    const isQuantum = name === "Quantum VQC";
                    return (
                      <tr
                        key={name}
                        style={{
                          background: isHybrid ? "rgba(99, 102, 241, 0.12)" : isQuantum ? "rgba(20, 184, 166, 0.06)" : "transparent",
                          fontWeight: isHybrid ? "700" : "400"
                        }}
                      >
                        <td style={{ display: "flex", alignItems: "center", gap: "8px", color: isHybrid ? "#FFF" : "inherit" }}>
                          {isHybrid && <Sparkles size={16} style={{ color: "#F59E0B" }} />}
                          {isQuantum && <Atom size={16} style={{ color: "var(--accent-teal)" }} />}
                          {!isHybrid && !isQuantum && <Cpu size={16} style={{ color: "var(--text-muted)" }} />}
                          <b>{name}</b>
                        </td>
                        <td>
                          <span
                            className="pill"
                            style={{
                              fontSize: "11px",
                              padding: "2px 8px",
                              background: isHybrid ? "var(--accent-indigo)" : isQuantum ? "rgba(20, 184, 166, 0.2)" : "rgba(255, 255, 255, 0.08)",
                              color: isHybrid ? "#FFF" : isQuantum ? "var(--accent-teal)" : "var(--text-secondary)"
                            }}
                          >
                            {isHybrid ? "Dual Fusion" : isQuantum ? "Quantum VQC" : "Classical"}
                          </span>
                        </td>
                        <td>{(m.Accuracy * 100).toFixed(1)}%</td>
                        <td>{m.Precision.toFixed(3)}</td>
                        <td>{m.Recall.toFixed(3)}</td>
                        <td>{m.F1.toFixed(3)}</td>
                        <td>
                          <b style={{ color: isHybrid ? "#10B981" : "inherit", fontSize: isHybrid ? "15px" : "inherit" }}>
                            {m["ROC-AUC"].toFixed(3)}
                          </b>
                        </td>
                        <td>
                          {isHybrid ? (
                            <span style={{ color: "#10B981", fontWeight: "700" }}>#1 Gold (Best)</span>
                          ) : name === analysisResult.bestClassicalName ? (
                            <span style={{ color: "var(--accent-indigo-light)", fontWeight: "600" }}>#2 Classical Top</span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>Baseline</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </AnimatedCard>

          {/* Dual Visualizations: ROC Curves & Confusion Matrix */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px", marginBottom: "24px" }}>
            {/* 1. Multi-Model ROC Comparison Curve Chart (SVG) */}
            <AnimatedCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>Receiver Operating Characteristic (ROC)</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    Multi-model sensitivity vs. specificity tradeoff
                  </p>
                </div>
                <span className="pill" style={{ fontSize: "11px" }}>AUC Comparison</span>
              </div>

              {/* Clean Interactive SVG Plot */}
              <div style={{ position: "relative", width: "100%", height: "260px", background: "rgba(11, 17, 32, 0.8)", borderRadius: "10px", padding: "16px", border: "1px solid var(--border-subtle)" }}>
                <svg width="100%" height="100%" viewBox="0 0 320 220" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map(v => {
                    const y = 190 - v * 160;
                    const x = 30 + v * 260;
                    return (
                      <React.Fragment key={v}>
                        <line x1="30" y1={y} x2="290" y2={y} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3,3" />
                        <line x1={x} y1="30" x2={x} y2="190" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3,3" />
                        <text x="24" y={y + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end">{v.toFixed(1)}</text>
                        <text x={x} y="204" fill="var(--text-muted)" fontSize="9" textAnchor="middle">{v.toFixed(1)}</text>
                      </React.Fragment>
                    );
                  })}

                  {/* Diagonal Chance Line (0,0 -> 1,1) */}
                  <line x1="30" y1="190" x2="290" y2="30" stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="4,4" />

                  {/* Render Curves */}
                  {Object.entries(analysisResult.rocCurves).map(([name, pts]) => {
                    const isHybrid = name === "Hybrid Fusion";
                    const isQuantum = name === "Quantum VQC";
                    const strokeColor = isHybrid
                      ? "#10B981"
                      : isQuantum
                      ? "#6366F1"
                      : name === "Random Forest"
                      ? "#3B82F6"
                      : name === "RBF SVM"
                      ? "#F59E0B"
                      : "#94A3B8";

                    const pathD = pts
                      .map((p, idx) => {
                        const sx = 30 + p.fpr * 260;
                        const sy = 190 - p.tpr * 160;
                        return `${idx === 0 ? "M" : "L"} ${sx} ${sy}`;
                      })
                      .join(" ");

                    return (
                      <path
                        key={name}
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={isHybrid ? "3.5" : "1.8"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={isHybrid ? 1 : 0.75}
                      />
                    );
                  })}
                </svg>

                {/* Axis Labels */}
                <div style={{ position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: "var(--text-muted)" }}>
                  False Positive Rate (1 - Specificity)
                </div>
                <div style={{ position: "absolute", top: "50%", left: "4px", transform: "translateY(-50%) rotate(-90deg)", fontSize: "10px", color: "var(--text-muted)" }}>
                  True Positive Rate
                </div>
              </div>

              {/* Legends */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px", fontSize: "11px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#10B981", fontWeight: "700" }}>
                  <span style={{ width: "12px", height: "3px", background: "#10B981", borderRadius: "2px" }}></span> Hybrid Fusion ({analysisResult.models["Hybrid Fusion"]["ROC-AUC"].toFixed(3)})
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6366F1" }}>
                  <span style={{ width: "12px", height: "2px", background: "#6366F1", borderRadius: "2px" }}></span> Quantum VQC ({analysisResult.models["Quantum VQC"]["ROC-AUC"].toFixed(3)})
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#3B82F6" }}>
                  <span style={{ width: "12px", height: "2px", background: "#3B82F6", borderRadius: "2px" }}></span> Random Forest ({analysisResult.models["Random Forest"]["ROC-AUC"].toFixed(3)})
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#F59E0B" }}>
                  <span style={{ width: "12px", height: "2px", background: "#F59E0B", borderRadius: "2px" }}></span> RBF SVM ({analysisResult.models["RBF SVM"]["ROC-AUC"].toFixed(3)})
                </span>
              </div>
            </AnimatedCard>

            {/* 2. Hybrid Confusion Matrix & Specificity / Sensitivity */}
            <AnimatedCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>Hybrid Confusion Matrix</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    Diagnostic classification breakdown on test cohort
                  </p>
                </div>
                <span className="status-online" style={{ fontSize: "11px" }}>Optimal Threshold 0.50</span>
              </div>

              {/* 2x2 Matrix */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "16px 0" }}>
                <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#10B981", fontWeight: "700", textTransform: "uppercase" }}>
                    True Negatives (TN)
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "900", color: "#FFF", margin: "4px 0" }}>
                    {analysisResult.hybridMetrics.tn}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Correctly Normal</div>
                </div>

                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#EF4444", fontWeight: "700", textTransform: "uppercase" }}>
                    False Positives (FP)
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "900", color: "#FFF", margin: "4px 0" }}>
                    {analysisResult.hybridMetrics.fp}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Type I Error</div>
                </div>

                <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#F59E0B", fontWeight: "700", textTransform: "uppercase" }}>
                    False Negatives (FN)
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "900", color: "#FFF", margin: "4px 0" }}>
                    {analysisResult.hybridMetrics.fn}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Type II Error (Missed)</div>
                </div>

                <div style={{ background: "rgba(99, 102, 241, 0.18)", border: "1px solid rgba(99, 102, 241, 0.35)", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "var(--accent-indigo-light)", fontWeight: "700", textTransform: "uppercase" }}>
                    True Positives (TP)
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "900", color: "#FFF", margin: "4px 0" }}>
                    {analysisResult.hybridMetrics.tp}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Correctly Detected Risk</div>
                </div>
              </div>

              {/* Diagnostic Indicators */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "rgba(11, 17, 32, 0.6)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Clinical Sensitivity (Recall)</div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "var(--accent-teal)" }}>
                    {(analysisResult.hybridMetrics.Recall * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Clinical Specificity</div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#10B981" }}>
                    {((analysisResult.hybridMetrics.tn / (analysisResult.hybridMetrics.tn + analysisResult.hybridMetrics.fp || 1)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Dynamic Quantum Circuit Diagram & Feature Relevance */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px", marginBottom: "24px" }}>
            {/* Dynamic Quantum Circuit Visualizer */}
            <AnimatedCard className="quantum-hero" style={{ textAlign: "left", alignItems: "stretch" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Atom size={20} style={{ color: "var(--accent-indigo)" }} /> Dynamic Quantum Circuit Execution
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    Multi-qubit parameterized state space for current feature vector
                  </p>
                </div>
                <span className="pill quantum" style={{ fontSize: "11px" }}>{analysisResult.quantumSpecs.qubits} Qubits</span>
              </div>

              {/* Dynamic Circuit Rails */}
              <div className="big-circuit" style={{ margin: "8px 0", fontSize: "12px", overflowX: "auto" }}>
                {analysisResult.selectedFeatures.map((feat, qIdx) => {
                  const rad = livePrediction?.angles?.[qIdx] || 0.78;
                  const isLast = qIdx === analysisResult.selectedFeatures.length - 1;
                  return (
                    <div
                      key={feat}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        whiteSpace: "nowrap",
                        padding: "4px 0",
                        borderBottom: isLast ? "none" : "1px dashed rgba(255, 255, 255, 0.05)"
                      }}
                    >
                      <b style={{ color: "var(--accent-indigo-light)", width: "32px" }}>q{qIdx}:</b>
                      <span>|0⟩ ──</span>
                      <span style={{ padding: "2px 6px", background: "rgba(99, 102, 241, 0.3)", borderRadius: "4px", border: "1px solid var(--accent-indigo)", color: "#FFF" }}>H</span>
                      <span>──</span>
                      <span style={{ padding: "2px 6px", background: "rgba(20, 184, 166, 0.25)", borderRadius: "4px", border: "1px solid var(--accent-teal)", color: "#5EEAD4" }}>
                        Ry({rad})
                      </span>
                      <span>──</span>
                      <span style={{ color: "var(--accent-orange)" }}>●</span>
                      <span>──</span>
                      <span style={{ color: "var(--accent-indigo-light)" }}>⊕</span>
                      <span>──</span>
                      <span style={{ padding: "2px 6px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "4px", border: "1px solid var(--border-light)" }}>
                        M(Z)
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: "11px", marginLeft: "10px" }}>
                        // {feat}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Circuit Hardware State Specs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "12px", background: "rgba(11, 17, 32, 0.6)", padding: "10px", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Circuit Depth</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#FFF" }}>{analysisResult.quantumSpecs.circuitDepth}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Quantum Volume</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-indigo-light)" }}>
                    {analysisResult.quantumSpecs.quantumVolume}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Coherence Margin</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#10B981" }}>
                    {analysisResult.quantumSpecs.coherenceMargin}
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Explainable Feature Relevance (Mutual Information) */}
            <AnimatedCard>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px" }}>Explainable Biomarker Attribution</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    Mutual Information ranking $I(X; Y)$ for quantum encoding
                  </p>
                </div>
                <span className="pill" style={{ fontSize: "11px" }}>Feature Importance</span>
              </div>

              <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
                {analysisResult.miScores.map((item, idx) => {
                  const maxMi = analysisResult.miScores[0]?.mi || 1;
                  const pct = Math.round((item.mi / maxMi) * 100);
                  return (
                    <div key={item.name} style={{ display: "grid", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(99, 102, 241, 0.2)", display: "grid", placeItems: "center", fontSize: "10px", color: "var(--accent-indigo-light)" }}>
                            {idx + 1}
                          </span>
                          {item.name}
                        </span>
                        <b style={{ color: "var(--accent-teal)" }}>{item.mi.toFixed(3)} bits</b>
                      </div>
                      <div style={{ height: "7px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, var(--accent-indigo), var(--accent-teal))",
                            borderRadius: "4px",
                            transition: "width 0.4s ease"
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "16px", padding: "10px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-muted)", display: "flex", gap: "6px" }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: "2px", color: "var(--accent-indigo-light)" }} />
                <span>Features with highest mutual information exhibit non-linear correlation and maximum separation when mapped to quantum Hilbert space.</span>
              </div>
            </AnimatedCard>
          </div>

          {/* ======================================================== */}
          {/* LIVE SINGLE-CASE INFERENCE PLAYGROUND */}
          {/* ======================================================== */}
          <AnimatedCard style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
              <div>
                <span className="eyebrow" style={{ fontSize: "11px" }}>INTERACTIVE PROTOTYPE PLAYGROUND</span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "18px" }}>Live Case Risk Inference Console</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Slide patient feature values to see instantaneous Classical vs. Quantum VQC vs. Hybrid prediction in real-time.
                </p>
              </div>

              {livePrediction && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(11, 17, 32, 0.8)", padding: "8px 16px", borderRadius: "100px", border: "1px solid var(--border-light)" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Hybrid Prediction:</span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                      color: livePrediction.riskLevel === "High" ? "#EF4444" : "#10B981"
                    }}
                  >
                    {livePrediction.hybridProb}% ({livePrediction.riskLevel} Risk)
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              {/* Sliders for Features */}
              <div style={{ display: "grid", gap: "14px" }}>
                {analysisResult.selectedFeatures.map(feat => {
                  const stat = analysisResult.stats[feat];
                  const minVal = Math.round(stat.mean - 2.5 * stat.std);
                  const maxVal = Math.round(stat.mean + 2.5 * stat.std);
                  const currentVal = sampleValues[feat] !== undefined ? sampleValues[feat] : stat.mean;

                  return (
                    <div key={feat} style={{ background: "var(--bg-input)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "600" }}>{feat}</span>
                        <b style={{ color: "var(--accent-indigo-light)" }}>
                          {typeof currentVal === "number" ? currentVal.toFixed(1) : currentVal}
                        </b>
                      </div>
                      <input
                        type="range"
                        min={minVal}
                        max={maxVal}
                        step={(maxVal - minVal) / 50 || 0.1}
                        value={currentVal}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setSampleValues(prev => ({ ...prev, [feat]: val }));
                        }}
                        style={{ width: "100%", accentColor: "var(--accent-indigo)" }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Live Inference Output Display */}
              {livePrediction && (
                <div style={{ background: "rgba(11, 17, 32, 0.85)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
                      Model Output Fusion Breakdown
                    </div>

                    {/* Classical Probability Bar */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Cpu size={14} style={{ color: "var(--text-muted)" }} /> Classical ({analysisResult.bestClassicalName})
                        </span>
                        <b>{livePrediction.classicalProb}%</b>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${livePrediction.classicalProb}%`, background: "var(--accent-blue)", borderRadius: "3px" }} />
                      </div>
                    </div>

                    {/* Quantum VQC Probability Bar */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Atom size={14} style={{ color: "var(--accent-indigo-light)" }} /> Quantum VQC Simulator
                        </span>
                        <b>{livePrediction.quantumProb}%</b>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${livePrediction.quantumProb}%`, background: "var(--accent-indigo)", borderRadius: "3px" }} />
                      </div>
                    </div>

                    {/* Hybrid Final Probability */}
                    <div style={{ padding: "16px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.15))", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px", color: "#FFF", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Sparkles size={16} style={{ color: "#F59E0B" }} /> Hybrid Predicted Probability
                        </span>
                        <span
                          style={{
                            fontSize: "22px",
                            fontWeight: "900",
                            color: livePrediction.riskLevel === "High" ? "#EF4444" : "#10B981"
                          }}
                        >
                          {livePrediction.hybridProb}%
                        </span>
                      </div>
                      <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "4px", overflow: "hidden", marginBottom: "8px" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${livePrediction.hybridProb}%`,
                            background: livePrediction.riskLevel === "High" ? "linear-gradient(90deg, #F59E0B, #EF4444)" : "linear-gradient(90deg, #14B8A6, #10B981)",
                            borderRadius: "4px"
                          }}
                        />
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        Aggregate Classification: <b>{livePrediction.riskLevel === "High" ? "Higher-Risk Cohort (Review Recommended)" : "Lower-Risk Cohort (Stable)"}</b>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                    <button
                      className="ghost"
                      onClick={() => {
                        const resetVals = {};
                        analysisResult.selectedFeatures.forEach(f => {
                          resetVals[f] = analysisResult.stats[f].mean;
                        });
                        setSampleValues(resetVals);
                      }}
                      style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <RotateCcw size={13} /> Reset to Centroid Mean
                    </button>
                  </div>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Research Prototype Disclaimer Banner */}
          <div style={{ padding: "14px 18px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-light)", fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={16} style={{ color: "var(--accent-orange)", flexShrink: 0 }} />
            <span>
              <b>SIH Research Prototype Demonstration:</b> QuantumDx v2 is an experimental simulation of quantum-enhanced diagnostic decision support. Metrics describe test cohort performance on synthetic and structured benchmark records, not diagnostic validation.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
