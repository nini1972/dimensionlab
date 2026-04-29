import { useMemo } from "react";
import * as THREE from "three";
import * as math from "mathjs";
import { Figure } from "../types";

interface MathFigureProps {
  figure: Figure;
}

export function MathFigure({ figure }: MathFigureProps) {
  const { formula, color, opacity, wireframe } = figure;

  const geometry = useMemo(() => {
    const { x, y, z, uRange, vRange, resolution } = formula;
    
    // Compile math expressions
    let xExpr: math.EvalFunction, yExpr: math.EvalFunction, zExpr: math.EvalFunction;
    try {
      xExpr = math.compile(x);
      yExpr = math.compile(y);
      zExpr = math.compile(z);
    } catch (e) {
      console.error("Formula compilation error", e);
      return new THREE.TorusGeometry(1, 0.4, 16, 100); // Fallback
    }

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
          const scope = { u, v, pi: Math.PI, e: Math.E };
          const vx = Number(xExpr.evaluate(scope));
          const vy = Number(yExpr.evaluate(scope));
          const vz = Number(zExpr.evaluate(scope));
          
          if (isNaN(vx) || isNaN(vy) || isNaN(vz)) {
            vertices.push(0, 0, 0);
          } else {
            vertices.push(vx, vy, vz);
          }
        } catch (e) {
          vertices.push(0, 0, 0);
        }
      }
    }

    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const a = i * (resolution + 1) + j;
        const b = (i + 1) * (resolution + 1) + j;
        const c = (i + 1) * (resolution + 1) + (j + 1);
        const d = i * (resolution + 1) + (j + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [figure.formula]);

  return (
    <mesh geometry={geometry}>
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
