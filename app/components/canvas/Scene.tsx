"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { Experience } from "./Experience";
import { ReactNode } from "react";

// We'll pass the HTML content into the Scroll component
// so R3F manages both the 3D scroll and the DOM scroll perfectly in sync.
export function Scene({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <fog attach="fog" args={['#000000', 5, 15]} />
        <ScrollControls pages={5} damping={0.1}>
          <Experience />
          <Scroll html style={{ width: '100%', height: '100%' }}>
            {children}
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
