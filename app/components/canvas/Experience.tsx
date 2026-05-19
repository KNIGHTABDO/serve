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

  const groupRef = useRef<THREE.Group>(null);
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null);

  const targetSpeed = useRef(speed);
  const pulseGlow = useRef(0);

  // Listen for typing events to agitate the particles and glow
  useEffect(() => {
    const handlePulse = () => {
      targetSpeed.current = speed * 4;
      pulseGlow.current = 1.0;
    };
    window.addEventListener('typing_pulse', handlePulse);
    return () => window.removeEventListener('typing_pulse', handlePulse);
  }, [speed]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smoothly return pulse glow to 0
    pulseGlow.current = THREE.MathUtils.lerp(pulseGlow.current, 0, 0.05);

    // Smoothly return to base speed
    targetSpeed.current = THREE.MathUtils.lerp(targetSpeed.current, speed, 0.05);
    const time = state.clock.elapsedTime * targetSpeed.current;

    // Base rotation
    groupRef.current.rotation.y = time * 0.05;
    groupRef.current.rotation.x = Math.sin(time * 0.1) * 0.05;

    if (interactive && scroll) {
      const offset = scroll.offset;

      const targetY = THREE.MathUtils.lerp(0, 2, offset);
      const targetZ = THREE.MathUtils.lerp(0, 4, offset);

      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);

      if (pulse) {
        const scaleFactor = 1 + Math.sin(offset * Math.PI) * 0.8;
        const currentScale = groupRef.current.scale.x;
        const newScale = THREE.MathUtils.lerp(currentScale, scaleFactor, 0.05);
        groupRef.current.scale.set(newScale, newScale, newScale);
      }
    } else {
      // Gentle idle float when not scrolling
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.2;
    }

    // Animate the particle size and line opacity based on typing pulse glow
    if (pointsMaterialRef.current) {
      pointsMaterialRef.current.size = 0.02 + pulseGlow.current * 0.035;
    }
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = 0.25 + pulseGlow.current * 0.5;
    }
  });

  const { positions, colors, linePositions, lineColors } = useMemo(() => {
    const count = density;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const amberColor = new THREE.Color("#C49A3C");
    const ivoryColor = new THREE.Color("#EDE8DF");
    const activeColor = new THREE.Color("#FFD573");

    const centroids = [
      new THREE.Vector3(-1.5, 1.2, 0.5),
      new THREE.Vector3(1.8, -0.8, -1.0),
      new THREE.Vector3(-0.5, -1.5, 0.8),
      new THREE.Vector3(0.8, 1.5, -0.5),
      new THREE.Vector3(-2.0, -0.5, -1.2),
    ];

    // Helper for Box-Muller Gaussian noise
    function randn() {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    const pointsPerCluster = Math.floor(count / centroids.length);

    // To keep track of generated points to build lines to neighboring nodes
    const clusterPoints: THREE.Vector3[][] = Array.from({ length: centroids.length }, () => []);
    const clusterPointColors: THREE.Color[][] = Array.from({ length: centroids.length }, () => []);

    for (let c = 0; c < centroids.length; c++) {
      const centroid = centroids[c];
      const numPoints = (c === centroids.length - 1) ? count - (c * pointsPerCluster) : pointsPerCluster;

      for (let p = 0; p < numPoints; p++) {
        const idx = c * pointsPerCluster + p;
        if (idx >= count) break;

        // Tight Gaussian/spherical distribution
        const stdDev = 0.28;
        const x = centroid.x + randn() * stdDev;
        const y = centroid.y + randn() * stdDev;
        const z = centroid.z + randn() * stdDev;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        const posVec = new THREE.Vector3(x, y, z);
        clusterPoints[c].push(posVec);

        const randColor = Math.random();
        let chosenColor: THREE.Color;
        if (randColor < 0.45) {
          chosenColor = amberColor;
        } else if (randColor < 0.90) {
          chosenColor = ivoryColor;
        } else {
          chosenColor = activeColor;
        }

        colors[idx * 3] = chosenColor.r;
        colors[idx * 3 + 1] = chosenColor.g;
        colors[idx * 3 + 2] = chosenColor.b;

        clusterPointColors[c].push(chosenColor);
      }
    }

    // Now, build lines
    const lineSegmentsList: { start: THREE.Vector3; end: THREE.Vector3; startColor: THREE.Color; endColor: THREE.Color }[] = [];

    // 1. Link centroids together (complete graph for 5 nodes = 10 lines)
    for (let i = 0; i < centroids.length; i++) {
      for (let j = i + 1; j < centroids.length; j++) {
        lineSegmentsList.push({
          start: centroids[i],
          end: centroids[j],
          startColor: amberColor,
          endColor: amberColor
        });
      }
    }

    // 2. Link centroids to neighboring nodes (e.g. connect to every 12th node in its cluster)
    for (let c = 0; c < centroids.length; c++) {
      const centroid = centroids[c];
      const points = clusterPoints[c];
      const pColors = clusterPointColors[c];

      for (let p = 0; p < points.length; p += 12) {
        lineSegmentsList.push({
          start: centroid,
          end: points[p],
          startColor: amberColor,
          endColor: pColors[p]
        });
      }
    }

    // Flatten line segments list into Float32Array
    const numLinePoints = lineSegmentsList.length * 2;
    const linePositions = new Float32Array(numLinePoints * 3);
    const lineColors = new Float32Array(numLinePoints * 3);

    for (let i = 0; i < lineSegmentsList.length; i++) {
      const segment = lineSegmentsList[i];

      // Start point
      linePositions[i * 6] = segment.start.x;
      linePositions[i * 6 + 1] = segment.start.y;
      linePositions[i * 6 + 2] = segment.start.z;

      lineColors[i * 6] = segment.startColor.r;
      lineColors[i * 6 + 1] = segment.startColor.g;
      lineColors[i * 6 + 2] = segment.startColor.b;

      // End point
      linePositions[i * 6 + 3] = segment.end.x;
      linePositions[i * 6 + 4] = segment.end.y;
      linePositions[i * 6 + 5] = segment.end.z;

      lineColors[i * 6 + 3] = segment.endColor.r;
      lineColors[i * 6 + 4] = segment.endColor.g;
      lineColors[i * 6 + 5] = segment.endColor.b;
    }

    return { positions, colors, linePositions, lineColors };
  }, [density]);

  return (
    <group>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#C49A3C" />

      <group ref={groupRef}>
        <points>
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
            ref={pointsMaterialRef}
            size={0.02}
            vertexColors
            transparent
            opacity={0.8}
            sizeAttenuation={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={linePositions.length / 3}
              array={linePositions}
              itemSize={3}
              args={[linePositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              count={lineColors.length / 3}
              array={lineColors}
              itemSize={3}
              args={[lineColors, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={lineMaterialRef}
            vertexColors
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>
    </group>
  );
}
