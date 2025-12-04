import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType } from '../types';
import { PARTICLE_COUNT, PALETTE, ANIMATION_SPEED } from '../constants';
import './NebulaShader'; // Register shader

interface NebulaProps {
  shape: ShapeType;
}

const Nebula: React.FC<NebulaProps> = ({ shape }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null);
  const { viewport } = useThree();

  // --- Geometry Generation Helper Functions ---

  const randomPointInSphere = (radius: number) => {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = Math.cbrt(Math.random()) * radius;
    const sinPhi = Math.sin(phi);
    return new THREE.Vector3(
      r * sinPhi * Math.cos(theta),
      r * sinPhi * Math.sin(theta),
      r * Math.cos(phi)
    );
  };

  // Generate Positions for different shapes
  const { positionsTree, positionsHeart, positionsGalaxy, positionsExplosion, colors, scales } = useMemo(() => {
    const pTree = new Float32Array(PARTICLE_COUNT * 3);
    const pHeart = new Float32Array(PARTICLE_COUNT * 3);
    const pGalaxy = new Float32Array(PARTICLE_COUNT * 3);
    const pExplosion = new Float32Array(PARTICLE_COUNT * 3);
    const c = new Float32Array(PARTICLE_COUNT * 3);
    const s = new Float32Array(PARTICLE_COUNT);

    const colorObj = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // --- Common Attributes ---
      // Color: Pick randomly from palette
      const hex = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      colorObj.set(hex);
      c[i3] = colorObj.r;
      c[i3 + 1] = colorObj.g;
      c[i3 + 2] = colorObj.b;

      // Scale: Random variation
      s[i] = Math.random() * 1.5 + 0.5;

      // --- Tree Shape ---
      // Spiral Cone
      const treeHeight = 15;
      const treeRadius = 6;
      // y goes from -treeHeight/2 to treeHeight/2
      const yNorm = Math.random(); // 0 to 1
      const y = (yNorm - 0.5) * treeHeight; 
      
      // Radius decreases as we go up
      const rAtY = (1 - yNorm) * treeRadius; 
      
      // Spiral angle + some noise for volume
      const angle = y * 4 + Math.random() * Math.PI * 2; 
      // Add volume (thickness) to the spiral
      const thickness = Math.random() * 1.5 * (1 - yNorm);
      const rFinal = rAtY + (Math.random() - 0.5) * thickness;

      pTree[i3] = Math.cos(angle) * rFinal;
      pTree[i3 + 1] = y - 2; // Shift down slightly
      pTree[i3 + 2] = Math.sin(angle) * rFinal;

      // --- Heart Shape ---
      // Parametric heart
      // x = 16sin^3(t)
      // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
      // We need to distribute points *inside* this volume.
      // Rejection sampling or layered approach. Let's use a noisy surface + internal volume.
      
      const t = Math.random() * Math.PI * 2;
      // Scale factor for the heart
      const hScale = 0.35;
      
      // Base heart curve
      let hx = 16 * Math.pow(Math.sin(t), 3);
      let hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      
      // Add depth (Z) - Heart is roughly cylindrical but tapers
      // We vary Z based on how close to center we are, giving it puffiness
      const zRange = 4;
      const z = (Math.random() - 0.5) * zRange * Math.abs(Math.sin(t)); // Thinner at top/bottom cusp
      
      // Scatter inwards to fill volume
      const scatter = Math.sqrt(Math.random()); 
      
      pHeart[i3] = hx * hScale * scatter;
      pHeart[i3 + 1] = hy * hScale * scatter + 2; // Move up
      pHeart[i3 + 2] = z * scatter;


      // --- Galaxy Shape ---
      // Logarithmic spiral arms
      const arms = 5;
      const armIndex = i % arms;
      const randomOffset = Math.random();
      const galaxyRadius = 12;
      const spin = randomOffset * galaxyRadius;
      const armAngle = (armIndex / arms) * Math.PI * 2;
      
      const galX = Math.cos(spin + armAngle) * spin;
      const galY = (Math.random() - 0.5) * (2 / (spin * 0.1 + 1)); // Flattened disk, thicker at center
      const galZ = Math.sin(spin + armAngle) * spin;

      // Apply some noise
      pGalaxy[i3] = galX + (Math.random() - 0.5) * 0.5;
      pGalaxy[i3 + 1] = galY;
      pGalaxy[i3 + 2] = galZ + (Math.random() - 0.5) * 0.5;


      // --- Explosion Shape ---
      // Large sphere
      const v = randomPointInSphere(18);
      pExplosion[i3] = v.x;
      pExplosion[i3 + 1] = v.y;
      pExplosion[i3 + 2] = v.z;
    }

    return {
      positionsTree: pTree,
      positionsHeart: pHeart,
      positionsGalaxy: pGalaxy,
      positionsExplosion: pExplosion,
      colors: c,
      scales: s
    };
  }, []);

  // Use a Float32Array to hold the current animating positions
  const currentPositions = useMemo(() => {
    return new Float32Array(positionsTree); // Start with tree
  }, [positionsTree]);


  useFrame((state) => {
    if (!pointsRef.current || !materialRef.current) return;

    const { clock } = state;
    materialRef.current.uTime = clock.getElapsedTime();

    // Determine target positions based on prop
    let target: Float32Array;
    switch (shape) {
      case ShapeType.TREE:
        target = positionsTree;
        break;
      case ShapeType.HEART:
        target = positionsHeart;
        break;
      case ShapeType.GALAXY:
        target = positionsGalaxy;
        break;
      default: // Explosions
        target = positionsExplosion;
        break;
    }

    // Lerp positions
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Using a simple lerp for every point
    // Optimization: In a real heavy app, this loop might happen in WASM or Shader, 
    // but JS is fast enough for 20k points on modern browsers.
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      positions[i] += (target[i] - positions[i]) * ANIMATION_SPEED;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Add slow rotation to the whole group for galaxy/tree feeling
    pointsRef.current.rotation.y += 0.001;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aColor"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={PARTICLE_COUNT}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <nebulaMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uSize={45.0} // Base size
        uPixelRatio={Math.min(window.devicePixelRatio, 2)}
      />
    </points>
  );
};

export default Nebula;