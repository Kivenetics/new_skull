import { useScroll, useTransform } from 'framer-motion';

export function useScrollProgress(ref, offset = ['start end', 'end start']) {
    const { scrollYProgress } = useScroll({
        target: ref,
        offset
    });

    return scrollYProgress;
}

export function useParallax(ref, range = [-50, 50]) {
    const scrollYProgress = useScrollProgress(ref);
    const y = useTransform(scrollYProgress, [0, 1], range);
    return y;
}
