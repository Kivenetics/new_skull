import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import logoImg from "../../assets/logo_1.jpeg";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Technology", href: "#technology" },
    { label: "Impact", href: "#impact" },
    { label: "Ethics", href: "#ethics" },
    { label: "About", href: "#about" },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-center p-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className={`
          flex items-center justify-between w-full max-w-5xl px-10 py-5 
          rounded-[24px] border transition-all duration-700 ease-in-out
          ${
            isScrolled
              ? "bg-slate-900/90 backdrop-blur-2xl border-cyan-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-95"
              : "bg-white/5 backdrop-blur-md border-white/10 scale-100"
          }
        `}
      >
        {/* Branding - Left */}
        <div className="flex items-center gap-4 group cursor-pointer flex-1">
          <div className="relative w-12 h-12 overflow-hidden rounded-xl border border-white/20 shadow-lg">
            <img
              src={logoImg}
              alt="Logo"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <a
            className="text-white font-black text-2xl tracking-tighter group-hover:text-cyan-400 transition-colors"
            href="https://www.linkedin.com/company/kivenetics/"
          >
            Kivenetics
          </a>
        </div>

        {/* Navigation - Center */}
        <div className="hidden lg:flex items-center justify-center gap-12 flex-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-gray-400 hover:text-cyan-300 text-xs font-bold tracking-[0.2em] uppercase transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA - Right */}
        <div className="flex justify-end flex-1">
          <button
            onClick={() => navigate("/dashboard")} // 3. Add the click handler
            className="group relative px-10 py-4 bg-cyan-500 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <span className="relative z-10 text-slate-950 font-black text-sm uppercase tracking-wider">
              Try It Out
            </span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
