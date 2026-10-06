import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import logoImg from "../../assets/logo_1.jpeg";
export default function FooterSection() {
  return (
    <footer id="about" className="relative py-20 bg-dark-900">
      {/* Top border glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,245,255,0.2), rgba(139,92,246,0.2), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12"
        >
          {/* Brand */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-violet flex items-center justify-center">
                <img
                  src={logoImg}
                  alt="Logo"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Kivenetics</h3>
                <p className="text-gray-400 text-xs">
                  Precision Medical Intelligence
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Engineering the future of automated healthcare systems through AI,
              hardware, and signal processing innovation.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-white font-semibold mb-6 text-sm tracking-wider uppercase">
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Technology", href: "#technology" },
                { label: "Impact", href: "#impact" },
                { label: "Ethics", href: "#ethics" },
                { label: "Research", href: "#future" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-cyan text-sm transition-colors duration-300 no-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company info */}
          <motion.div variants={fadeInUp}>
            <h4 className="text-white font-semibold mb-6 text-sm tracking-wider uppercase">
              Company
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p>Technology · Information · Internet</p>
              <p>Katpadi, Tamil Nadu, India</p>
              <div className="pt-4">
                <a
                  href="mailto:hello@kivenetics.com"
                  className="text-cyan hover:text-cyan/80 transition-colors duration-300 no-underline"
                >
                  hello@kivenetics.com
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-dark-700 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-gray-500 text-xs">
            © 2026 Kivenetics. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-500 hover:text-gray-300 text-xs transition-colors duration-300 no-underline"
              >
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
