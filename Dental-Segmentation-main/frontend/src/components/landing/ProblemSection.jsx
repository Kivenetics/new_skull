import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  fadeInUp,
  slideFromLeft,
  slideFromRight,
  staggerContainer,
} from "../../utils/animations";

const problems = [
  {
    title: "Slow Workflows",
    description:
      "Medical imaging workflows are slow. Processing a single scan can take hours of manual labor.",
  },
  {
    title: "Inconsistent Results",
    description:
      "Manual segmentation is inconsistent. Human error and fatigue lead to variable outcomes.",
  },
  {
    title: "Precision Demands",
    description:
      "Surgical planning demands precision. Millimeter-level accuracy can mean the difference between success and failure.",
  },
];

function CTSliceStack() {
  return (
    <div className="relative w-full max-w-md aspect-square mx-auto">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-2xl border border-cyan/10"
          style={{
            width: `${90 - i * 5}%`,
            height: `${90 - i * 5}%`,
            left: `${5 + i * 2.5}%`,
            top: `${5 + i * 2.5}%`,
            background: `linear-gradient(135deg, rgba(0,245,255,${0.03 + i * 0.02}), rgba(139,92,246,${0.02 + i * 0.01}))`,
          }}
          initial={{ opacity: 0, rotateX: 30, y: -50 * (i + 1) }}
          whileInView={{
            opacity: 1,
            rotateX: 0,
            y: 0,
          }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.8,
            delay: i * 0.15,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {/* Scan lines inside each slice */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(8)].map((_, j) => (
              <div
                key={j}
                className="absolute w-full h-px"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, rgba(0,245,255,${0.1 + Math.random() * 0.1}) 30%, rgba(0,245,255,${0.15 + Math.random() * 0.15}) 50%, rgba(0,245,255,${0.1 + Math.random() * 0.1}) 70%, transparent 100%)`,
                  top: `${12 + j * 11}%`,
                }}
              />
            ))}
          </div>

          {/* Cross-hair */}
          {i === 0 && (
            <>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan/20" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan/20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 border border-cyan/40 rounded-full" />
            </>
          )}
        </motion.div>
      ))}

      {/* Animated scan line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan/60 to-transparent z-10"
        animate={{ top: ["10%", "90%", "10%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="problem"
      ref={ref}
      className="section-container bg-dark-900 relative py-24"
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        {/* Section label */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-violet">
            The Problem
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — CT Slices */}
          <motion.div
            variants={slideFromLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <CTSliceStack />
          </motion.div>

          {/* Right — Problem statements */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-10"
          >
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative pl-8 border-l-2 border-dark-600 hover:border-cyan/50 transition-colors duration-500"
              >
                <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-cyan/60" />
                <h3 className="text-xl font-bold text-white mb-3">
                  {problem.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-base">
                  {problem.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
