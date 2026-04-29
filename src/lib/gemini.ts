import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestFormula(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 3D parametric formula for: ${prompt}. 
      The formula should be in terms of u and v, and can optionally use t (time), a, b, or c (dynamic parameters).
      Provide expressions for x(u, v, t, a, b, c), y(u, v, t, a, b, c), and z(u, v, t, a, b, c).
      Provide suggested ranges for u and v, and a name for the figure. Describe how time 't' or parameters 'a, b, c' affect the shape in the description.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            x: { type: Type.STRING, description: "Formula for x, e.g., cos(u) * sin(v)" },
            y: { type: Type.STRING, description: "Formula for y, e.g., sin(u) * sin(v)" },
            z: { type: Type.STRING, description: "Formula for z, e.g., cos(v)" },
            uRange: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "[min, max] for u"
            },
            vRange: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "[min, max] for v"
            }
          },
          required: ["name", "description", "x", "y", "z", "uRange", "vRange"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
