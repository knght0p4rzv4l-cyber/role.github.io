import { GoogleGenAI, Type } from "@google/genai";
import { Character, Message, Settings, UserProfile } from "../types";

const getApiKey = (settings: Settings) => {
  const envKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
  return settings.superNsfwMode && settings.customApiKey ? settings.customApiKey : envKey;
};

export async function generateAIResponse(
  character: Character,
  history: Message[],
  userProfile: UserProfile,
  settings: Settings,
  userImage?: string // Base64
) {
  try {
    const apiKey = getApiKey(settings);
    
    if (!apiKey) {
      return "⚠️ API Key no encontrada. Si estás en Vercel, asegúrate de haber configurado la variable de entorno GEMINI_API_KEY en el panel de control de Vercel.";
    }

    const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Eres un experto en roleplay. Estás interpretando a ${character.name}.
    Descripción de ${character.name}: ${character.description}
    Personalidad: ${character.personality}
    Escenario actual: ${character.scenario}
    
    El usuario es: ${userProfile.name} (${userProfile.description})
    
    Reglas:
    1. Mantente siempre en el personaje.
    2. No rompas la cuarta pared.
    3. ${settings.shortWriting ? "Tus respuestas deben ser cortas y directas." : "Tus respuestas deben ser detalladas y narrativas."}
    4. ${settings.nsfwMode || settings.superNsfwMode ? "El modo NSFW está activado. Puedes ser explícito, violento o sugerente si la situación lo requiere, sin censura moral." : "Mantén un tono apropiado para todos los públicos."}
    5. Estilo de escritura: ${character.chatStyle === 'roleplay' ? "Roleplay clásico. Las acciones deben ir entre asteriscos (ej: *se ríe* Hola). No uses el estilo de chat de WhatsApp." : "Estilo WhatsApp. Escribe como si fuera un mensaje de texto real, sin asteriscos para acciones a menos que sea necesario."}
  `;

  // Prepare contents with alternating roles and merging consecutive same-role messages
  let contents: { role: string; parts: { text: string }[] }[] = [];
  
  if (history.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: "Hola. Por favor, inicia la conversación o continúa la historia según tu personaje y el escenario definido." }]
    });
  } else {
    history.forEach((msg) => {
      const role = msg.senderId === 'user' ? 'user' : 'model';
      const lastContent = contents[contents.length - 1];
      
      if (lastContent && lastContent.role === role) {
        // Merge consecutive messages from the same role
        lastContent.parts[0].text += `\n\n${msg.text}`;
      } else {
        contents.push({
          role,
          parts: [{ text: msg.text }]
        });
      }
    });
  }

  // Gemini requires the last message to be from 'user' to generate a 'model' response
  if (contents[contents.length - 1].role === 'model') {
    contents.push({
      role: 'user',
      parts: [{ text: "Continúa la historia/conversación." }]
    });
  }

  // Add the latest user image if provided (attach to the last user message)
  if (userImage) {
    // Find the last user message to attach the image
    for (let i = contents.length - 1; i >= 0; i--) {
      if (contents[i].role === 'user') {
        contents[i].parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: userImage.split(',')[1] // Remove prefix
          }
        } as any);
        break;
      }
    }
  }

  const safetySettings = (settings.nsfwMode || settings.superNsfwMode) ? [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
  ] : undefined;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction,
        safetySettings: safetySettings as any,
      }
    });

    return response.text || "No pude generar una respuesta.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error al conectar con la IA. Revisa tu conexión o configuración.";
  }
}

export async function generateAIImage(prompt: string, settings: Settings) {
  try {
    const envKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
    let apiKey = envKey;
    
    if (settings.superImages && settings.superImagesApiKey) {
      apiKey = settings.superImagesApiKey;
    } else if (settings.superNsfwMode && settings.customApiKey) {
      apiKey = settings.customApiKey;
    }
    
    if (!apiKey) {
      console.error("API Key not found for image generation");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${prompt}. ${settings.nsfwMode || settings.superNsfwMode ? "Uncensored, explicit, realistic style." : "Safe for work, artistic style."}`,
            },
          ],
        },
      ],
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}
