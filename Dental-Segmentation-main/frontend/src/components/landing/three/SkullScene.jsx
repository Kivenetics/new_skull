import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function SkullPoints() {
    const ref = useRef();
    const particleCount = 4000;

    const positions = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            // Parametric skull shape: elongated sphere with cranial features
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            // Base sphere
            let r = 2.0;

            // Cranial elongation (taller on top)
            const yFactor = Math.cos(phi);
            if (yFactor > 0) {
                r += yFactor * 0.6; // Dome on top
            } else {
                r += yFactor * 0.3; // Slightly narrower jaw
            }

            // Eye socket indentations
            const x0 = Math.sin(phi) * Math.cos(theta);
            const y0 = Math.cos(phi);
            const z0 = Math.sin(phi) * Math.sin(theta);

            // Left eye socket
            const eyeLDist = Math.sqrt(
                (x0 - 0.4) ** 2 + (y0 - 0.15) ** 2 + (z0 - 0.8) ** 2
            );
            if (eyeLDist < 0.35) r -= 0.4 * (1 - eyeLDist / 0.35);

            // Right eye socket
            const eyeRDist = Math.sqrt(
                (x0 + 0.4) ** 2 + (y0 - 0.15) ** 2 + (z0 - 0.8) ** 2
            );
            if (eyeRDist < 0.35) r -= 0.4 * (1 - eyeRDist / 0.35);

            // Nasal cavity
            const noseDist = Math.sqrt(
                x0 ** 2 + (y0 + 0.15) ** 2 + (z0 - 0.9) ** 2
            );
            if (noseDist < 0.2) r -= 0.25 * (1 - noseDist / 0.2);

            // Temporal region narrowing
            const tempDist = Math.abs(x0);
            if (tempDist > 0.7 && y0 > -0.2 && y0 < 0.3) {
                r -= 0.15;
            }

            // Add organic noise
            const noise =
                Math.sin(theta * 5 + phi * 3) * 0.08 +
                Math.sin(theta * 8 + phi * 7) * 0.04 +
                Math.sin(theta * 13) * 0.02;
            r += noise;

            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.cos(phi);
            pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.15;
            ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#00F5FF"
                size={0.03}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

function FloatingParticles() {
    const ref = useRef();
    const count = 800;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 15;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 15;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.02;
            ref.current.rotation.x = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#8B5CF6"
                size={0.015}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.4}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}

export default function SkullScene() {
    return (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ alpha: true, antialias: true }}
            >
                <ambientLight intensity={0.5} />
                <SkullPoints />
                <FloatingParticles />
            </Canvas>
        </div>
    );
}
