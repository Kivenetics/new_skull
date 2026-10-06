import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeInUp } from "../../utils/animations";

function NeuralMeshSVG() {
  const nodes = [];
  const connections = [];

  // Generate neural mesh nodes
  for (let i = 0; i < 40; i++) {
    const x = 100 + Math.random() * 800;
    const y = 50 + Math.random() * 300;
    nodes.push({ x, y, size: 2 + Math.random() * 4 });
  }

  // Generate connections between nearby nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = Math.sqrt(
        (nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2,
      );
      if (dist < 150 && Math.random() > 0.5) {
        connections.push({ from: nodes[i], to: nodes[j] });
      }
    }
  }

  return (
    <svg
      viewBox="0 0 1000 400"
      className="w-full h-auto opacity-30"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Connections */}
      {connections.map((conn, i) => (
        <motion.line
          key={`conn-${i}`}
          x1={conn.from.x}
          y1={conn.from.y}
          x2={conn.to.x}
          y2={conn.to.y}
          stroke="url(#neural-grad)"
          strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: i * 0.02 }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={node.x}
          cy={node.y}
          r={node.size}
          fill="#00F5FF"
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 + i * 0.03 }}
        />
      ))}

      <defs>
        <linearGradient id="neural-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F5FF" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function FutureSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const meshScale = useTransform(scrollYProgress, [0.2, 0.6], [0.8, 1.1]);
  const textY = useTransform(scrollYProgress, [0.3, 0.7], [40, -20]);

  return (
    <section
      ref={sectionRef}
      id="future"
      className="section-container bg-dark-900 relative py-32 overflow-hidden" // Added overflow-hidden to prevent mesh spill
    >
      {/* 1. Background glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)",
        }}
      />

      {/* 2. Neural mesh visualization - CHANGED TO ABSOLUTE */}
      <motion.div
        style={{ scale: meshScale }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
      >
        <NeuralMeshSVG />
      </motion.div>

      {/* 3. Text - ENSURED HIGHER Z-INDEX */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full h-full flex flex-col items-center justify-center">
        <motion.div style={{ y: textY }} className="text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-blue mb-6 block">
              The Future
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight font-display uppercase tracking-tight">
              From Segmentation to
              <br />
              <span className="gradient-text">
                Autonomous Surgical Intelligence
              </span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed mb-12">
              We're building toward a world where AI doesn't just assist
              healthcare — it anticipates, adapts, and elevates every surgical
              decision with real-time intelligence.
            </p>

            {/* Future roadmap pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Automated Diagnosis",
                "Robotic Surgery",
                "Predictive Outcomes",
                "Global Access",
              ].map((item, i) => (
                <motion.span
                  key={i}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-blue/20 text-blue/80 bg-blue/5 hover:bg-blue/10 hover:border-blue/40 transition-all duration-300 cursor-default backdrop-blur-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
