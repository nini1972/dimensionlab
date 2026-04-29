export interface ParametricFormula {
  x: string;
  y: string;
  z: string;
  uRange: [number, number];
  vRange: [number, number];
  resolution: number;
}

export interface Figure {
  id: string;
  name: string;
  description: string;
  formula: ParametricFormula;
  color: string;
  opacity: number;
  wireframe: boolean;
}
