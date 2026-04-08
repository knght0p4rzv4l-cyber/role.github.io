import { Character, Message, Settings, UserProfile } from "../types";

const getApiKey = (settings: Settings) => {
  // Safer way to access env vars in Vite/Browser environments
  let envKey: string | undefined;
  try {
    // Try Vite's import.meta.env first
    envKey = (import.meta as any).env?.VITE_DEEPSEEK_API_KEY;
    
    // Fallback to process.env if defined (Vite's define plugin might have set this)
    if (!envKey && typeof process !== 'undefined' && process.env) {
      envKey = process.env.DEEPSEEK_API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing environment variables:", e);
  }
  
  return settings.superNsfwMode && settings.customApiKey ? settings.customApiKey : envKey;
};

export async function generateAIResponse(
  character: Character,
  history: Message[],
  userProfile: UserProfile,
  settings: Settings
) {
  try {
    const apiKey = getApiKey(settings);
    
    if (!apiKey) {
      return "⚠️ API Key de DeepSeek no encontrada. Asegúrate de haber configurado la variable de entorno DEEPSEEK_API_KEY en Vercel.";
    }

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

    const messages = [
      { role: "system", content: systemInstruction }
    ];

    if (history.length === 0) {
      messages.push({
        role: "user",
        content: "Hola. Por favor, inicia la conversación o continúa la historia según tu personaje y el escenario definido."
      });
    } else {
      history.forEach((msg) => {
        messages.push({
          role: msg.senderId === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    // Ensure last message is from user if we want a response
    if (messages[messages.length - 1].role === 'assistant') {
      messages.push({
        role: "user",
        content: "Continúa la historia/conversación."
      });
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 1.0,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error en la API de DeepSeek");
    }

    const data = await response.json();
    return data.choices[0].message.content || "No pude generar una respuesta.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error al conectar con DeepSeek. Revisa tu conexión o API Key.";
  }
}

export async function generateAIImage(prompt: string, settings: Settings) {
  // DeepSeek doesn't support image generation, keeping a placeholder or using a free alternative if needed
  // For now, we'll return null as DeepSeek is text-only
  console.warn("DeepSeek does not support image generation.");
  return null;
}
