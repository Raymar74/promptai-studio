import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from '@google/genai';

// Initialize the Google Gen AI client with the API key from the .env file
const getAiClient = () => {
  const userKey = localStorage.getItem("GEMINI_API_KEY");
  const apiKey = userKey || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

// JSON Schema that matches the exact output we need for the Character Profile
const characterSchema = {
  type: Type.OBJECT,
  properties: {
    nucleo_psicologico: {
      type: Type.OBJECT,
      properties: {
        arquetipo_primario: { type: Type.STRING },
        arquetipo_en_tension: { type: Type.STRING },
        sombra_junguiana: { type: Type.STRING },
        creencia_nuclear: { type: Type.STRING },
        motivacion_visible: { type: Type.STRING },
        motivacion_real: { type: Type.STRING },
        contradiccion_central: { type: Type.STRING },
        mecanismo_defensa_dominante: { type: Type.STRING },
        detonante_de_quiebre: { type: Type.STRING }
      },
      required: ["arquetipo_primario", "arquetipo_en_tension", "sombra_junguiana", "creencia_nuclear", "motivacion_visible", "motivacion_real", "contradiccion_central", "mecanismo_defensa_dominante", "detonante_de_quiebre"]
    },
    psicometria: {
      type: Type.OBJECT,
      properties: {
        ejes_temperamentales: {
          type: Type.OBJECT,
          properties: {
            proactividad: { type: Type.NUMBER }, analiticidad: { type: Type.NUMBER }, sociabilidad: { type: Type.NUMBER },
            hostilidad: { type: Type.NUMBER }, estabilidad_emocional: { type: Type.NUMBER }, brujula_moral: { type: Type.NUMBER }
          }
        },
        traits_expresivos: {
          type: Type.OBJECT,
          properties: {
            carisma: { type: Type.NUMBER }, inteligencia_percibida: { type: Type.NUMBER }, sensualidad: { type: Type.NUMBER },
            irreverencia: { type: Type.NUMBER }, elegancia: { type: Type.NUMBER }, intensidad_humor: { type: Type.NUMBER },
            confianza: { type: Type.NUMBER }, empatia: { type: Type.NUMBER }, agresividad_verbal: { type: Type.NUMBER },
            autenticidad: { type: Type.NUMBER }, vulgaridad_controlada: { type: Type.NUMBER }, dramaturgia_temporal: { type: Type.NUMBER },
            cercania_dialectal: { type: Type.NUMBER }
          }
        }
      }
    },
    voz_y_lenguaje: {
      type: Type.OBJECT,
      properties: {
        tono_general: { type: Type.STRING },
        tono_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        registro: { type: Type.STRING },
        cadencia_sintactica: { type: Type.STRING },
        latiguillos: { type: Type.ARRAY, items: { type: Type.STRING } },
        caracteristicas_habla: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    dialecto: {
      type: Type.OBJECT,
      properties: {
        tipo_dialecto: { type: Type.STRING },
        intensidad: { type: Type.NUMBER },
        caracteristicas: { type: Type.ARRAY, items: { type: Type.STRING } },
        marcadores_obligatorios: { type: Type.ARRAY, items: { type: Type.STRING } },
        exclusiones_dialectales: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    humor: {
      type: Type.OBJECT,
      properties: {
        intensidad: { type: Type.NUMBER },
        tipos_activos: { type: Type.ARRAY, items: { type: Type.STRING } },
        tecnicas: { type: Type.ARRAY, items: { type: Type.STRING } },
        prohibiciones: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    },
    apariencia: {
      type: Type.OBJECT,
      properties: {
        descripcion_fisica: { type: Type.STRING },
        elementos_identitarios: { type: Type.ARRAY, items: { type: Type.STRING } },
        prompt_visual_base: { type: Type.STRING }
      }
    },
    reglas_maestras: {
      type: Type.OBJECT,
      properties: {
        reglas_siempre: { type: Type.ARRAY, items: { type: Type.STRING } },
        reglas_nunca: { type: Type.ARRAY, items: { type: Type.STRING } },
        instruccion_maestra: { type: Type.STRING }
      },
      required: ["reglas_siempre", "reglas_nunca", "instruccion_maestra"]
    },
    dimension_humana: {
      type: Type.OBJECT,
      properties: {
        vicio_defecto: { type: Type.STRING },
        miedo_trauma: { type: Type.STRING },
        peculiaridad_tic: { type: Type.STRING },
        objeto_talisman: { type: Type.STRING }
      },
      required: ["vicio_defecto", "miedo_trauma", "peculiaridad_tic"]
    },
    gesticulacion: {
      type: Type.OBJECT,
      properties: {
        gestos_tipicos: { type: Type.ARRAY, items: { type: Type.STRING } },
        lenguaje_corporal_dominante: { type: Type.STRING },
        prohibiciones_gestuales: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["gestos_tipicos", "lenguaje_corporal_dominante"]
    }
  },
  required: ["nucleo_psicologico", "psicometria", "voz_y_lenguaje", "dialecto", "humor", "apariencia", "reglas_maestras", "dimension_humana", "gesticulacion"],
};

function buildSystemPrompt(draft: any): string {
  return `Eres un perfilador psicológico y diseñador narrativo experto.
Tu tarea es completar la ficha técnica de un personaje sintético (para IA) basado en los datos preliminares proporcionados por el usuario.
Debes crear un personaje tridimensional, con subtexto, contradicciones y una voz única y verosímil.

Datos preliminares provistos:
Nombre: ${draft?.identidad?.nombre || 'Desconocido'}
Edad: ${draft?.identidad?.edad || 'Desconocida'}
Género: ${draft?.identidad?.genero || 'Desconocido'}
Nacionalidad/Región: ${draft?.identidad?.nacionalidad || 'Desconocida'}
Rol/Oficio: ${draft?.identidad?.rol_principal || 'Desconocido'}
Filosofía Declarada: ${draft?.identidad?.filosofia_declarada || 'Desconocida'}

Instrucciones:
1. Completa la psicología profunda, definiendo su arquetipo primario, su sombra junguiana (lo que reprime) y su contradicción central (quiere X pero actúa como si quisiera Y).
2. Genera los "latiguillos" (frases recurrentes) y define claramente su dialecto. OJO: No asumas dialectos mexicanos si es de Argentina (evita "güey", "neta"), ni asumas dialectos de España si es de Colombia. Sé estrictamente fiel a su Nacionalidad/Región.
3. Genera un prompt visual (en inglés) en 'prompt_visual_base' para la generación de avatares fotorealistas basado en su descripción física.
4. Escribe la 'instruccion_maestra': un párrafo síntesis muy potente que servirá como inyección de contexto principal para la IA que emulará a este personaje.`;
}

export async function generateCharacterProfile(draft: any): Promise<any> {
  const ai = getAiClient();
  const systemPrompt = buildSystemPrompt(draft);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Using flash as it is fast and capable enough for this structured task
    contents: [
      { role: 'user', parts: [{ text: "Por favor, completa la ficha del personaje basándote en la información preliminar proporcionada. Devuelve la estructura de datos requerida." }] }
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: characterSchema,
      temperature: 0.7,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    }
  });

  if (!response.text) {
    throw new Error("La IA no devolvió ningún contenido estructurado.");
  }

  // Parse the JSON string output to a JS object
  return JSON.parse(response.text);
}

// --- CONTENT PACK GENERATOR ---

const packSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Título corto e ingenioso del paquete" },
    summary: { type: Type.STRING, description: "Resumen de 1-2 frases del ángulo y por qué funciona" },
    script: {
      type: Type.OBJECT,
      description: "Guion completo del video.",
      properties: {
        hook: { type: Type.STRING, description: "Primeros 3 segundos: gancho irresistible" },
        body: { type: Type.STRING, description: "Desarrollo conversacional con la voz del personaje" },
        punchline: { type: Type.STRING, description: "Cierre con humor/insight memorable" },
        voiceover_full: { type: Type.STRING, description: "Texto completo listo para TTS o lectura, en una sola cadena" },
      },
      required: ["hook", "body", "punchline", "voiceover_full"]
    },
    shots: {
      type: Type.ARRAY,
      description: "Lista de tomas del video con prompts I2V para LTX.",
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.NUMBER },
          duration_seconds: { type: Type.NUMBER },
          prompt_sujeto: { type: Type.STRING, description: "Breve descripción de rasgos físicos, identitarios y personalidad. NO describir el escenario. EN INGLÉS" },
          prompt_visual: { type: Type.STRING, description: "Plano, acciones y escenario. IMPORTANTE: Aclara si habla a cámara ('speaking to the camera') o es voz en off ('voiceover'). Agrega siempre: 'No text, no subtitles, no watermarks'. MANTÉN EL MISMO ENTORNO del cover_image_prompt. EN INGLÉS" },
          prompt_dialogo: { type: Type.STRING, description: "Palabras exactas + (gestos). OBLIGATORIO: Iniciar con la frase 'Subject says: ' antes del guion. EN ESPAÑOL" },
          prompt_sonido: { type: Type.STRING, description: "Cualidades vocales (tono, volumen), sonidos de fondo y OBLIGATORIAMENTE EL WPM. EN INGLÉS" }
        },
        required: ["index", "duration_seconds", "prompt_sujeto", "prompt_visual", "prompt_dialogo", "prompt_sonido"]
      }
    },
    cover_image_prompt: { type: Type.STRING, description: "ÚNICO Prompt de imagen maestro (con LoRA trigger, en inglés). DEBE inspirarse en el guion generado, ESTABLECIENDO EL ENTORNO (Background/Setting) donde ocurrirá TODO el video. Un solo prompt-imagen por guion." },
    cover_i2v_prompt: { type: Type.STRING, description: "Prompt I2V para animar la imagen de portada (en inglés, cámara + acción)" },
    caption: { type: Type.STRING, description: "Caption listo para publicar, corto, moderno, con emojis sutiles." },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hashtags relevantes sin el #" },
  },
  required: ["title", "summary", "script", "shots", "cover_image_prompt", "cover_i2v_prompt", "caption", "hashtags"]
};

function buildContentSystemPrompt(c: any): string {
  // Use the flat `wpm` column (set by editor or extracted from full_profile on save).
  // Falls back to 140 (average conversational WPM) if not set.
  const rawWpm = c.wpm || 140;
  
  return `Eres el director creativo y guionista de "${c.name}", ${c.occupation}.

FICHA RESUMIDA DEL PERSONAJE:
- Tono de voz: ${c.voice_tone}
- Latiguillos típicos: ${c.catchphrases?.length ? c.catchphrases.join(" | ") : "(ninguno definido)"}
- Evitar: ${c.avoid_words?.length ? c.avoid_words.join(", ") : "(ninguno)"}
- Instrucciones Maestras (Intensidad Psicológica): ${c.notes || "(ninguna)"}

CONFIG DE PRODUCCIÓN VISUAL:
- Trigger word del LoRA: "${c.lora_trigger}" (DEBE aparecer al inicio del cover_image_prompt)
- Estilo: ${c.style_words}
- Cámara: ${c.camera_templates}

REGLAS DE ORO (ACTING Y FORMATO):
1. MAYÚSCULAS Y GESTOS: El diálogo DEBE contener gesticulación entre paréntesis (ej: "(resopla)", "(niega lentamente)") y palabras clave en MAYÚSCULAS para énfasis al leer (ej: "No es NADA fácil").
2. PACING (WPM): La velocidad de habla de este personaje es ${rawWpm} palabras por minuto. Se proveerán cálculos en el prompt de usuario.
3. ESTRUCTURA NARRATIVA:
   - Shot 1 (Hook): Gancho irresistible.
   - Shots intermedios (Desarrollo).
   - Shot final (Punchline/Cierre). ¡NUNCA expliques el chiste!
4. ESTRUCTURA I2V (Para SHOTS del Video): Cada toma debe dividirse obligatoriamente en 4 campos (los prompts visual/sonido/sujeto en INGLÉS, el diálogo en ESPAÑOL):
   - prompt_sujeto: Descripción física e identitaria, así como de personalidad. NO describir el escenario. Debe mantenerse estático en todas las tomas.
   - prompt_visual: Tipo de plano, acciones y escenario. IMPORTANTE: Aclara explícitamente cuando el sujeto habla a cámara ("speaking to the camera") y cuando es voz en off ("voiceover"). Añade SIEMPRE la restricción: "no text, no subtitles, no watermarks". TODOS los clips deben transcurrir en el MISMO entorno definido en \`cover_image_prompt\`.
   - prompt_dialogo: Transcripción exacta en ESPAÑOL con (gestos entre paréntesis). OBLIGATORIO: El texto debe iniciar SIEMPRE con la frase exacta "Sujeto dice: " antes del diálogo.
   - prompt_sonido: Control de audio (tono, volumen), sonidos ambientales y OBLIGATORIAMENTE WPM (${rawWpm} wpm).
5. UN SOLO PROMPT DE IMAGEN: Usa \`cover_image_prompt\` para describir la imagen base inspirada en el guion. ESTA IMAGEN DEBE DEFINIR EL ENTORNO (background) de todo el video.
6. CAPTION: Corto, directo, moderno, listo para copiar y pegar.
7. Idioma: Todo el guion, captions y diálogos van en ESPAÑOL. Los prompts para la IA de video o imagen (sujeto, visual, sonido, cover) van en INGLÉS.`;
}

function buildContentUserPrompt(params: any): string {
  const { topic, script_duration, clip_duration, wpm_factor, humor_intensity, hook_hint, character } = params;
  const rawWpm = character.wpm || 140;
  const words_per_clip = Math.round((rawWpm / 60) * wpm_factor * clip_duration);
  
  return `TEMA: ${topic}
DURACIÓN TOTAL DEL VIDEO: ${script_duration}s
INTENSIDAD DE RASGOS PSICOLÓGICOS (Notas extra): ${humor_intensity}/100
${hook_hint ? `GANCHO PEDIDO: ${hook_hint}` : ""}

Genera un VIDEO vertical con múltiples clips.
REGLAS DE DURACIÓN Y DIÁLOGO:
- Cada shot (clip) debe durar alrededor de ${clip_duration}s. NUNCA un clip puede durar menos de 5s. Compensa la duración entre tomas si es necesario para llegar al total aproximado de ${script_duration}s.
- El personaje habla a ${rawWpm} palabras por minuto. Con un factor de seguridad de ${wpm_factor}, debes generar MÁXIMO y APROXIMADAMENTE ${words_per_clip} palabras de diálogo por cada toma de ${clip_duration}s.
- Incluye gestos entre paréntesis y mayúsculas para énfasis en este conteo.
- NO superes este límite de palabras por toma para que el Lip-Sync funcione correctamente y no se acelere la voz.`;
}

export async function generateContentPack(params: any): Promise<any> {
  const ai = getAiClient();
  const systemPrompt = buildContentSystemPrompt(params.character);
  const userPrompt = buildContentUserPrompt(params);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: userPrompt }] }
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: packSchema,
      temperature: 0.7,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    }
  });

  if (!response.text) {
    throw new Error("La IA no devolvió ningún contenido estructurado.");
  }

  return JSON.parse(response.text);
}

