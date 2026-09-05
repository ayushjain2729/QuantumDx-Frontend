import { motion } from "motion/react";

const cardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export default function AnimatedCard({
  children,
  className = "",
  onClick,
  layoutId,
  delay = 0,
  style = {},
}) {
  return (
    <motion.div
      className={"card " + className}
      style={style}
      onClick={onClick}
      layoutId={layoutId}
      variants={cardVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{
        y: -3,
        boxShadow:
          "0 12px 40px rgba(99, 102, 241, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.15)",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
