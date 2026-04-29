import { useMemo, useRef } from "react";
import * as THREE from "three";
import * as math from "mathjs";
import { useFrame } from "@react-three/fiber";
import { Figure } from "../types";

interface MathFigureProps {
  figure: Figure;
}

export function MathFigure({ figure }: MathFigureProps) {
  const { formula, color, opacity, wireframe, isAnimated, params } = figure;
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  // We optimize by pre-compiling expressions
  const compiled = useMemo(() => {
    try {
      return {
        x: math.compile(formula.x),
        y: math.compile(formula.y),
        z: math.compile(formula.z),
      };
    } catch (e) {
      console.error("Formula compilation error", e);
      return null;
    }
  }, [formula.x, formula.y, formula.z]);

  const updateGeometry = (t: number) => {
    if (!compiled) return null;

    const { uRange, vRange, resolution } = formula;
    const vertices = [];
    const indices = [];

    const uMin = uRange[0];
    const uMax = uRange[1];
    const vMin = vRange[0];
    const vMax = vRange[1];

    for (let i = 0; i <= resolution; i++) {
      const u = uMin + (uMax - uMin) * (i / resolution);
      for (let j = 0; j <= resolution; j++) {
        const v = vMin + (vMax - vMin) * (j / resolution);
        
        try {
          const scope = { 
            u, v, t, 
            a: params.a, 
            b: params.b, 
            c: params.c, 
            pi: Math.PI, 
            e: Math.E 
          };
          const vx = Number(compiled.x.evaluate(scope));
          const vy = Number(compiled.y.evaluate(scope));
          const vz = Number(compiled.z.evaluate(scope));
          
          vertices.push(isNaN(vx) ? 0 : vx);
          vertices.push(isNaN(vy) ? 0 : vy);
          vertices.push(isNaN(vz) ? 0 : vz);
        } catch (e) {
          vertices.push(0, 0, 0);
        }
      }
    }

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const a_idx = i * (resolution + 1) + j;
        const b_idx = (i + 1) * (resolution + 1) + j;
        const c_idx = (i + 1) * (resolution + 1) + (j + 1);
        const d_idx = i * (resolution + 1) + (j + 1);
        indices.push(a_idx, b_idx, d_idx);
        indices.push(b_idx, c_idx, d_idx);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  // Initial geometry
  const initialGeometry = useMemo(() => updateGeometry(0), [formula, params, compiled]);

  useFrame((state, delta) => {
    if (isAnimated && meshRef.current && compiled) {
      timeRef.current += delta;
      // For performance reasons, we only recompute if animated.
      // Warning: Higher resolutions might be heavy for CPU-side recomputation.
      const newGeo = updateGeometry(timeRef.current);
      if (newGeo) {
        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
        meshRef.current.geometry = newGeo;
      }
    }
  });

  return (
    <mesh ref={meshRef} geometry={initialGeometry || new THREE.BufferGeometry()}>
      <meshPhysicalMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        wireframe={wireframe}
        side={THREE.DoubleSide}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}
