import { useRef } from "react";
import { motion } from "framer-motion";
import {
  fadeInUp,
  staggerContainer,
  letterReveal,
} from "../../utils/animations";
import SkullScene from "./three/SkullScene";

export default function HeroSection() {
  const sectionRef = useRef(null);
  const headline = "Engineering Intelligence Into Healthcare.";

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="section-container relative bg-dark-900"
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,245,255,0.05) 0%, transparent 60%)",
        }}
      />

      {/* 3D Skull */}
      <SkullScene />

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Tagline chip */}
          <motion.div variants={fadeInUp} className="mb-8">
            <span className="inline-block text-xs font-semibold tracking-[0.3em] uppercase text-cyan/80 border border-cyan/20 rounded-full px-5 py-2 bg-cyan/5">
              Precision Medical Intelligence
            </span>
          </motion.div>

          {/* Main headline - letter by letter */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] mb-8 font-display uppercase tracking-tighter"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {headline.split(" ").map((word, i) => (
              <motion.span
                key={i}
                variants={letterReveal}
                className={`inline-block mr-[0.3em] ${
                  word === "Intelligence"
                    ? "gradient-text"
                    : word === "Healthcare."
                      ? "text-cyan text-glow-cyan"
                      : "text-white"
                }`}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>
        </motion.div>
      </div>
    </section>
  );
}
