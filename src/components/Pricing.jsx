import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IndianRupee,
  Check,
  Zap,
  ShieldCheck,
  Calculator,
  Download,
  Percent,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Building2,
  Tag,
  RotateCcw,
  ArrowRight,
  Printer,
  X,
  FileText
} from "lucide-react";
import AnimatedCard from "./AnimatedCard";
import { childVariants, staggerContainer } from "./PageTransition";

export const formatINR = (val) => {
  if (typeof val !== "number") return val;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(val);
};

export const formatLakhsCrores = (val) => {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakhs`;
  }
  return formatINR(val);
};

const PLANS = [
  {
    id: "academic",
    name: "Academic & Community",
    target: "Medical colleges, public screening camps & research labs",
    monthlyPrice: 3999,
    annualMonthlyPrice: 3199,
    screenings: "150 patients / mo",
    seats: "1 Workstation",
    qEngine: "4-Qubit Classical Simulation",
    badge: null,
    features: [
      "Up to 150 AI screenings per month",
      "4-qubit simulated quantum kernel (ROC-AUC 0.993)",
      "Standard PDF clinical assessment reports",
      "Single-department terminal access",
      "ABDM digital health card ready (M1 compliance)",
      "Standard email support (48h turnaround)"
    ]
  },
  {
    id: "pro",
    name: "Diagnostic & Multi-Specialty",
    target: "Pathology labs, cardiology centers & private hospitals",
    monthlyPrice: 14999,
    annualMonthlyPrice: 11999,
    screenings: "2,500 patients / mo",
    seats: "Up to 15 Clinicians",
    qEngine: "Dual-Phase Hybrid QSVM Classifier",
    badge: "MOST POPULAR IN INDIA",
    popular: true,
    features: [
      "Up to 2,500 patient screenings per month",
      "Dual-phase Hybrid QSVM + Classical Ensemble",
      "Instant EHR / FHIR-compliant PDF generation with hospital branding",
      "Multi-user clinic access (up to 15 doctors & staff)",
      "Batch CSV screening upload & automated risk grading",
      "Explainable AI with SHAP biomarker importance vectors",
      "Priority clinical tech support (4h response SLA)",
      "ABDM M1 & M2 integration support"
    ]
  },
  {
    id: "enterprise",
    name: "Hospital Network & Health System",
    target: "Tertiary hospital chains, state screening programs & consortia",
    monthlyPrice: 49999,
    annualMonthlyPrice: 39999,
    screenings: "Unlimited patients",
    seats: "Unlimited Clinicians",
    qEngine: "Dedicated QPU Cloud Slot (IBM Quantum / IonQ)",
    badge: "ENTERPRISE GRADE",
    features: [
      "Unlimited patient screenings across all departments",
      "Dedicated hardware QPU execution slots via IBM Quantum / Braket",
      "On-premise or sovereign Indian cloud deployment (DPDP Act 2023)",
      "Full PACS, LIMS & ABDM M1/M2/M3 ecosystem integration",
      "Unlimited clinician accounts with role-based access control",
      "Custom clinical biomarker weights & retrospective re-training",
      "Dedicated Clinical AI Solution Architect & 99.95% uptime SLA",
      "On-site doctor onboarding & clinical protocol calibration"
    ]
  }
];

const ADDONS = [
  { id: 100, name: "100 Screening Credits", price: 1999, perTest: "₹19.99/test" },
  { id: 500, name: "500 Screening Credits", price: 7999, perTest: "₹15.99/test", popular: true },
  { id: 2500, name: "2,500 Screening Credits", price: 24999, perTest: "₹9.99/test" }
];

export default function Pricing({ showToast = () => {}, onSwitchToReports }) {
  const [billingCycle, setBillingCycle] = useState("annual"); // "monthly" | "annual"
  const [selectedPlanId, setSelectedPlanId] = useState("pro");
  const [selectedAddonId, setSelectedAddonId] = useState(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [institutionName, setInstitutionName] = useState("Apollo Diagnostic Center & Research Institute");
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [activeCreditBalance, setActiveCreditBalance] = useState(2500);

  // ROI Calculator state
  const [calcPatients, setCalcPatients] = useState(1500);
  const [calcCostPerTest, setCalcCostPerTest] = useState(1200); // in Rs
  const [calcEfficiency, setCalcEfficiency] = useState(65); // in %

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
  const selectedAddon = ADDONS.find((a) => a.id === selectedAddonId);

  // Calculations in INR
  const planBaseMonthly = billingCycle === "annual" ? selectedPlan.annualMonthlyPrice : selectedPlan.monthlyPrice;
  const planBilledDuration = billingCycle === "annual" ? 12 : 1;
  const baseSubtotal = planBaseMonthly * planBilledDuration;
  const addonTotal = selectedAddon ? selectedAddon.price : 0;
  const rawSubtotal = baseSubtotal + addonTotal;
  const discountAmount = Math.round(rawSubtotal * (appliedDiscount / 100));
  const netSubtotal = rawSubtotal - discountAmount;
  const gstAmount = Math.round(netSubtotal * 0.18); // 18% GST (Healthcare IT SAC 998313)
  const grandTotal = netSubtotal + gstAmount;

  // ROI Calculations in INR
  const monthlyLabSpend = calcPatients * calcCostPerTest;
  const monthlyQuantumCost = billingCycle === "annual" ? selectedPlan.annualMonthlyPrice : selectedPlan.monthlyPrice;
  const monthlySavings = Math.round(monthlyLabSpend * (calcEfficiency / 100) - monthlyQuantumCost);
  const annualSavings = monthlySavings * 12;
  const hoursSavedPerMonth = Math.round(calcPatients * 0.45 * (calcEfficiency / 100));
  const effectiveCostPerTest = (monthlyQuantumCost / calcPatients).toFixed(2);
  const netRoi = Math.max(120, Math.round(((monthlySavings * 12) / (monthlyQuantumCost * 12)) * 100));

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "HEALTHCARE10" || code === "AIIMS10") {
      setAppliedDiscount(10);
      showToast("Voucher code applied: 10% Institutional Discount in Rs.");
    } else if (code === "QUANTUM20" || code === "DEMO20") {
      setAppliedDiscount(20);
      showToast("Voucher code applied: 20% Early Partner Discount in Rs.");
    } else {
      showToast("Invalid promo code. Try HEALTHCARE10 or QUANTUM20.");
    }
  };

  const handleSelectPlan = (planId) => {
    setSelectedPlanId(planId);
    const plan = PLANS.find((p) => p.id === planId);
    showToast(`Selected ${plan.name} plan`);
  };

  const handleTopupCredits = (addon) => {
    setActiveCreditBalance((prev) => prev + addon.id);
    setSelectedAddonId(addon.id === selectedAddonId ? null : addon.id);
    showToast(`Added ${addon.name} to order (+${addon.id} patient tests).`);
  };

  const handlePrintQuotation = () => {
    showToast("Preparing official Pro-Forma Invoice in Indian Rupees...");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="page pricing-page">
      {/* Top Hero Section */}
      <motion.div className="hero compact pricing-hero" variants={childVariants}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span className="eyebrow" style={{ color: "#10B981" }}>COMMERCIAL INTELLIGENCE • INDIA (INR / ₹)</span>
            <span className="pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
              GST (18%) Compliant
            </span>
          </div>
          <h1>Clinical Tier Pricing & ROI Calculator</h1>
          <p>
            Predictable institutional tariffs in Indian Rupees (₹) for diagnostic centers, multi-specialty hospitals, and academic medical centers.
          </p>
        </div>

        <div className="pricing-top-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <motion.button
            className="primary"
            onClick={() => setQuotationModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #10B981, #059669)", borderColor: "#10B981" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download size={16} /> Download Quotation (₹)
          </motion.button>
        </div>
      </motion.div>

      {/* Interactive Billing Cycle Toggle & Currency Badge */}
      <motion.div
        className="pricing-cycle-bar"
        variants={childVariants}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          padding: "16px 20px",
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", width: "36px", height: "36px", borderRadius: "10px", display: "grid", placeItems: "center", color: "#10B981" }}>
            <IndianRupee size={20} />
          </div>
          <div>
            <b style={{ color: "#FFFFFF", fontSize: "14px" }}>Billing Currency: Indian Rupee (INR / ₹)</b>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
              Active Demo Screening Pool: <span style={{ color: "#10B981", fontWeight: 700 }}>{activeCreditBalance.toLocaleString("en-IN")} screenings</span> available
            </p>
          </div>
        </div>

        {/* Monthly vs Annual Toggle */}
        <div className="billing-cycle-switcher" style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(30, 41, 59, 0.7)", padding: "4px", borderRadius: "30px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <button
            className={`cycle-btn ${billingCycle === "monthly" ? "active" : ""}`}
            onClick={() => setBillingCycle("monthly")}
            style={{
              background: billingCycle === "monthly" ? "#10B981" : "transparent",
              color: billingCycle === "monthly" ? "#061A14" : "var(--text-secondary)",
              fontWeight: 600,
              padding: "6px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Monthly Billing
          </button>
          <button
            className={`cycle-btn ${billingCycle === "annual" ? "active" : ""}`}
            onClick={() => setBillingCycle("annual")}
            style={{
              background: billingCycle === "annual" ? "linear-gradient(135deg, #10B981, #059669)" : "transparent",
              color: billingCycle === "annual" ? "#FFFFFF" : "var(--text-secondary)",
              fontWeight: 600,
              padding: "6px 18px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            <span>Annual (20% OFF)</span>
            <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.25)", padding: "2px 6px", borderRadius: "10px" }}>Save ₹{billingCycle === "annual" ? ((selectedPlan.monthlyPrice - selectedPlan.annualMonthlyPrice) * 12).toLocaleString("en-IN") : "20%"}</span>
          </button>
        </div>
      </motion.div>

      {/* Pricing Cards Grid */}
      <motion.div
        className="pricing-cards-grid"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "28px",
          paddingTop: "20px",
          marginBottom: "32px"
        }}
      >
        {PLANS.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          const displayPrice = billingCycle === "annual" ? plan.annualMonthlyPrice : plan.monthlyPrice;
          const annualTotal = plan.annualMonthlyPrice * 12;

          return (
            <AnimatedCard
              key={plan.id}
              className={`pricing-card ${isSelected ? "selected-plan" : ""} ${plan.popular ? "popular-plan" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "visible",
                border: isSelected
                  ? "2px solid #10B981"
                  : plan.popular
                  ? "1px solid rgba(16, 185, 129, 0.45)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: isSelected
                  ? "0 0 30px rgba(16, 185, 129, 0.22)"
                  : plan.popular
                  ? "0 0 20px rgba(16, 185, 129, 0.1)"
                  : "none",
                background: isSelected
                  ? "linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)"
                  : "rgba(15, 23, 42, 0.5)",
                borderRadius: "16px",
                padding: "26px"
              }}
            >
              {plan.badge && (
                <div
                  className="pricing-badge"
                  style={{
                    position: "absolute",
                    top: "-14px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    padding: "5px 16px",
                    borderRadius: "20px",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.45)",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    lineHeight: "1.2"
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "19px", color: "#FFFFFF" }}>{plan.name}</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)", minHeight: "36px" }}>
                  {plan.target}
                </p>
              </div>

              {/* Price Tag in Rs */}
              <div
                style={{
                  padding: "18px",
                  background: "rgba(0, 0, 0, 0.25)",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "16px", color: "#10B981", fontWeight: 700 }}>₹</span>
                  <b style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                    {displayPrice.toLocaleString("en-IN")}
                  </b>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>/ month</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "11.5px", color: "var(--text-muted)" }}>
                  <span>
                    {billingCycle === "annual"
                      ? `Billed annually at ₹${annualTotal.toLocaleString("en-IN")}`
                      : `Billed monthly (GST 18% extra)`}
                  </span>
                  {billingCycle === "annual" && (
                    <span style={{ color: "#10B981", fontWeight: 600 }}>Save 20%</span>
                  )}
                </div>
              </div>

              {/* Specs Pills */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "8px 10px", borderRadius: "8px" }}>
                  <small style={{ display: "block", color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase" }}>Volume Capacity</small>
                  <b style={{ fontSize: "12px", color: "#FFFFFF" }}>{plan.screenings}</b>
                </div>
                <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "8px 10px", borderRadius: "8px" }}>
                  <small style={{ display: "block", color: "var(--text-muted)", fontSize: "10px", textTransform: "uppercase" }}>Clinician Seats</small>
                  <b style={{ fontSize: "12px", color: "#FFFFFF" }}>{plan.seats}</b>
                </div>
              </div>

              {/* Features List */}
              <div style={{ flex: 1, marginBottom: "24px" }}>
                <span style={{ display: "block", fontSize: "11px", textTransform: "uppercase", color: "#10B981", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "12px" }}>
                  Included Capabilities
                </span>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.features.map((feat, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      <span style={{ color: "#10B981", flexShrink: 0, marginTop: "2px" }}>
                        <Check size={14} />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Select Plan Button */}
              <motion.button
                type="button"
                className={isSelected ? "primary" : "ghost"}
                onClick={() => handleSelectPlan(plan.id)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "14px",
                  background: isSelected
                    ? "linear-gradient(135deg, #10B981, #059669)"
                    : plan.popular
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(255, 255, 255, 0.05)",
                  color: isSelected ? "#FFFFFF" : plan.popular ? "#10B981" : "#FFFFFF",
                  borderColor: isSelected ? "#10B981" : plan.popular ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.15)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 size={16} /> Active Plan Selected
                  </>
                ) : (
                  <>
                    Select {plan.name.split(" ")[0]} Plan <ArrowRight size={14} />
                  </>
                )}
              </motion.button>
            </AnimatedCard>
          );
        })}
      </motion.div>

      {/* Middle Row: Live Commercial Order Breakdown & Add-on Tokens */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {/* Screening Add-on Credits */}
        <AnimatedCard style={{ padding: "24px" }}>
          <div className="card-header" style={{ marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "17px", color: "#FFFFFF" }}>Screening Token Micro-Packs</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                Instant volume top-ups in Rs without changing your subscription tier.
              </p>
            </div>
            <span className="pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>No Expiry</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {ADDONS.map((addon) => {
              const isPicked = selectedAddonId === addon.id;
              return (
                <div
                  key={addon.id}
                  onClick={() => handleTopupCredits(addon)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderRadius: "10px",
                    background: isPicked ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.03)",
                    border: isPicked ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.08)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: isPicked ? "2px solid #10B981" : "2px solid rgba(255, 255, 255, 0.3)",
                        background: isPicked ? "#10B981" : "transparent",
                        display: "grid",
                        placeItems: "center",
                        color: "#061A14"
                      }}
                    >
                      {isPicked && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div>
                      <b style={{ color: "#FFFFFF", fontSize: "14px" }}>{addon.name}</b>
                      <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>{addon.perTest}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <b style={{ color: "#10B981", fontSize: "16px" }}>₹{addon.price.toLocaleString("en-IN")}</b>
                    <small style={{ display: "block", color: "var(--text-muted)", fontSize: "10px" }}>+18% GST</small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Institutional Voucher Promo Code */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <label style={{ display: "block", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Hospital Partner Voucher / Coupon:
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="text"
                  placeholder="e.g. HEALTHCARE10, AIIMS10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "13px"
                  }}
                />
              </div>
              <button
                type="button"
                className="ghost"
                onClick={handleApplyPromo}
                style={{ padding: "10px 16px", fontSize: "12px", color: "#10B981", borderColor: "rgba(16, 185, 129, 0.4)" }}
              >
                Apply (₹)
              </button>
            </div>
            {appliedDiscount > 0 && (
              <small style={{ display: "block", color: "#10B981", marginTop: "6px", fontSize: "11px" }}>
                ✓ {appliedDiscount}% Partner discount active on this quotation.
              </small>
            )}
          </div>
        </AnimatedCard>

        {/* Live Commercial Order Summary */}
        <AnimatedCard style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "17px", color: "#FFFFFF" }}>Commercial Order Summary</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
                  Institutional tax invoice breakdown with 18% GST (SAC 998313).
                </p>
              </div>
              <span className="pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>Live Quote</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>{selectedPlan.name} ({billingCycle === "annual" ? "12 Months" : "1 Month"}):</span>
                <b style={{ color: "#FFFFFF" }}>₹{baseSubtotal.toLocaleString("en-IN")}</b>
              </div>

              {selectedAddon && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                  <span>Screening Tokens ({selectedAddon.name}):</span>
                  <b style={{ color: "#FFFFFF" }}>₹{selectedAddon.price.toLocaleString("en-IN")}</b>
                </div>
              )}

              {appliedDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#10B981" }}>
                  <span>Institutional Discount ({appliedDiscount}%):</span>
                  <b>-₹{discountAmount.toLocaleString("en-IN")}</b>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", paddingTop: "8px", borderTop: "1px dashed rgba(255, 255, 255, 0.1)" }}>
                <span>Net Subtotal (Excl. Tax):</span>
                <b style={{ color: "#FFFFFF" }}>₹{netSubtotal.toLocaleString("en-IN")}</b>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>GST @ 18% (CGST 9% + SGST 9%):</span>
                <b style={{ color: "#FFFFFF" }}>₹{gstAmount.toLocaleString("en-IN")}</b>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.3)", marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <small style={{ color: "#10B981", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>Total Payable in INR</small>
                <h2 style={{ margin: "2px 0 0", color: "#FFFFFF", fontSize: "28px", fontWeight: 800 }}>
                  ₹{grandTotal.toLocaleString("en-IN")}
                </h2>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {billingCycle === "annual" ? "Per Year (All inclusive)" : "Per Month"}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <motion.button
              type="button"
              className="primary"
              onClick={() => {
                showToast(`Institutional license demonstration initialized for ${selectedPlan.name}.`);
              }}
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                borderColor: "#10B981",
                padding: "12px",
                fontSize: "13px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px"
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle2 size={15} /> Confirm Plan (₹)
            </motion.button>

            <motion.button
              type="button"
              className="ghost"
              onClick={() => setQuotationModalOpen(true)}
              style={{
                borderColor: "rgba(255, 255, 255, 0.2)",
                padding: "12px",
                fontSize: "13px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "6px"
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Printer size={15} /> Pro-Forma Invoice
            </motion.button>
          </div>
        </AnimatedCard>
      </div>

      {/* Interactive Hospital ROI & Economics Calculator (in Rs) */}
      <AnimatedCard style={{ padding: "26px", marginBottom: "32px" }}>
        <div className="card-header" style={{ marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Calculator size={18} style={{ color: "#10B981" }} />
              <h3 style={{ margin: 0, fontSize: "18px", color: "#FFFFFF" }}>Hospital Diagnostic ROI & Savings Calculator (in Rs)</h3>
            </div>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>
              Quantify financial savings and clinician efficiency gains by switching from conventional pathology batteries to QuantumDx hybrid screening.
            </p>
          </div>
          <span className="pill" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>Live Projection</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "28px", alignItems: "center" }}>
          {/* Sliders Input Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Slider 1: Monthly Patients */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Monthly Patients Screened:</span>
                <b style={{ color: "#10B981", fontSize: "15px" }}>{calcPatients.toLocaleString("en-IN")} patients/mo</b>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="50"
                value={calcPatients}
                onChange={(e) => setCalcPatients(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#10B981", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>100 (Camp/Clinic)</span>
                <span>5,000 (City Hospital)</span>
                <span>10,000 (Network)</span>
              </div>
            </div>

            {/* Slider 2: Conventional Cost per Test */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Current Diagnostic Lab Cost (in Rs):</span>
                <b style={{ color: "#10B981", fontSize: "15px" }}>₹{calcCostPerTest.toLocaleString("en-IN")} / test</b>
              </div>
              <input
                type="range"
                min="300"
                max="3500"
                step="50"
                value={calcCostPerTest}
                onChange={(e) => setCalcCostPerTest(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#10B981", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>₹300 (Basic Panel)</span>
                <span>₹1,500 (Standard Diagnostic)</span>
                <span>₹3,500 (Advanced Genomic/Cardiac)</span>
              </div>
            </div>

            {/* Slider 3: Efficiency Gain */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Turnaround Speed & Diagnostic Reduction:</span>
                <b style={{ color: "#10B981", fontSize: "15px" }}>{calcEfficiency}% faster screening</b>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                step="5"
                value={calcEfficiency}
                onChange={(e) => setCalcEfficiency(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#10B981", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>30% (Standard)</span>
                <span>65% (Recommended Hybrid)</span>
                <span>85% (Optimized Workflow)</span>
              </div>
            </div>
          </div>

          {/* Calculated Output Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.07)", padding: "18px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
              <small style={{ display: "block", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase" }}>
                Monthly Hospital Savings
              </small>
              <h3 style={{ margin: "6px 0 2px", color: "#10B981", fontSize: "24px", fontWeight: 800 }}>
                {formatLakhsCrores(monthlySavings)}
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                Saved per month in clinical operations
              </span>
            </div>

            <div style={{ background: "rgba(16, 185, 129, 0.07)", padding: "18px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
              <small style={{ display: "block", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase" }}>
                Annual Projected Savings
              </small>
              <h3 style={{ margin: "6px 0 2px", color: "#FFFFFF", fontSize: "24px", fontWeight: 800 }}>
                {formatLakhsCrores(annualSavings)}
              </h3>
              <span style={{ fontSize: "11px", color: "#10B981", fontWeight: 600 }}>
                Net ROI: {netRoi}%
              </span>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <small style={{ display: "block", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase" }}>
                Clinician Time Saved
              </small>
              <h3 style={{ margin: "6px 0 2px", color: "#FFFFFF", fontSize: "22px", fontWeight: 700 }}>
                {hoursSavedPerMonth} hrs
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                Doctor review hours recovered monthly
              </span>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "18px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <small style={{ display: "block", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase" }}>
                QuantumDx Cost Per Test
              </small>
              <h3 style={{ margin: "6px 0 2px", color: "#10B981", fontSize: "22px", fontWeight: 700 }}>
                ₹{effectiveCostPerTest}
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                vs ₹{calcCostPerTest} conventional spend
              </span>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Institutional Compliance & Standards in India */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "18px", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", width: "40px", height: "40px", borderRadius: "10px", display: "grid", placeItems: "center", color: "#10B981" }}>
            <Building2 size={20} />
          </div>
          <div>
            <b style={{ color: "#FFFFFF", fontSize: "13px", display: "block" }}>ABDM Ecosystem Ready</b>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Ayushman Bharat Digital Health ID M1/M2 integrated</span>
          </div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "18px", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", width: "40px", height: "40px", borderRadius: "10px", display: "grid", placeItems: "center", color: "#10B981" }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <b style={{ color: "#FFFFFF", fontSize: "13px", display: "block" }}>DPDP Act 2023 Compliant</b>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>100% Indian Data Sovereignty & Encryption</span>
          </div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "18px", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", width: "40px", height: "40px", borderRadius: "10px", display: "grid", placeItems: "center", color: "#10B981" }}>
            <Zap size={20} />
          </div>
          <div>
            <b style={{ color: "#FFFFFF", fontSize: "13px", display: "block" }}>Input Tax Credit (ITC)</b>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Eligible for full 18% GST credit under SAC 998313</span>
          </div>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.4)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "18px", display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", width: "40px", height: "40px", borderRadius: "10px", display: "grid", placeItems: "center", color: "#10B981" }}>
            <Tag size={20} />
          </div>
          <div>
            <b style={{ color: "#FFFFFF", fontSize: "13px", display: "block" }}>NABL & ISO 13485</b>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Compatible with clinical laboratory accreditation standards</span>
          </div>
        </div>
      </div>

      {/* Official Pro-Forma Quotation Print Modal */}
      <AnimatePresence>
        {quotationModalOpen && (
          <motion.div
            className="modal-backdrop"
            onClick={() => setQuotationModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
              display: "grid",
              placeItems: "center",
              zIndex: 1000,
              padding: "20px"
            }}
          >
            <motion.div
              className="quotation-modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              style={{
                background: "#0d1b26",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "760px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "32px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
              }}
            >
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div style={{ background: "#10B981", width: "24px", height: "24px", borderRadius: "6px", display: "grid", placeItems: "center", color: "#061A14" }}>
                      <IndianRupee size={15} strokeWidth={3} />
                    </div>
                    <b style={{ fontSize: "18px", color: "#FFFFFF" }}>QuantumDx Diagnostics India Pvt. Ltd.</b>
                  </div>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>
                    Corporate Identification No (CIN): U72900MH2026PTC394821 • GSTIN: 27AABCQ1234F1Z8
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>
                    Tech Park, Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051
                  </p>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setQuotationModalOpen(false)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quotation Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "10px" }}>
                <div>
                  <small style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase" }}>Bill To Institution:</small>
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "6px",
                      color: "#FFFFFF",
                      padding: "6px 8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      marginTop: "4px"
                    }}
                  />
                  <small style={{ display: "block", color: "var(--text-muted)", marginTop: "4px", fontSize: "11px" }}>
                    ABDM Facility ID: IN-MH-HOSP-2026-9042
                  </small>
                </div>

                <div style={{ textAlign: "right" }}>
                  <small style={{ color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase" }}>Document Type:</small>
                  <b style={{ display: "block", color: "#10B981", fontSize: "15px" }}>Official Pro-Forma Quotation</b>
                  <span style={{ display: "block", fontSize: "12px", color: "#FFFFFF", marginTop: "2px" }}>
                    Quote Ref: QDX-INR-2026-0905
                  </span>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)" }}>
                    Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} • Valid 30 days
                  </span>
                </div>
              </div>

              {/* Table of Line Items */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "20px" }}>
                <thead>
                  <tr style={{ background: "rgba(16, 185, 129, 0.15)", color: "#FFFFFF", borderBottom: "1px solid rgba(16, 185, 129, 0.3)" }}>
                    <th style={{ textAlign: "left", padding: "10px" }}>Item Description</th>
                    <th style={{ textAlign: "center", padding: "10px" }}>SAC Code</th>
                    <th style={{ textAlign: "center", padding: "10px" }}>Billing Period</th>
                    <th style={{ textAlign: "right", padding: "10px" }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", color: "var(--text-secondary)" }}>
                    <td style={{ padding: "10px" }}>
                      <b style={{ color: "#FFFFFF" }}>QuantumDx {selectedPlan.name} Subscription</b>
                      <small style={{ display: "block", color: "var(--text-muted)" }}>
                        {selectedPlan.screenings}, {selectedPlan.seats}, Hybrid QSVM Kernel
                      </small>
                    </td>
                    <td style={{ textAlign: "center", padding: "10px" }}>998313</td>
                    <td style={{ textAlign: "center", padding: "10px" }}>{billingCycle === "annual" ? "12 Months (20% OFF)" : "1 Month"}</td>
                    <td style={{ textAlign: "right", padding: "10px", color: "#FFFFFF" }}>₹{baseSubtotal.toLocaleString("en-IN")}</td>
                  </tr>

                  {selectedAddon && (
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", color: "var(--text-secondary)" }}>
                      <td style={{ padding: "10px" }}>
                        <b style={{ color: "#FFFFFF" }}>{selectedAddon.name}</b>
                        <small style={{ display: "block", color: "var(--text-muted)" }}>Prepaid patient screening credit bundle</small>
                      </td>
                      <td style={{ textAlign: "center", padding: "10px" }}>998313</td>
                      <td style={{ textAlign: "center", padding: "10px" }}>On-Demand</td>
                      <td style={{ textAlign: "right", padding: "10px", color: "#FFFFFF" }}>₹{selectedAddon.price.toLocaleString("en-IN")}</td>
                    </tr>
                  )}

                  {appliedDiscount > 0 && (
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)", color: "#10B981" }}>
                      <td style={{ padding: "10px" }}>
                        <b>Institutional Partner Discount ({appliedDiscount}%)</b>
                      </td>
                      <td style={{ textAlign: "center", padding: "10px" }}>—</td>
                      <td style={{ textAlign: "center", padding: "10px" }}>Discount</td>
                      <td style={{ textAlign: "right", padding: "10px" }}>-₹{discountAmount.toLocaleString("en-IN")}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Tax Summary Totals */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
                <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                    <span>Taxable Subtotal:</span>
                    <b style={{ color: "#FFFFFF" }}>₹{netSubtotal.toLocaleString("en-IN")}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                    <span>CGST (9%):</span>
                    <b>₹{(gstAmount / 2).toLocaleString("en-IN")}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                    <span>SGST (9%):</span>
                    <b>₹{(gstAmount / 2).toLocaleString("en-IN")}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", color: "#10B981", paddingTop: "8px", borderTop: "2px solid rgba(16, 185, 129, 0.4)" }}>
                    <b>Grand Total (₹):</b>
                    <b>₹{grandTotal.toLocaleString("en-IN")}</b>
                  </div>
                  <small style={{ textAlign: "right", color: "var(--text-muted)", fontSize: "11px" }}>
                    (Rupees in Indian National Currency)
                  </small>
                </div>
              </div>

              {/* Bank Settlement Info */}
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", fontSize: "11.5px", color: "var(--text-secondary)" }}>
                <b style={{ color: "#FFFFFF", display: "block", marginBottom: "4px" }}>Bank Wire / RTGS Settlement Details:</b>
                <span>Beneficiary: QuantumDx Clinical Intelligence India Pvt. Ltd. • Bank: State Bank of India (Commercial Branch, BKC Mumbai) • A/C No: 40928172901 • IFSC: SBIN0001234</span>
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setQuotationModalOpen(false)}
                >
                  Close
                </button>
                <motion.button
                  type="button"
                  className="primary"
                  onClick={handlePrintQuotation}
                  style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #10B981, #059669)", borderColor: "#10B981" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Printer size={16} /> Print / Save PDF Quotation
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
