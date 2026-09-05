import { motion } from "motion/react";

const pageVariants = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
      mass: 0.8,
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const childVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export default function PageTransition({ children, pageKey }) {
  return (
    <motion.div
      key={pageKey}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export { childVariants };
