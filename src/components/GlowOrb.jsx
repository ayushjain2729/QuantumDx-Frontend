import { motion } from "motion/react";

/**
 * GlowOrb — The signature "living intelligence" visual centerpiece.
 * A multi-layered, morphing blob with aqua/violet/indigo gradients that
 * breathes and rotates continuously. CSS-only animation, no extra deps.
 *
 * Placed between the SpatialField WebGL layer and the UI layer for depth.
 */
export default function GlowOrb({ size = 320, className = "" }) {
  return (
    <motion.div
      className={"glow-orb-container " + className}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 40, damping: 12, delay: 0.3 }}
      style={{
        width: size,
        height: size,
        position: "relative",
        pointerEvents: "none",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {/* Core orb blob */}
      <div
        className="glow-orb-core"
        style={{ width: size, height: size }}
      />
      {/* Inner luminance ring */}
      <div
        className="glow-orb-ring"
        style={{
          width: size * 0.65,
          height: size * 0.65,
          top: size * 0.175,
          left: size * 0.175,
        }}
      />
      {/* Soft ambient spill */}
      <div
        className="glow-orb-ambient"
        style={{
          width: size * 1.6,
          height: size * 1.6,
          top: -(size * 0.3),
          left: -(size * 0.3),
        }}
      />
    </motion.div>
  );
}
