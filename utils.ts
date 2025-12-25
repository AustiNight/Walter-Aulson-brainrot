
import { GoogleGenAI, Type } from "@google/genai";
import { StoryResult } from './types';
import { PROFANITY_LIST } from './constants';

const getSafeApiKey = (): string => {
  // Try the global window variable first
  let key = (window as any).GEMINI_API_KEY || '';
  
  // If window is empty or still the placeholder, try process.env
  if (!key || key === '__API_KEY_PLACEHOLDER__') {
    key = (window as any).process?.env?.API_KEY || '';
  }

  // Final cleanup
  return key.replace(/['"]/g, '').trim();
};

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
  
  if (!apiKey || apiKey === '__API_KEY_PLACEHOLDER__') {
    throw new Error(`API Key is missing. Check your GitHub Secrets for 'API_KEY'.`);
  }
  
  if (apiKey.length < 20) {
    throw new Error(`The API Key found is too short (${apiKey.length} chars). It might have been truncated. Key starts with: ${apiKey.substring(0, 5)}...`);
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const inputsString = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`).join(', ');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a Master of "Italian Brainrot" Hyperrealism. Create a 6-panel sequential comic book script for a child named Walter.
  
  STRICT RULES:
  1. LANGUAGE: Use ENGLISH for everything. 
  2. NAMES: Italianize names of people/creatures by adding suffixes like -ini, -ello, -ona, or -etto.
  3. HYBRIDS: Every creature must be a hybrid of an animal and an object (e.g., a "Shark-Toaster" or "Pigeon-Pizza").
  4. STORYTELLING: Create a coherent sequential story with a beginning, middle, and end.
  5. VISUAL STYLE: All panels will be SQUARE (1:1 aspect ratio). The art style must be "Hyperrealism" - incredibly detailed, photographic textures, cinematic lighting, 8k resolution, realistic materials.
  6. SAFETY: PG ONLY. No weapons, no violence, no gore.
  
  USER INPUTS: ${inputsString}.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullScript: { type: Type.STRING, description: 'A 6-8 sentence funny English story' },
          panels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                visualDescription: { type: Type.STRING, description: 'Detailed visual description for the panel, focusing on Hyperrealism and realistic textures' },
                caption: { type: Type.STRING, description: 'Short English quote' }
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
};

export const generatePanelImage = async (description: string): Promise<string> => {
  const apiKey = getSafeApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Hyperrealism masterpiece, cinematic 8k photography, ultra-detailed photographic textures, realistic materials, Italian Brainrot aesthetic, hybrid animal-object creatures, vibrant colors, square aspect ratio, no text. Subject: ${description}`,
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
};
