
import { GoogleGenAI, Type } from "@google/genai";
import { StoryResult } from './types';
import { PROFANITY_LIST } from './constants';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const getSafeApiKey = (): string => {
  let key = (window as any).GEMINI_API_KEY || '';
  if (!key) {
    key = (window as any).process?.env?.API_KEY || '';
  }
  return (key || '').replace(/['"]/g, '').trim();
};

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isRateLimit = err?.message?.includes('429') || err?.message?.includes('quota') || err?.status === 'RESOURCE_EXHAUSTED';
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await sleep(delay);
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export const moderateInput = (inputs: Record<string, string>): { isValid: boolean; errorField?: string } => {
  for (const [key, value] of Object.entries(inputs)) {
    const lowerValue = value.toLowerCase();
    if (PROFANITY_LIST.some(badWord => lowerValue.includes(badWord))) {
      return { isValid: false, errorField: key };
    }
  }
  return { isValid: true };
};

export const italianizeName = (name: string): string => {
  if (!name) return 'Bebbo';
  const suffixes = ['ini', 'ello', 'ona', 'etto', 'elli'];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const base = name.replace(/[aeiou]+$/i, '');
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase() + suffix;
};

export const generateStoryContent = async (inputs: Record<string, string>): Promise<StoryResult> => {
  const apiKey = getSafeApiKey();
  const isPlaceholder = apiKey.startsWith('__API') || apiKey.includes('PLACEHOLDER');
  
  if (!apiKey || isPlaceholder) {
    throw new Error(`API Key is missing or still in placeholder state.`);
  }

  const ai = new GoogleGenAI({ apiKey });
  const inputsString = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join(', ');
  
  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Master of "Italian Brainrot" Hyperrealism. Create a 6-panel sequential comic book script for a child named Walter.
    
    STRICT RULES:
    1. LANGUAGE: Use ENGLISH for everything. 
    2. NAMES: Italianize names of people/creatures by adding suffixes like -ini, -ello, -ona, or -etto.
    3. HYBRIDS: Every creature must be a hybrid of an animal and an object.
    4. STORYTELLING: Create a coherent sequential story for Walter.
    5. VISUAL STYLE: Square panels (1:1). Art style: "Hyperrealism" - cinematic photography, 8k, realistic materials.
    6. SAFETY: PG ONLY.
    
    USER INPUTS: ${inputsString}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullScript: { type: Type.STRING },
            panels: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  visualDescription: { type: Type.STRING },
                  caption: { type: Type.STRING }
                },
                required: ['title', 'visualDescription', 'caption']
              }
            }
          },
          required: ['fullScript', 'panels']
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error('No script generated');
    return JSON.parse(text.trim());
  });
};

export const generatePanelImage = async (description: string): Promise<string> => {
  const apiKey = getSafeApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // Add a small delay before image generation to prevent hitting RPM limits
  await sleep(1500);

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Hyperrealism masterpiece, cinematic 8k photography, ultra-detailed photographic textures, realistic materials, Italian Brainrot aesthetic, hybrid animal-object creatures, square aspect ratio, no text. Subject: ${description}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1'
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('Image generation failed');
  });
};
