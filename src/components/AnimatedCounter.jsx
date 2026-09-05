import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

/**
 * AnimatedCounter — Animates a number from 0 to `value` using spring physics.
 * Automatically triggers when scrolled into view.
 *
 * @param {number} value - Target number
 * @param {string} suffix - Optional suffix (e.g. "%", "K")
 * @param {number} decimals - Decimal places to show
 */
export default function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 50,
    damping: 15,
    mass: 1,
  });
  const [display, setDisplay] = useState(prefix + "0" + suffix);

  useEffect(() => {
    if (isInView) {
      motionValue.set(typeof value === "number" ? value : parseFloat(value) || 0);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(prefix + latest.toFixed(decimals) + suffix);
    });
    return unsubscribe;
  }, [spring, suffix, prefix, decimals]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
