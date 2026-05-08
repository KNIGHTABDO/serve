"use client";

import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

export function Experience() {
  const scroll = useScroll();
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;

    // Base rotation
    pointsRef.current.rotation.y = time * 0.05;
    pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.05;

    // offset is 0 at top, 1 at bottom
    const offset = scroll.offset;

    // Interpolate values based on scroll

    // 1. Position: move up and closer as we scroll down
    const targetY = THREE.MathUtils.lerp(0, 2, offset);
    const targetZ = THREE.MathUtils.lerp(0, 4, offset);

    pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, targetY, 0.05);
    pointsRef.current.position.z = THREE.MathUtils.lerp(pointsRef.current.position.z, targetZ, 0.05);

    // 2. Scale: pulse larger in middle sections
    // Peak scale at 50% scroll (offset = 0.5)
    const scaleFactor = 1 + Math.sin(offset * Math.PI) * 0.8;
    const currentScale = pointsRef.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, scaleFactor, 0.05);
    pointsRef.current.scale.set(newScale, newScale, newScale);
  });

  const { positions, colors } = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Spherical distribution with a slightly squashed shape
      // eslint-disable-next-line react-hooks/purity
      const rand1 = Math.random();
      // eslint-disable-next-line react-hooks/purity
      const rand2 = Math.random();
      // eslint-disable-next-line react-hooks/purity
      const rand3 = Math.random();

      const r = 2.5 + (rand1 - 0.5) * 0.8;
      const theta = rand2 * 2 * Math.PI;
      const phi = Math.acos((rand3 * 2) - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.8; // Squash Y slightly
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Dark, somber colors: mostly near-black, greys, and sparse deep cold blues
      // eslint-disable-next-line react-hooks/purity
      const isBlue = Math.random() > 0.95;
      if (isBlue) {
        // eslint-disable-next-line react-hooks/purity
        color.setHSL(0.6, 0.8, 0.4 + Math.random() * 0.4); // Blue spark
      } else {
        // eslint-disable-next-line react-hooks/purity
        const lightness = 0.1 + Math.random() * 0.4;
        color.setHSL(0, 0, lightness); // Grey/White
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, []);

  return (
    <group>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#4444ff" />

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
