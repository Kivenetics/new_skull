import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../utils/animations';

const pillars = [
    {
        icon: '🛡️',
        title: 'Ethical AI',
        description:
            'Every model we build is auditable, explainable, and designed with patient safety as the non-negotiable baseline.',
    },
    {
        icon: '🔍',
        title: 'Transparent Research',
        description:
            'Open methodologies, reproducible results, and peer-reviewed validation ensure trust in every output.',
    },
    {
        icon: '🌱',
        title: 'Sustainable Automation',
        description:
            'Energy-efficient inference, hardware longevity, and equitable access are central to our engineering philosophy.',
    },
];

export default function EthicsSection() {
    return (
        <section
            id="ethics"
            className="section-container relative py-24 overflow-hidden"
        >
            {/* Background: dark to mint gradient */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(180deg, #111827 0%, #0A0F1C 30%, #061210 60%, #0A1A15 100%)',
                }}
            />

            {/* Soft green ambient glow */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 80%, rgba(16,185,129,0.08) 0%, transparent 60%)',
                }}
            />

            {/* Floating orb */}
            <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px]"
                style={{ backgroundColor: 'rgba(16,185,129,0.06)' }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
                {/* Header */}
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="text-xs font-semibold tracking-[0.3em] uppercase text-mint mb-4 block">
                        Ethics & Sustainability
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">
                        Building Responsibly for{' '}
                        <span className="gradient-text-mint">Tomorrow</span>
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
                        Innovation without responsibility is reckless. We embed ethical
                        principles into every layer of our technology.
                    </p>
                </motion.div>

                {/* Pillars */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {pillars.map((pillar, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="text-center group"
                        >
                            {/* Icon with ring */}
                            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                                <div className="absolute inset-0 rounded-full border border-mint/20 group-hover:border-mint/40 transition-colors duration-500" />
                                <motion.div
                                    className="absolute inset-0 rounded-full"
                                    style={{
                                        background:
                                            'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
                                    }}
                                    whileHover={{ scale: 1.3 }}
                                />
                                <span className="text-3xl relative z-10">{pillar.icon}</span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-mint transition-colors duration-300">
                                {pillar.title}
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {pillar.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quote */}
                <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <blockquote className="text-2xl md:text-3xl font-light text-gray-300 italic leading-relaxed">
                        "Technology should{' '}
                        <span className="text-mint font-medium not-italic">heal</span>,
                        not just{' '}
                        <span className="text-gray-400 font-medium not-italic">
                            innovate
                        </span>
                        ."
                    </blockquote>
                </motion.div>
            </div>
        </section>
    );
}
