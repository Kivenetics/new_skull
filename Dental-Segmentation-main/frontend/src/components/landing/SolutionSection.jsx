import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";

const pipelineSteps = [
  {
    icon: "⚡",
    title: "Hardware",
    desc: "Custom medical sensors & embedded systems",
    color: "#00F5FF",
  },
  {
    icon: "🧠",
    title: "AI Model",
    desc: "Deep learning segmentation & inference",
    color: "#3B82F6",
  },
  {
    icon: "📡",
    title: "Signal Processing",
    desc: "Real-time data filtering & transformation",
    color: "#8B5CF6",
  },
  {
    icon: "🔮",
    title: "3D Output",
    desc: "Interactive volumetric visualization",
    color: "#10B981",
  },
];

function ConnectorLine({ index, isInView }) {
  return (
    <div className="hidden lg:flex items-center mx-[-1px]">
      <svg width="80" height="4" className="overflow-visible">
        <motion.line
          x1="0"
          y1="2"
          x2="80"
          y2="2"
          stroke={`url(#grad-${index})`}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 + index * 0.3 }}
        />
        {/* Glow dot at end */}
        <motion.circle
          cx="80"
          cy="2"
          r="4"
          fill={pipelineSteps[index + 1]?.color || "#10B981"}
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: [0, 1, 0.6], scale: [0, 1.5, 1] } : {}}
          transition={{ duration: 0.5, delay: 1 + index * 0.3 }}
        />
        <defs>
          <linearGradient id={`grad-${index}`}>
            <stop offset="0%" stopColor={pipelineSteps[index].color} />
            <stop
              offset="100%"
              stopColor={pipelineSteps[index + 1]?.color || "#10B981"}
            />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="solution"
      ref={ref}
      className="section-container bg-dark-800 relative py-24"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(139,92,246,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        {/* Section header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-cyan mb-4 block">
            The Solution
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            From Raw Data to{" "}
            <span className="gradient-text">3D Intelligence</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our end-to-end pipeline transforms medical data into actionable
            surgical intelligence through four precision-engineered stages.
          </p>
        </motion.div>

        {/* Pipeline */}
        <motion.div
          className="flex flex-col lg:flex-row items-center justify-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pipelineSteps.map((step, i) => (
            <div key={i} className="flex items-center">
              {/* Step card */}
              <motion.div
                variants={fadeInUp}
                className="glass-card glass-card-hover p-6 w-56 text-center relative overflow-hidden group cursor-pointer"
                whileHover={{ scale: 1.05, y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Top glow line */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
                  }}
                />

                <div className="text-4xl mb-4">{step.icon}</div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: step.color }}
                >
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.desc}
                </p>

                {/* Step number */}
                <div
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: `${step.color}15`,
                    color: step.color,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  {i + 1}
                </div>
              </motion.div>

              {/* Connector */}
              {i < pipelineSteps.length - 1 && (
                <ConnectorLine index={i} isInView={isInView} />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
