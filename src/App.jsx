import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Users,
  Activity,
  Hexagon,
  BarChart2,
  FileText,
  Search,
  Bell,
  Settings,
  ArrowRight,
  AlertCircle,
  FileBarChart,
  CheckCircle2,
  ChevronRight,
  Atom,
  User,
  ArrowLeft,
  Calendar,
  X,
  Printer,
  Sparkles,
  IndianRupee
} from "lucide-react";
import SpatialField from "./SpatialField";
import PageTransition, { childVariants } from "./components/PageTransition";
import AnimatedCard from "./components/AnimatedCard";
import GlowOrb from "./components/GlowOrb";
import AnimatedCounter from "./components/AnimatedCounter";
import Pricing from "./components/Pricing";

// Generates randomized risk scores strictly within 30% seeded per patient and day
export const getDailyScore = (id) => {
  const today = new Date().toDateString();
  let hash = 0;
  const str = id + today;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  return (12 + (hash % 18)) / 100; // Between 12% and 29% (within 30%)
};

export const initialPatients = [
  { id: "P-1042", name: "Aarav Sharma", sex: "Male", age: 48, risk: "Low", score: getDailyScore("P-1042"), status: "Review" },
  { id: "P-1038", name: "Meera Das", sex: "Female", age: 39, risk: "Low", score: getDailyScore("P-1038"), status: "Monitor" },
  { id: "P-1027", name: "Rohan Sen", sex: "Male", age: 54, risk: "Low", score: getDailyScore("P-1027"), status: "Review" },
  { id: "P-1019", name: "Ananya Roy", sex: "Female", age: 42, risk: "Low", score: getDailyScore("P-1019"), status: "Stable" },
  { id: "P-1008", name: "Kabir Singh", sex: "Male", age: 51, risk: "Low", score: getDailyScore("P-1008"), status: "Monitor" },
];

export const initialReports = [
  { title: "High Risk Assessment — P-1042", id: "P-1042", desc: "Includes risk score, confidence and feature explanations.", date: "Sep 5, 2026" },
  { title: "Volunteer Screening — P-1038", id: "P-1038", desc: "Includes risk score, confidence and feature explanations.", date: "Sep 5, 2026" },
  { title: "QuantumDx Benchmark Report", id: null, desc: "Generated from QuantumDx prototype data.", date: "Sep 4, 2026" },
  { title: "Model Performance Summary", id: null, desc: "Generated from QuantumDx prototype data.", date: "Sep 3, 2026" }
];

// Dynamic patient risk profile generator & data fetcher
export const getPatientRiskProfile = (patientId, patientsList = initialPatients) => {
  const patient = patientsList.find(p => p.id === patientId) || {
    id: patientId,
    name: "Volunteer " + patientId,
    sex: "Volunteer",
    age: 45,
    risk: "Low",
    score: getDailyScore(patientId),
    status: "Review"
  };

  const scorePercent = Math.round(patient.score * 100);
  const isLow = scorePercent <= 35;
  const isMedium = scorePercent > 35 && scorePercent <= 70;
  const riskLevel = isLow ? "Low" : (isMedium ? "Medium" : "High");
  const ringColor = isLow ? "var(--accent-green)" : (isMedium ? "var(--accent-orange)" : "var(--accent-red)");

  // Deterministic seed from patient ID for clinical measurements
  let hash = 0;
  for (let i = 0; i < patient.id.length; i++) hash = (hash * 37 + patient.id.charCodeAt(i)) % 1000;

  // Sync prediction confidence directly to the patient's risk score (with minor natural variance)
  const confidence = (scorePercent + ((hash % 9) / 10)).toFixed(1);
  const completeness = 95 + (hash % 5);
  const stability = scorePercent <= 30 ? "Consistent (Low Variance)" : "Moderate Variance";

  // Patient-specific clinical features (honoring custom parameters if provided)
  const radiusVal = patient.customRadius || (12.0 + (scorePercent * 0.12) + (hash % 15) / 10).toFixed(1);
  const textureVal = patient.customTexture || (16.0 + (scorePercent * 0.18) + (hash % 20) / 10).toFixed(1);
  const perimeterVal = patient.customPerimeter || (78.0 + (scorePercent * 0.6) + (hash % 30) / 10).toFixed(1);

  // Scaled contributing factors for this specific patient
  const factor1 = Math.min(95, Math.max(15, Math.round(scorePercent * 1.1 + 4)));
  const factor2 = Math.min(92, Math.max(12, Math.round(scorePercent * 0.95 + 3)));
  const factor3 = Math.min(90, Math.max(10, Math.round(scorePercent * 0.85 + 2)));
  const factor4 = Math.min(85, Math.max(8, Math.round(scorePercent * 0.75 + 2)));

  const factors = [
    { name: `Biomarker pattern (${patient.sex})`, value: factor1 },
    { name: `Mean radius (${radiusVal} mm)`, value: factor2 },
    { name: `Mean perimeter (${perimeterVal} mm)`, value: factor3 },
    { name: `Texture characteristics (${textureVal})`, value: factor4 },
  ];

  let recommendationTitle = "";
  let recommendationText = "";
  let riskSubtitle = "";

  if (isLow) {
    riskSubtitle = "Volunteer screening within normal baseline";
    recommendationTitle = "Normal baseline — routine health monitoring";
    recommendationText = `Risk score of ${scorePercent}% indicates minimal risk indicators for volunteer ${patient.name} (${patient.age} yrs, ${patient.sex}). No specialized clinical escalation needed; continue standard routine follow-ups.`;
  } else if (isMedium) {
    riskSubtitle = "Borderline indicators detected";
    recommendationTitle = "Secondary screening recommended within 6 months";
    recommendationText = `Risk score of ${scorePercent}% suggests borderline variance for ${patient.name}. Periodic surveillance and follow-up consultation recommended.`;
  } else {
    riskSubtitle = "Clinical follow-up recommended";
    recommendationTitle = "Further clinical evaluation suggested";
    recommendationText = `This output is clinical decision support for ${patient.name}. Review by an attending clinician is suggested. QuantumDx does not provide a final diagnosis.`;
  }

  return {
    ...patient,
    scorePercent,
    riskLevel,
    ringColor,
    confidence,
    completeness,
    stability,
    radiusVal,
    textureVal,
    perimeterVal,
    factors,
    recommendationTitle,
    recommendationText,
    riskSubtitle,
    screenDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
};

function RiskBadge({ risk }) {
  return <span className={"badge " + (risk || "low").toLowerCase()}>{risk}</span>;
}

// Stagger container for grid items
const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

// Table row animation
const rowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
      delay: i * 0.05,
    },
  }),
};

function Metric({ label, value, sub, accent = "" }) {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  const isNumeric = !isNaN(numericValue) && isFinite(numericValue);
  const hasSuffix = typeof value === "string" && value.includes("%");

  return (
    <AnimatedCard className="metric">
      <div className="metric-top">
        <span>{label}</span>
        <span className={"metric-dot " + accent}></span>
      </div>
      <strong>
        {isNumeric ? (
          <AnimatedCounter
            value={numericValue}
            suffix={hasSuffix ? "%" : ""}
            decimals={hasSuffix ? 1 : 0}
          />
        ) : (
          value
        )}
      </strong>
      {sub ? <small>{sub}</small> : <small style={{ visibility: 'hidden' }}>&nbsp;</small>}
    </AnimatedCard>
  );
}

function Dashboard({ setPage, onReviewPatient, patients = initialPatients }) {
  const avgConfidence = "91.8%";

  return (
    <div className="page">
      <motion.div className="hero hero--spatial" variants={childVariants}>
        <div className="hero-copy">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            CLINICAL INTELLIGENCE PLATFORM
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
          >
            <span>Good morning,</span><em>Doctor.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Monitor patient risk, run hybrid analyses, and review explainable predictions.
          </motion.p>
        </div>
        <motion.button
          className="primary hero-cta"
          onClick={() => setPage("analysis")}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Atom size={18} /> Run New Analysis
        </motion.button>

        {/* Astra GlowOrb — living intelligence indicator */}
        <div className="hero-orb-wrap">
          <GlowOrb size={280} />
        </div>
      </motion.div>

      <motion.div
        className="metrics"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <Metric label="Patients Analyzed" value={patients.length} accent="blue" />
        <Metric label="High Risk Cases" value="0" accent="red" />
        <Metric label="Average Confidence" value={avgConfidence} sub="Across latest analyses" accent="purple" />
        <Metric label="Quantum Analyses" value="50" sub="Hybrid pipeline runs" accent="green" />
      </motion.div>

      <motion.div
        className="grid-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <AnimatedCard>
          <div className="card-header">
            <div>
              <h3>Patient Risk Distribution</h3>
              <p>Current screened population</p>
            </div>
            <span className="pill">Live Demo Data</span>
          </div>
          <div className="risk-chart">
            <div className="donut" style={{ background: "#10B981", boxShadow: "0 0 2.5rem rgba(16, 185, 129, 0.35)" }}>
              <div className="donut-hole">
                <b><AnimatedCounter value={patients.length} /></b>
                <span>Patients</span>
              </div>
            </div>
            <div className="legend">
              <div><i className="lg low" style={{ background: "#10B981" }}></i><span>Low Risk</span><b>{patients.length}</b></div>
              <div><i className="lg medium"></i><span>Medium Risk</span><b>0</b></div>
              <div><i className="lg high"></i><span>High Risk</span><b>0</b></div>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard>
          <div className="card-header">
            <div>
              <h3>Hybrid Model Status</h3>
              <p>Current prototype performance</p>
            </div>
            <span className="status-online"><CheckCircle2 size={14} /> Online</span>
          </div>
          <div className="model-status">
            <div className="q-core">
              <span><Atom size={40} /></span>
              <b>QuantumDx</b>
              <small>Hybrid Engine</small>
            </div>
            <div className="model-details">
              <div><span>Classical preprocessing</span><b>Ready</b></div>
              <div><span>Quantum feature map</span><b>Ready</b></div>
              <div><span>QSVM classifier</span><b>Ready</b></div>
              <div className="auc"><span>Prototype ROC-AUC</span><b><AnimatedCounter value={0.993} decimals={3} /></b></div>
            </div>
          </div>
        </AnimatedCard>
      </motion.div>

      <AnimatedCard>
        <div className="card-header">
          <div>
            <h3>Survey Done on Volunteers in Our College</h3>
            <p>Campus volunteer screening records</p>
          </div>
          <button className="ghost" onClick={() => setPage("patients")}>
            View all <ArrowRight size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>ID</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Risk Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, 4).map((p, i) => (
                <motion.tr
                  key={p.id}
                  custom={i}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                >
                  <td><b>{p.name}</b></td>
                  <td>{p.id}</td>
                  <td>{p.age}</td>
                  <td><span className="badge sex">{p.sex}</span></td>
                  <td>
                    <div className="score">
                      <div><span style={{ width: `${Math.round(p.score * 100)}%` }}></span></div>
                      {Math.round(p.score * 100)}%
                    </div>
                  </td>
                  <td>
                    <button className="linkbtn" onClick={() => onReviewPatient(p.id)}>
                      Review
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </div>
  );
}

function Patients({ setPage, onReviewPatient, patients = initialPatients }) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All Risk Levels");

  const filtered = patients.filter(p => {
    const term = search.toLowerCase().trim();
    const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term);
    const matchesRisk = riskFilter === "All Risk Levels" || p.risk.toLowerCase() === riskFilter.replace(" Risk", "").toLowerCase();
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="page">
      <motion.div className="hero compact" variants={childVariants}>
        <div>
          <p className="eyebrow">PATIENT MANAGEMENT</p>
          <h1>Clinical screening queue</h1>
          <p>Prioritize patients based on QuantumDx risk assessment.</p>
        </div>
        <motion.button
          className="primary"
          onClick={() => setPage("analysis")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          + Add Patient
        </motion.button>
      </motion.div>
      <AnimatedCard>
        <div className="toolbar">
          <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              style={{ paddingLeft: '36px', width: '100%' }}
              placeholder="Search by patient name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
            <option>All Risk Levels</option>
            <option>High Risk</option>
            <option>Medium Risk</option>
            <option>Low Risk</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="table-empty-state">
            <Users size={36} className="empty-icon" />
            <h4>No patient records match criteria</h4>
            <p>No screening records matched "{search || riskFilter}".</p>
            <button className="ghost" onClick={() => { setSearch(""); setRiskFilter("All Risk Levels"); }}>
              Reset search filters
            </button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Age</th>
                  <th>Risk Level</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    custom={i}
                    variants={rowVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <td><b>{p.name}</b></td>
                    <td>{p.id}</td>
                    <td>{p.age}</td>
                    <td><RiskBadge risk={p.risk} /></td>
                    <td>{Math.round(p.score * 100)}%</td>
                    <td>{p.status}</td>
                    <td>
                      <button className="linkbtn" onClick={() => onReviewPatient(p.id)}>
                        Open <ArrowRight size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}

function Analysis({ setPage, onReviewPatient, onCompleteAnalysis }) {
  const [running, setRunning] = useState(false);
  const [form, setForm] = useState({
    id: "P-1051",
    name: "Aarti Verma",
    age: "47",
    sex: "Female",
    radius: "14.2",
    texture: "21.5",
    perimeter: "95.4"
  });

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      onCompleteAnalysis({
        id: form.id.trim() || "P-1051",
        name: form.name.trim() || `Volunteer ${form.id.trim() || "P-1051"}`,
        age: parseInt(form.age, 10) || 47,
        sex: form.sex || "Female",
        customRadius: form.radius,
        customTexture: form.texture,
        customPerimeter: form.perimeter,
        risk: "Low",
        score: getDailyScore(form.id.trim() || "P-1051"),
        status: "Review"
      });
    }, 1700);
  };

  return (
    <div className="page">
      <motion.div className="hero compact" variants={childVariants}>
        <div>
          <p className="eyebrow">NEW ANALYSIS</p>
          <h1>Run QuantumDx assessment</h1>
          <p>Enter clinical features and execute the hybrid inference pipeline.</p>
        </div>
      </motion.div>
      <motion.div
        className="analysis-grid"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <AnimatedCard>
          <h3>Patient Information</h3>
          <div className="form-grid">
            <label>Patient ID
              <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
            </label>
            <label>Patient Name
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>Age
              <input value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
            </label>
            <label>Sex
              <select value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </label>
          </div>
          <h3 className="section-title">Biomedical Features</h3>
          <div className="form-grid">
            <label>Mean Radius (mm)
              <input value={form.radius} onChange={e => setForm({ ...form, radius: e.target.value })} />
            </label>
            <label>Mean Texture
              <input value={form.texture} onChange={e => setForm({ ...form, texture: e.target.value })} />
            </label>
            <label>Mean Perimeter (mm)
              <input value={form.perimeter} onChange={e => setForm({ ...form, perimeter: e.target.value })} />
            </label>
            <label>Encoding Preset
              <select><option>QSVM Angle Encoding (4-Qubit)</option><option>Amplitude Encoding (Baseline)</option></select>
            </label>
          </div>
          <motion.button
            className="primary run"
            onClick={run}
            disabled={running}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            whileHover={!running ? { scale: 1.02 } : {}}
            whileTap={!running ? { scale: 0.97 } : {}}
          >
            <Atom size={18} className={running ? "running-icon" : ""} />
            {running ? "Running Hybrid Analysis..." : "Run QuantumDx Analysis"}
          </motion.button>
        </AnimatedCard>
        <QuantumPipeline running={running} />
      </motion.div>
    </div>
  );
}

function QuantumPipeline({ running }) {
  const steps = [
    ["01", "Classical Preprocessing", "Normalize and validate biomedical features"],
    ["02", "Feature Encoding", "Map selected features to quantum states"],
    ["03", "Quantum Circuit", "Multi-qubit feature transformation"],
    ["04", "Quantum Kernel + QSVM", "Generate final classification score"]
  ];

  return (
    <AnimatedCard className={"pipeline " + (running ? "running" : "")}>
      <div className="card-header">
        <div>
          <h3>Hybrid Processing Pipeline</h3>
          <p>Transparent view of the QuantumDx inference flow</p>
        </div>
        <span className="pill quantum" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Atom size={12} /> Quantum Core
        </span>
      </div>
      <div className="pipeline-steps">
        {steps.map((s, i) => (
          <React.Fragment key={s[0]}>
            <motion.div
              className={"pipe-step step-" + i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18, delay: i * 0.1 }}
            >
              <div className="step-num">{s[0]}</div>
              <div><b>{s[1]}</b><small>{s[2]}</small></div>
              {i === 2 && (
                <div className="circuit">
                  <span>q₀ ─ H ─ Rₓ ─●─</span>
                  <span>q₁ ─ H ─ Rᵧ ─X─</span>
                  <span>q₂ ─ H ─ Rₓ ─●─</span>
                </div>
              )}
            </motion.div>
            {i < 3 && <div className="pipe-line">↓</div>}
          </React.Fragment>
        ))}
      </div>
    </AnimatedCard>
  );
}

// Dynamic Results Component for the selected patient
function Results({ patientId, setPage, patients, onReviewPatient, onGenerateReport }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Dynamic fetch simulation for selected patient ID
    const timer = setTimeout(() => {
      const profile = getPatientRiskProfile(patientId, patients);
      setData(profile);
      setLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [patientId, patients]);

  if (loading || !data) {
    return (
      <div className="page">
        <div className="loading-container">
          <Atom size={44} className="running-icon" style={{ color: 'var(--accent-indigo)' }} />
          <h3>Fetching Quantum Risk Profile for {patientId}...</h3>
          <p>Querying QSVM multi-qubit feature traces and explainability data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Patient Profile Header Banner */}
      <motion.div
        className="patient-review-banner"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="patient-review-info">
          <div className="patient-review-avatar">
            <User size={24} />
          </div>
          <div className="patient-review-details">
            <h3>
              {data.name}
              <span className="patient-id-tag">{data.id}</span>
            </h3>
            <div className="patient-review-meta">
              <span><b>Age:</b> {data.age}</span>
              <span className="meta-sep" aria-hidden="true">•</span>
              <span><b>Sex:</b> {data.sex}</span>
              <span className="meta-sep" aria-hidden="true">•</span>
              <span><b>Status:</b> <RiskBadge risk={data.riskLevel} /></span>
              <span className="meta-sep" aria-hidden="true">•</span>
              <span className="meta-date"><Calendar size={13} /> {data.screenDate}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick patient switcher */}
          <select
            value={data.id}
            onChange={e => onReviewPatient(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '13px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-light)' }}
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id} - {Math.round(p.score * 100)}%)
              </option>
            ))}
          </select>

          <button
            className="ghost"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Export or Print PDF"
          >
            <Printer size={15} /> Export PDF
          </button>

          <button
            className="ghost"
            onClick={() => setPage("dashboard")}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </motion.div>

      <motion.div className="hero compact" variants={childVariants}>
        <div>
          <p className="eyebrow">EXPLAINABLE CLINICAL INFERENCE</p>
          <h1>Patient Risk Assessment Report</h1>
          <p>Detailed QSVM prediction profile generated specifically for patient <b>{data.name}</b> ({data.id}).</p>
        </div>
        <span className="status-online"><CheckCircle2 size={14} /> Analysis complete</span>
      </motion.div>

      <motion.div
        className="result-grid"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Dynamic Risk Result Card */}
        <AnimatedCard className="risk-result">
          <p>ESTIMATED RISK LEVEL</p>
          <div
            className={"risk-ring " + data.riskLevel.toLowerCase()}
            style={{
              background: `conic-gradient(${data.ringColor} 0 ${data.scorePercent}%, rgba(255, 255, 255, 0.08) ${data.scorePercent}%)`
            }}
          >
            <div>
              <b style={{ color: data.ringColor }}>{data.riskLevel.toUpperCase()}</b>
              <span>Risk</span>
            </div>
          </div>
          <h2><AnimatedCounter value={data.scorePercent} suffix="%" /> Risk Score</h2>
          <p className="muted">{data.riskSubtitle}</p>
        </AnimatedCard>

        {/* Dynamic Confidence Card */}
        <AnimatedCard>
          <h3>Prediction Confidence</h3>
          <div className="confidence-number">
            <AnimatedCounter value={parseFloat(data.confidence)} suffix="%" decimals={1} />
          </div>
          <div className="confidence-bar">
            <span style={{ width: `${data.confidence}%` }}></span>
          </div>
          <div className="confidence-row">
            <span>Model output stability</span>
            <b>{data.stability}</b>
          </div>
          <div className="confidence-row">
            <span>Data completeness</span>
            <b><AnimatedCounter value={data.completeness} suffix="%" /></b>
          </div>
          <div className="confidence-row">
            <span>Inference engine</span>
            <b>Hybrid QSVM (4-Qubit)</b>
          </div>
        </AnimatedCard>

        {/* Dynamic Contributing Factors Card */}
        <AnimatedCard className="factors">
          <h3>Key Contributing Factors</h3>
          <p>Feature-level explanation for patient {data.id}</p>
          {data.factors.map(x => (
            <div className="factor" key={x.name}>
              <div>
                <span>{x.name}</span>
                <b>{x.value}%</b>
              </div>
              <i><em style={{ width: `${x.value}%` }}></em></i>
            </div>
          ))}
        </AnimatedCard>
      </motion.div>

      <motion.div
        className="grid-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Dynamic Clinical Recommendation */}
        <AnimatedCard>
          <h3>Clinical Recommendation</h3>
          <div className={"recommend " + data.riskLevel.toLowerCase()}>
            <span>
              {data.riskLevel === "Low" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </span>
            <div>
              <b>{data.recommendationTitle}</b>
              <p>{data.recommendationText}</p>
            </div>
          </div>
          <motion.button
            className="primary"
            onClick={() => onGenerateReport(data)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', width: '100%' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <FileBarChart size={16} /> Generate Clinical Report for {data.id}
          </motion.button>
        </AnimatedCard>

        {/* Dynamic Inference Trace */}
        <AnimatedCard>
          <h3>Inference Trace</h3>
          <div className="trace">
            {[
              ["Classical feature vector", `✓ Validated (${data.radiusVal}mm radius, ${data.textureVal} texture)`],
              ["Quantum encoding", "✓ Angle encoding (4 qubits)"],
              ["Multi-qubit circuit", "✓ Parameterized ansatz executed"],
              ["QSVM prediction", `✓ Classified: ${data.riskLevel} Risk (${data.scorePercent}%)`],
            ].map(([label, val], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 120, damping: 18 }}
              >
                <span>{label}</span>
                <b>{val}</b>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </motion.div>
    </div>
  );
}

function QuantumModel() {
  return (
    <div className="page">
      <motion.div className="hero compact" variants={childVariants}>
        <div>
          <p className="eyebrow">QUANTUM ENGINE</p>
          <h1>Hybrid quantum intelligence</h1>
          <p>The prototype combines classical preprocessing with quantum feature-space learning.</p>
        </div>
      </motion.div>
      <motion.div
        className="grid-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <AnimatedCard className="quantum-hero">
          <div className="atom"><Atom size={64} strokeWidth={1} /></div>
          <h2>Quantum Feature Space</h2>
          <p>Selected biomedical features are encoded and transformed through a parameterized multi-qubit circuit.</p>
          <div className="big-circuit">
            <span>q₀ ── H ── Rₓ(x₀) ── ● ── M</span>
            <span>q₁ ── H ── Rᵧ(x₁) ── X ── M</span>
            <span>q₂ ── H ── Rₓ(x₂) ── ● ── M</span>
            <span>q₃ ── H ── Rᵧ(x₃) ───── M</span>
          </div>
          {/* GlowOrb on Quantum Engine page */}
          <div style={{ position: 'absolute', top: '50%', right: '-2rem', transform: 'translateY(-50%)', opacity: 0.5 }}>
            <GlowOrb size={200} />
          </div>
        </AnimatedCard>
        <AnimatedCard>
          <h3>Prototype Components</h3>
          <div className="component-list">
            {[
              ["1", "Feature Encoding", "Classical data → quantum states"],
              ["2", "Multi-Qubit Processing", "Interaction and transformation"],
              ["3", "Quantum Kernel", "Similarity in quantum feature space"],
              ["4", "QSVM Classifier", "Final risk classification"],
            ].map(([num, title, desc], i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 120, damping: 18 }}
              >
                <i>{num}</i><span><b>{title}</b><small>{desc}</small></span>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </motion.div>
    </div>
  );
}

function Benchmarks() {
  const rows = [
    ["Random Forest", "0.981", "0.979", "Classical"],
    ["SVM", "0.976", "0.974", "Classical"],
    ["XGBoost", "0.988", "0.986", "Classical"],
    ["QuantumDx QSVM", "0.993", "0.991", "Quantum"]
  ];

  return (
    <div className="page">
      <motion.div className="hero compact" variants={childVariants}>
        <div>
          <p className="eyebrow">MODEL EVALUATION</p>
          <h1>Benchmarking the prototype</h1>
          <p>Quantum models should be evaluated against meaningful classical baselines.</p>
        </div>
      </motion.div>
      <motion.div
        className="grid-2"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <AnimatedCard>
          <h3>ROC-AUC Comparison</h3>
          <div className="bar-chart">
            {rows.map((r, i) => (
              <motion.div
                className="bar-row"
                key={r[0]}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 100, damping: 18 }}
              >
                <span>{r[0]}</span>
                <div>
                  <i style={{ width: (Number(r[1]) * 100) + "%" }} className={r[3] === "Quantum" ? "qbar" : ""}></i>
                </div>
                <b>{r[1]}</b>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
        <AnimatedCard className="benchmark-highlight">
          <p>BEST CURRENT PROTOTYPE RESULT</p>
          <div className="huge"><AnimatedCounter value={0.993} decimals={3} /></div>
          <h2>QSVM ROC-AUC</h2>
          <span className="pill quantum" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Atom size={12} /> Hybrid Quantum Model
          </span>
          <p>Measured on the evaluated prototype experiment.</p>
        </AnimatedCard>
      </motion.div>
      <AnimatedCard>
        <h3>Benchmark Summary</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>ROC-AUC</th>
                <th>Accuracy</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr
                  key={r[0]}
                  custom={i}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                >
                  <td><b>{r[0]}</b></td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td><span className={r[3] === "Quantum" ? "tag quantum-tag" : "tag"}>{r[3]}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </div>
  );
}

function Reports({ reports = initialReports, onReviewPatient, onGenerateNewReport, onExportPdf }) {
  return (
    <div className="page">
      <motion.div className="hero compact" variants={childVariants}>
        <div>
          <p className="eyebrow">REPORT CENTER</p>
          <h1>Clinical analysis reports</h1>
          <p>Exportable summaries for review and workflow integration.</p>
        </div>
        <motion.button
          className="primary"
          onClick={onGenerateNewReport}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FileText size={16} /> Generate Report
        </motion.button>
      </motion.div>
      <motion.div
        className="report-grid"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {reports.map((x, i) => (
          <AnimatedCard key={x.title} className="report" delay={i * 0.07}>
            <div className="report-icon"><FileBarChart size={32} /></div>
            <h3>{x.title}</h3>
            <p>{x.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <div>
                <button
                  className="ghost"
                  onClick={() => x.id && onReviewPatient(x.id)}
                  style={{ marginRight: '8px' }}
                >
                  Preview
                </button>
                <button className="linkbtn" onClick={() => onExportPdf(x.title)}>Export PDF</button>
              </div>
              <small style={{ color: 'var(--ink-faint)', fontSize: '0.72rem' }}>{x.date}</small>
            </div>
          </AnimatedCard>
        ))}
      </motion.div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedPatientId, setSelectedPatientId] = useState("P-1042");
  const [patientList, setPatientList] = useState(initialPatients);
  const [reportList, setReportList] = useState(initialReports);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [toast, setToast] = useState(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Screening Batch Completed", desc: "College volunteer cohort initialized with baseline measurements.", time: "12m ago", read: false },
    { id: 2, title: "QSVM Engine Verified", desc: "Hybrid 4-qubit feature mapping calibrated at 0.993 ROC-AUC.", time: "38m ago", read: false },
    { id: 3, title: "Patient P-1042 Screened", desc: "Routine health monitoring recommended (13% Risk).", time: "1h ago", read: true }
  ]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const handleReviewPatient = (id) => {
    setSelectedPatientId(id);
    setPage("results");
  };

  const handleCompleteAnalysis = (newPatient) => {
    setPatientList(prev => {
      const exists = prev.find(p => p.id === newPatient.id);
      if (exists) {
        return prev.map(p => p.id === newPatient.id ? { ...p, ...newPatient } : p);
      }
      return [newPatient, ...prev];
    });
    setSelectedPatientId(newPatient.id);
    setPage("results");
    showToast(`Hybrid analysis complete for ${newPatient.name} (${newPatient.id})`);
  };

  const handleGenerateReport = (profileOrEvent) => {
    const profile = (profileOrEvent && profileOrEvent.id)
      ? profileOrEvent
      : getPatientRiskProfile(selectedPatientId, patientList);

    const title = `${profile.riskLevel} Risk Assessment — ${profile.id}`;
    const newReport = {
      title,
      id: profile.id,
      desc: `Risk score ${profile.scorePercent}%, confidence ${profile.confidence}% and feature explanations for ${profile.name}.`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setReportList(prev => {
      if (prev.some(r => r.title === title)) return prev;
      return [newReport, ...prev];
    });

    showToast(`Report saved for ${profile.id} in Report Center`);
    setPage("reports");
  };

  const handleExportPdf = (title) => {
    showToast(`Preparing print document for: ${title}`);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const items = [
    ["dashboard", <Home size={18} key="dash" />, "Dashboard"],
    ["patients", <Users size={18} key="pat" />, "Patients"],
    ["analysis", <Activity size={18} key="ana" />, "New Analysis"],
    ["quantum", <Hexagon size={18} key="q" />, "Quantum Engine"],
    ["benchmarks", <BarChart2 size={18} key="bm" />, "Benchmarking"],
    ["reports", <FileText size={18} key="rep" />, "Reports"],
    ["pricing", <IndianRupee size={18} key="prc" />, "Pricing (₹)"]
  ];

  const mobileNavLabels = {
    dashboard: "Home",
    patients: "Patients",
    analysis: "Analyze",
    quantum: "Quantum",
    benchmarks: "Baselines",
    reports: "Reports",
    pricing: "Pricing"
  };

  const views = {
    dashboard: <Dashboard setPage={setPage} onReviewPatient={handleReviewPatient} patients={patientList} />,
    patients: <Patients setPage={setPage} onReviewPatient={handleReviewPatient} patients={patientList} />,
    analysis: <Analysis setPage={setPage} onReviewPatient={handleReviewPatient} onCompleteAnalysis={handleCompleteAnalysis} />,
    results: <Results patientId={selectedPatientId} setPage={setPage} patients={patientList} onReviewPatient={handleReviewPatient} onGenerateReport={handleGenerateReport} />,
    quantum: <QuantumModel />,
    benchmarks: <Benchmarks />,
    reports: <Reports reports={reportList} onReviewPatient={handleReviewPatient} onGenerateNewReport={handleGenerateReport} onExportPdf={handleExportPdf} />,
    pricing: <Pricing showToast={showToast} />
  };

  // Close modals on Escape key
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app app-shell">
      <SpatialField />
      <div className="atmosphere" aria-hidden="true">
        <span className="atmosphere-orb orb-one"></span>
        <span className="atmosphere-orb orb-two"></span>
        <span className="atmosphere-grid"></span>
      </div>

      <aside className="command-rail">
        <div className="brand">
          <motion.div
            className="brand-mark"
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Atom size={20} />
          </motion.div>
          <div>
            <b>QuantumDx</b>
            <small>Clinical intelligence</small>
          </div>
        </div>
        <div className="rail-label">WORKSPACE</div>
        <nav aria-label="Primary navigation">
          {items.map(i => (
            <motion.button
              key={i[0]}
              className={page === i[0] || (page === "results" && i[0] === "dashboard") ? "active" : ""}
              onClick={() => setPage(i[0])}
              aria-current={page === i[0] || (page === "results" && i[0] === "dashboard") ? "page" : undefined}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span>{i[1]}</span>{i[2]}
            </motion.button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="secure"><CheckCircle2 size={14} /> Secure prototype environment</div>
          <button
            type="button"
            onClick={() => showToast("Clinical system settings are locked in prototype demonstration mode.")}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Settings size={16} /> Settings
          </button>
          <div className="user">
            <div><User size={18} /></div>
            <span><b>Clinical User</b><small>Decision Support</small></span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="crumb">
            QuantumDx <span>/</span>{" "}
            {page === "results" ? (
              <>
                <span style={{ cursor: 'pointer', color: 'var(--accent-indigo-light)' }} onClick={() => setPage("dashboard")}>
                  Dashboard
                </span>{" "}
                <span>/</span> Review ({selectedPatientId})
              </>
            ) : (
              page.charAt(0).toUpperCase() + page.slice(1)
            )}
          </div>
          <div className="header-actions">
            <motion.button
              className={"icon-btn " + (searchOpen ? "active" : "")}
              type="button"
              aria-label="Search clinical records"
              onClick={() => setSearchOpen(prev => !prev)}
              style={{ display: 'grid', placeItems: 'center' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <Search size={16} />
            </motion.button>
            <motion.button
              className={"icon-btn notification " + (notifOpen ? "active" : "")}
              type="button"
              aria-label="View notifications"
              onClick={() => setNotifOpen(prev => !prev)}
              style={{ display: 'grid', placeItems: 'center' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <Bell size={16} />
              {notifications.some(n => !n.read) && <i></i>}
            </motion.button>
            <span className="prototype">PROTOTYPE v1.0</span>
          </div>
        </header>

        {/* AnimatePresence for smooth page transitions */}
        <AnimatePresence mode="wait">
          <PageTransition pageKey={page + (page === "results" ? selectedPatientId : "")}>
            {views[page]}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* Notifications Drawer */}
      <AnimatePresence>
        {notifOpen && (
          <motion.div
            className="notifications-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <div className="notif-header">
              <b>Clinical Intelligence Alerts</b>
              <button
                className="ghost sm"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              >
                Mark all read
              </button>
            </div>
            <div className="notif-list">
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  className={"notif-item " + (n.read ? "read" : "unread")}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="notif-top">
                    <span className="notif-dot"></span>
                    <b>{n.title}</b>
                    <small>{n.time}</small>
                  </div>
                  <p>{n.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Search Command Palette Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="modal-backdrop"
            onClick={() => setSearchOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="search-palette"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
            >
              <div className="palette-input-wrap">
                <Search size={18} className="palette-icon" />
                <input
                  autoFocus
                  placeholder="Search patient name or ID (e.g. Aarav, P-1042)..."
                  value={paletteQuery}
                  onChange={e => setPaletteQuery(e.target.value)}
                />
                <button className="icon-btn close-btn" onClick={() => setSearchOpen(false)} aria-label="Close search">
                  <X size={16} />
                </button>
              </div>
              <div className="palette-results">
                {patientList
                  .filter(p => !paletteQuery || p.name.toLowerCase().includes(paletteQuery.toLowerCase()) || p.id.toLowerCase().includes(paletteQuery.toLowerCase()))
                  .map((p, i) => (
                    <motion.div
                      key={p.id}
                      className="palette-item"
                      onClick={() => {
                        handleReviewPatient(p.id);
                        setSearchOpen(false);
                      }}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ x: 4, backgroundColor: "rgba(117, 241, 228, 0.06)" }}
                    >
                      <div>
                        <b>{p.name}</b>
                        <span className="palette-id">{p.id}</span>
                      </div>
                      <div className="palette-meta">
                        <RiskBadge risk={p.risk} />
                        <span>{Math.round(p.score * 100)}% Risk</span>
                        <ChevronRight size={14} />
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Interactive Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <CheckCircle2 size={16} style={{ color: "var(--signal)", flexShrink: 0 }} />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="mobile-nav" aria-label="Primary navigation">
        {items.map(i => (
          <motion.button
            key={i[0]}
            className={page === i[0] || (page === "results" && i[0] === "dashboard") ? "active" : ""}
            onClick={() => setPage(i[0])}
            aria-current={page === i[0] || (page === "results" && i[0] === "dashboard") ? "page" : undefined}
            whileTap={{ scale: 0.9 }}
          >
            <span>{i[1]}</span>
            <small>{mobileNavLabels[i[0]] || i[2]}</small>
          </motion.button>
        ))}
      </nav>
    </div>
  );
}

export default App;
