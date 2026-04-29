import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Stars, Float, Grid } from "@react-three/drei";
import { Suspense } from "react";
import { Figure } from "../types";
import { MathFigure } from "./MathFigure";

interface SceneProps {
  figure: Figure | null;
}

export function Scene({ figure }: SceneProps) {
  return (
    <div className="w-full h-full relative grid-bg">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f3ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            {figure && <MathFigure figure={figure} />}
          </Float>
        </Suspense>

        <Grid
          infiniteGrid
          fadeDistance={30}
          fadeStrength={5}
          cellSize={1}
          sectionSize={5}
          sectionColor="#333"
          cellColor="#222"
        />
      </Canvas>
    </div>
  );
}
