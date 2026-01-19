"use client";

import React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Avatar } from "./Avatar";

/**
 * Experience Component
 * Handles the 3D scene logic, lighting, background, and avatar placement.
 * This must be rendered inside a <Canvas> to access R3F hooks.
 */
const Experience = () => {
  // Load custom background texture
  const texture = useTexture("/textures/interviewBg.png");

  // Get viewport dimensions for background plane scaling
  const viewport = useThree((state) => state.viewport);

  return (
    <>
      {/* --- LIGHTING SYSTEM --- */}
      {/* Ambient light for general scene brightness */}
      <ambientLight intensity={0.6} />

      {/* Directional light to create highlights and define form */}
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />

      {/* Point light for soft fill from behind/side */}
      <pointLight position={[-5, 5, -5]} intensity={0.8} />

      {/* --- AVATAR --- */}
      {/* The main 3D character placed in front of the camera */}
      <Avatar position={[0, -3, 6]} scale={2} />

      {/* --- ENVIRONMENT --- */}
      {/* Loads an HDR map for realistic reflections and lighting environment */}
      <Environment files="/textures/qwantani_moon_noon_puresky_1k.hdr" background />

      {/* --- BACKGROUND PLANE --- */}
      {/* A plane that fills the viewport with the pre-loaded interview room texture */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </>
  );
};

/**
 * AvatarSetuUp Main Component
 * Initializes the React Three Fiber Canvas with specific camera settings.
 */
function AvatarSetuUp() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 0, 8],
        fov: 42
      }}
      className="w-full h-full"
    >
      {/* Fallback background color before assets load */}
      <color attach="background" args={["#0A0A0A"]} />

      {/* Render the 3D scene */}
      <Experience />
    </Canvas>
  );
}

export default AvatarSetuUp;
