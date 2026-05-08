"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { Experience } from "./Experience";
import { ReactNode } from "react";

interface SceneProps {
  children?: ReactNode;
  scrollPages?: number;
  density?: number;
  interactive?: boolean;
  pulse?: boolean;
  speed?: number;
  isBackground?: boolean;
}

export function Scene({
  children,
  scrollPages = 5,
  density = 5000,
  interactive = true,
  pulse = true,
  speed = 1,
  isBackground = false
}: SceneProps) {

  const content = (
    <>
      <fog attach="fog" args={['#000000', 5, 15]} />
      {scrollPages > 0 ? (
        <ScrollControls pages={scrollPages} damping={0.1}>
          <Experience density={density} interactive={interactive} pulse={pulse} speed={speed} />
          {children && (
            <Scroll html style={{ width: '100%', height: '100%' }}>
              {children}
            </Scroll>
          )}
        </ScrollControls>
      ) : (
        <>
          <Experience density={density} interactive={false} pulse={pulse} speed={speed} />
          {children}
        </>
      )}
    </>
  );

  return (
    <div className={`fixed inset-0 z-0 bg-black ${isBackground ? 'pointer-events-none' : ''}`}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        {content}
      </Canvas>
    </div>
  );
}
