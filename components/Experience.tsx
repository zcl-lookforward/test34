import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Nebula from './Nebula';
import { ShapeType } from '../types';

interface ExperienceProps {
  currentShape: ShapeType;
  onCanvasClick: () => void;
}

const Experience: React.FC<ExperienceProps> = ({ currentShape, onCanvasClick }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 45, near: 0.1, far: 100 }}
      dpr={[1, 2]} // Optimize pixel ratio
      gl={{ alpha: false, antialias: false }} // Post-processing handles AA usually, off for perf
      onClick={onCanvasClick}
      style={{ cursor: 'pointer' }}
    >
      <color attach="background" args={['#000000']} />
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true} 
        minDistance={5} 
        maxDistance={50}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <group>
        <Nebula shape={currentShape} />
      </group>

      <EffectComposer enableNormalPass={false}>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default Experience;