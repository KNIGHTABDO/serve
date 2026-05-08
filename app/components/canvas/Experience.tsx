"use client";

import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

export function Experience({
  interactive = true,
  density = 5000,
  speed = 1,
  pulse = true
}: {
  interactive?: boolean,
  density?: number,
  speed?: number,
  pulse?: boolean
}) {
  let scroll: any = null;
  try {
    // Only works if inside <ScrollControls>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    scroll = useScroll();
  } catch (e) {
    scroll = null;
  }

  const pointsRef = useRef<THREE.Points>(null);
  const targetSpeed = useRef(speed);

  // Listen for typing events to agitate the particles
  useEffect(() => {
    const handlePulse = () => {
      targetSpeed.current = speed * 4;
    };
    window.addEventListener('typing_pulse', handlePulse);
    return () => window.removeEventListener('typing_pulse', handlePulse);
  }, [speed]);


  useFrame((state) => {
    if (!pointsRef.current) return;


    // Smoothly return to base speed
    targetSpeed.current = THREE.MathUtils.lerp(targetSpeed.current, speed, 0.05);
    const time = state.clock.elapsedTime * targetSpeed.current;

    // Base rotation
    pointsRef.current.rotation.y = time * 0.05;
    pointsRef.current.rotation.x = Math.sin(time * 0.1) * 0.05;

    if (interactive && scroll) {
      const offset = scroll.offset;

      const targetY = THREE.MathUtils.lerp(0, 2, offset);
      const targetZ = THREE.MathUtils.lerp(0, 4, offset);

      pointsRef.current.position.y = THREE.MathUtils.lerp(pointsRef.current.position.y, targetY, 0.05);
      pointsRef.current.position.z = THREE.MathUtils.lerp(pointsRef.current.position.z, targetZ, 0.05);

      if (pulse) {
        const scaleFactor = 1 + Math.sin(offset * Math.PI) * 0.8;
        const currentScale = pointsRef.current.scale.x;
        const newScale = THREE.MathUtils.lerp(currentScale, scaleFactor, 0.05);
        pointsRef.current.scale.set(newScale, newScale, newScale);
      }
    } else {
      // Gentle idle float when not scrolling
      pointsRef.current.position.y = Math.sin(time * 0.5) * 0.2;
    }
  });

  const { positions, colors } = useMemo(() => {
    const count = density;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
            const rand1 = Math.random();
            const rand2 = Math.random();
            const rand3 = Math.random();

      const r = 2.5 + (rand1 - 0.5) * 0.8;
      const theta = rand2 * 2 * Math.PI;
      const phi = Math.acos((rand3 * 2) - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.8;
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

            const isBlue = Math.random() > 0.95;
      if (isBlue) {
                color.setHSL(0.6, 0.8, 0.4 + Math.random() * 0.4);
      } else {
                const lightness = 0.1 + Math.random() * 0.4;
        color.setHSL(0, 0, lightness);
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return { positions, colors };
  }, [density]);

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
