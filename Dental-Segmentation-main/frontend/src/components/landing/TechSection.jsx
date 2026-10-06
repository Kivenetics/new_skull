import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "../../utils/animations";

const technologies = [
  {
    icon: "🧬",
    title: "3D Deep Learning",
    desc: "MONAI + PyTorch powered volumetric segmentation with sub-millimeter accuracy.",
    tags: ["MONAI", "PyTorch", "nnU-Net"],
    glow: "#00F5FF",
  },
  {
    icon: "🚀",
    title: "GPU Inference",
    desc: "CUDA-optimized real-time inference for instant segmentation on clinical hardware.",
    tags: ["CUDA", "TensorRT", "ONNX"],
    glow: "#3B82F6",
  },
  {
    icon: "📡",
    title: "Streaming APIs",
    desc: "Real-time data pipelines streaming medical data between devices and cloud systems.",
    tags: ["WebSocket", "gRPC", "REST"],
    glow: "#8B5CF6",
  },
  {
    icon: "🔬",
    title: "VTK Rendering",
    desc: "Desktop and web-based 3D rendering with VTK.js for interactive volume visualization.",
    tags: ["VTK.js", "Three.js", "WebGL"],
    glow: "#10B981",
  },
  {
    icon: "⚙️",
    title: "Custom Hardware",
    desc: "Purpose-built embedded medical systems with real-time signal processing capabilities.",
    tags: ["FPGA", "ARM", "DSP"],
    glow: "#F59E0B",
  },
];

export default function TechSection() {
  return (
    <section
      id="technology"
      className="section-container bg-dark-900 relative py-24"
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        {/* Section header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-cyan mb-4 block">
            Core Technology
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Built on <span className="gradient-text">Cutting-Edge</span> Stack
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Every layer of our technology is engineered for precision,
            performance, and reliability in clinical environments.
          </p>
        </motion.div>

        {/* Tech grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {technologies.map((tech, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="glass-card p-6 relative overflow-hidden group cursor-pointer transition-all duration-500"
              whileHover={{ y: -6, scale: 1.02 }}
              style={{
                "--glow-color": tech.glow,
              }}
            >
              {/* Hover glow border */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 30px ${tech.glow}15, 0 0 30px ${tech.glow}10`,
                  border: `1px solid ${tech.glow}40`,
                  borderRadius: "16px",
                }}
              />

              {/* Icon */}
              <div className="text-4xl mb-4">{tech.icon}</div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-3 transition-colors duration-300 text-white group-hover:text-cyan">
                {tech.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {tech.desc}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tech.tags.map((tag, j) => (
                  <span
                    key={j}
                    className="text-xs px-3 py-1 rounded-full border font-medium"
                    style={{
                      borderColor: `${tech.glow}30`,
                      color: tech.glow,
                      backgroundColor: `${tech.glow}08`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Corner accent */}
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
                style={{ backgroundColor: tech.glow }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
