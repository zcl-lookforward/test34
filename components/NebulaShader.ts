import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

export const NebulaMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.2, 0.5, 1.0),
    uPixelRatio: 1,
    uSize: 40.0,
    uTexture: null, 
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSize;
    
    attribute float aScale;
    attribute vec3 aColor;
    
    varying vec3 vColor;
    varying float vDistance;

    void main() {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      
      // Add subtle breathing movement
      float time = uTime * 0.5;
      modelPosition.y += sin(time + modelPosition.x * 10.0) * 0.05;
      modelPosition.x += cos(time + modelPosition.z * 10.0) * 0.05;

      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;

      gl_Position = projectedPosition;
      
      // Size attenuation based on depth
      gl_PointSize = uSize * aScale * uPixelRatio;
      gl_PointSize *= (1.0 / -viewPosition.z);

      vColor = aColor;
      vDistance = -viewPosition.z;
    }
  `,
  // Fragment Shader
  `
    varying vec3 vColor;
    
    void main() {
      // Circular glow gradient
      float strength = distance(gl_PointCoord, vec2(0.5));
      strength = 1.0 - strength;
      strength = pow(strength, 3.0);

      vec3 finalColor = vColor * strength;
      
      // Alpha blending for soft edges
      gl_FragColor = vec4(finalColor, strength);
    }
  `
);

extend({ NebulaMaterial });

// Declare module for TS
declare global {
  namespace JSX {
    interface IntrinsicElements {
      nebulaMaterial: any;
    }
  }
}
