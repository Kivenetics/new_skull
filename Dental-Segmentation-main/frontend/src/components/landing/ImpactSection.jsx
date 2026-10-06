import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";

const impacts = [
  {
    icon: "🏥",
    title: "Surgical Planning",
    description:
      "AI-generated 3D models enable surgeons to rehearse complex procedures with precision anatomical data before entering the OR.",
    stat: "95%",
    statLabel: "accuracy",
    gradient: "from-cyan/20 to-blue/10",
  },
  {
    icon: "🦴",
    title: "Implant Design",
    description:
      "Patient-specific implant geometries derived from automated segmentation, reducing design iteration time by orders of magnitude.",
    stat: "10x",
    statLabel: "faster",
    gradient: "from-blue/20 to-violet/10",
  },
  {
    icon: "🧠",
    title: "Neuroimaging Research",
    description:
      "Granular brain structure segmentation powering cognitive research, disease tracking, and treatment response monitoring.",
    stat: "130+",
    statLabel: "structures",
    gradient: "from-violet/20 to-cyan/10",
  },
  {
    icon: "🌍",
    title: "Automation for Clinics",
    description:
      "Bringing advanced medical imaging capabilities to under-resourced clinics through automated, hardware-efficient AI systems.",
    stat: "24/7",
    statLabel: "operation",
    gradient: "from-mint/20 to-cyan/10",
  },
];

function ImpactCard({ impact, index }) {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0.5],
  );

  return (
    <motion.div ref={cardRef} style={{ y, opacity }} className="relative">
      <motion.div
        variants={fadeInUp}
        className={`glass-card glass-card-hover p-8 h-full bg-gradient-to-br ${impact.gradient} relative overflow-hidden group`}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Large faded stat in background */}
        <div className="absolute top-4 right-4 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors duration-500 select-none">
          {impact.stat}
        </div>

        <div className="relative z-10">
          <div className="text-4xl mb-5">{impact.icon}</div>
          <h3 className="text-xl font-bold text-white mb-3">{impact.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {impact.description}
          </p>

          {/* Stat pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-cyan font-bold text-lg">{impact.stat}</span>
            <span className="text-gray-400 text-xs uppercase tracking-wider">
              {impact.statLabel}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ImpactSection() {
  return (
    <section
      id="impact"
      className="section-container bg-dark-800 relative py-24"
    >
      {/* Glow accents */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, rgba(0,245,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.04) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-mint mb-4 block">
            Real-World Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Where <span className="gradient-text-mint">Intelligence</span> Meets
            Medicine
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our technology is transforming how healthcare professionals plan,
            design, research, and deliver care across the globe.
          </p>
        </motion.div>

        {/* Impact cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {impacts.map((impact, i) => (
            <ImpactCard key={i} impact={impact} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
