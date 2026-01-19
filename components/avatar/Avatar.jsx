"use client";

import { useGLTF, useFBX } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useAvatar } from "@/context/AvatarContext";

const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

export function Avatar(props) {
  const { speak, say } = useAvatar();
  const { nodes, materials } = useGLTF("/models/interviewer.glb");
  const group = useRef();
  const mixer = useRef();

  // Load FBX animation inside Suspense
  const fbx = useFBX("/animations/idle.fbx"); // FBX must exist in public/animations

  useEffect(() => {
    if (!fbx || !group.current) return;

    // Create an animation mixer on the avatar root
    mixer.current = new THREE.AnimationMixer(group.current);

    // Play the first animation clip
    if (fbx.animations.length > 0) {
      const action = mixer.current.clipAction(fbx.animations[0]);
      action.play();
    }
  }, [fbx]);

  // Update mixer every frame
  useFrame((state, delta) => {
    if (mixer.current) mixer.current.update(delta);

    // Head follows camera
    if (group.current) {
      const head = group.current.getObjectByName("Head");
      if (head) head.lookAt(state.camera.position);
    }
  });

  // Reset mouth to neutral
  const resetMouth = () => {
    Object.values(corresponding).forEach((viseme) => {
      const headIndex = nodes.Wolf3D_Head.morphTargetDictionary[viseme];
      const teethIndex = nodes.Wolf3D_Teeth.morphTargetDictionary[viseme];
      if (headIndex !== undefined)
        nodes.Wolf3D_Head.morphTargetInfluences[headIndex] = 0;
      if (teethIndex !== undefined)
        nodes.Wolf3D_Teeth.morphTargetInfluences[teethIndex] = 0;
    });
  };

  // Trigger viseme animation
  const triggerViseme = (viseme) => {
    const headIndex = nodes.Wolf3D_Head.morphTargetDictionary[viseme];
    if (headIndex === undefined) return;

    const setInfluence = (value) => {
      nodes.Wolf3D_Head.morphTargetInfluences[headIndex] = THREE.MathUtils.lerp(
        nodes.Wolf3D_Head.morphTargetInfluences[headIndex],
        value,
        0.5
      );
    };

    setInfluence(1);
    setTimeout(() => setInfluence(0), 120);
  };

  // Animate mouth based on "say" text
  useEffect(() => {
    if (speak && say) {
      const letters = say.toUpperCase().split("");
      let index = 0;

      const interval = setInterval(() => {
        if (index >= letters.length) index = 0;
        const letter = letters[index++];
        const viseme = corresponding[letter] || "mouthOpen";
        triggerViseme(viseme);
      }, 120);

      return () => clearInterval(interval);
    } else {
      resetMouth();
    }
  }, [speak, say]);

  return (
    // <group {...props} dispose={null} ref={group} position={[0, -2.2, 5.5]} rotation={[0, 0, 0]} >
    <group {...props} dispose={null} ref={group} position={[0, -2.1, 5.7]} rotation={[-1.6, 0, 0]}>
      <primitive object={nodes.Hips} />
      <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Glasses.geometry} material={materials.Wolf3D_Glasses} skeleton={nodes.Wolf3D_Glasses.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
      <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
      <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Head" geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Teeth" geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
    </group>
  );
}

useGLTF.preload("/models/interviewer.glb");
