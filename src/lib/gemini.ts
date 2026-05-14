import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { CharacterProfile, Platform, PackContent } from './types';

const getAiClient = () => {
  const userKey = localStorage.getItem("GEMINI_API_KEY");
  const apiKey = userKey || import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// ============================================================
// SCHEMA: Character Profile (Character Forge)
// ============================================================

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

// ============================================================
// SCHEMA: Video / Reel
// ============================================================

const videoPackSchema = {
  type: Type.OBJECT,
  properties: {
    platform: { type: Type.STRING, enum: ["video", "reel"] },
    title: { type: Type.STRING, description: "Título corto e ingenioso" },
    summary: { type: Type.STRING, description: "Resumen de 1-2 frases" },
    preview_html: {
      type: Type.STRING,
      description: "HTML string for Hyperframes Player (1080x1920 vertical). Structure: root div with data-composition-id, data-width=1080, data-height=1920. Each visible text block has class='clip', data-start, data-duration, data-track-index. GSAP timeline registered at window.__timelines['video-preview']. Animations: fade-in/out. Dark gradients background, white text, centered."
    },
    script: {
      type: Type.OBJECT,
      properties: {
        hook: { type: Type.STRING },
        body: { type: Type.STRING },
        punchline: { type: Type.STRING },
        voiceover_full: { type: Type.STRING },
      },
      required: ["hook", "body", "punchline", "voiceover_full"]
    },
    shots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.NUMBER },
          duration_seconds: { type: Type.NUMBER },
          prompt_sujeto: { type: Type.STRING },
          prompt_visual: { type: Type.STRING },
          prompt_dialogo: { type: Type.STRING },
          prompt_sonido: { type: Type.STRING },
        },
        required: ["index", "duration_seconds", "prompt_sujeto", "prompt_visual", "prompt_dialogo", "prompt_sonido"]
      }
    },
    cover_image_prompt: { type: Type.STRING },
    cover_i2v_prompt: { type: Type.STRING },
    caption: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["platform", "title", "summary", "preview_html", "script", "shots", "cover_image_prompt", "cover_i2v_prompt", "caption", "hashtags"]
};

// ============================================================
// SCHEMA: Carousel
// ============================================================

const carouselPackSchema = {
  type: Type.OBJECT,
  properties: {
    platform: { type: Type.STRING, enum: ["carousel"] },
    title: { type: Type.STRING, description: "Título corto e ingenioso" },
    summary: { type: Type.STRING, description: "Resumen de 1-2 frases" },
    preview_html: {
      type: Type.STRING,
      description: "HTML string for Hyperframes Player (Carrusel 1080x1080 square). Structure: root div with data-composition-id, data-width=1080, data-height=1080. Each slide as div with class='clip', data-start, data-duration (4s), data-track-index. GSAP timeline registered at window.__timelines['carousel-preview'] with repeat=-1. Transitions between slides: fade/slide/scale. Dark gradients per slide."
    },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.NUMBER },
          image_prompt: { type: Type.STRING, description: "Prompt de imagen para este slide (EN INGLÉS). Debe mantener coherente con el personaje y el entorno." },
          overlay_text: { type: Type.STRING, description: "Texto superpuesto en la imagen (EN ESPAÑOL). Frase corta y contundente." },
          alt_text: { type: Type.STRING, description: "Texto alternativo / descripción para accesibilidad." },
        },
        required: ["index", "image_prompt", "overlay_text", "alt_text"]
      }
    },
    cover_image_prompt: { type: Type.STRING, description: "Prompt maestro de imagen (con LoRA trigger). Define el personaje y el entorno que se repite en TODOS los slides." },
    caption: { type: Type.STRING, description: "Caption principal del carrusel." },
    first_comment: { type: Type.STRING, description: "Primer comentario fijado (para engagement)." },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["platform", "title", "summary", "preview_html", "slides", "cover_image_prompt", "caption", "hashtags"]
};

// ============================================================
// SCHEMA: Thread
// ============================================================

const threadPackSchema = {
  type: Type.OBJECT,
  properties: {
    platform: { type: Type.STRING, enum: ["thread"] },
    title: { type: Type.STRING, description: "Título corto e ingenioso" },
    summary: { type: Type.STRING, description: "Resumen de 1-2 frases" },
    posts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          index: { type: Type.NUMBER },
          content: { type: Type.STRING, description: "Contenido del post (EN ESPAÑOL). Máximo 280 caracteres, tono conversacional del personaje." },
          is_hook: { type: Type.BOOLEAN, description: "Es el hook / gancho inicial." },
          is_cta: { type: Type.BOOLEAN, description: "Es CTA / llamado a la acción final." },
          media_prompt: { type: Type.STRING, description: "Prompt de imagen (si incluye media en este post (opcional)." },
        },
        required: ["index", "content"]
      }
    },
    cover_image_prompt: { type: Type.STRING, description: "Prompt de imagen para el primer post (opcional, en INGLÉS)." },
    caption: { type: Type.STRING, description: "Texto adicional para pegar como caption o hilo alternativo." },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["platform", "title", "summary", "posts", "caption", "hashtags"]
};

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function buildBaseSystemPrompt(c: CharacterProfile): string {
  const fullProfile = c.full_profile || {};
  const name = c.name || 'Personaje';
  const occupation = c.occupation || 'creador de contenido';
  const voiceTone = c.voice_tone || 'neutral';
  const catchphrases = c.catchphrases || [];
  const avoidWords = c.avoid_words || [];
  const wpm = c.wpm || 150;
  const loraTrigger = c.lora_trigger || '';
  const styleWords = c.style_words || '';
  const cameraTemplates = c.camera_templates || '';
  const notes = c.notes || '';

  const psicometria = fullProfile.psicometria || {};
  const ejes = psicometria.ejes_temperamentales || {};
  const traits = psicometria.traits_expresivos || {};
  const nucleo = fullProfile.nucleo_psicologico || {};
  const reglas = fullProfile.reglas_maestras || {};
  const rulesAlways = reglas.reglas_siempre || [];
  const rulesNever = reglas.reglas_nunca || [];
  const dimensionHumana = fullProfile.dimension_humana || {};

  const hasRichProfile = !!(
    nucleo.arquetipo_primario ||
    Object.keys(ejes).length > 0 ||
    Object.keys(traits).length > 0 ||
    rulesAlways.length > 0 ||
    rulesNever.length > 0
  );

  let systemPrompt = `Eres el director creativo y guionista de "${name}", ${occupation}.

FICHA RESUMIDA DEL PERSONAJE:
- Tono de voz: ${voiceTone}
- Latiguillos típicos: ${catchphrases.length ? catchphrases.join(' | ') : '(ninguno definido)'}
- Evitar: ${avoidWords.length ? avoidWords.join(', ') : '(ninguno)'}
- Velocidad de habla: ${wpm} palabras por minuto

`;

  if (hasRichProfile) {
    if (nucleo.arquetipo_primario) {
      systemPrompt += `
NÚCLEO PSICOLÓGICO:
- Arquetipo primario: ${nucleo.arquetipo_primario}
`;
      if (nucleo.arquetipo_en_tension) {
        systemPrompt += `- Arquetipo en tensión: ${nucleo.arquetipo_en_tension}\n`;
      }
      if (nucleo.sombra_junguiana) {
        systemPrompt += `- Sombra junguiana: ${nucleo.sombra_junguiana}\n`;
      }
      if (nucleo.creencia_nuclear) {
        systemPrompt += `- Creencia nuclear: "${nucleo.creencia_nuclear}"\n`;
      }
      if (nucleo.motivacion_visible) {
        systemPrompt += `- Motivación visible: ${nucleo.motivacion_visible}\n`;
      }
      if (nucleo.motivacion_real) {
        systemPrompt += `- Motivación REAL (subtexto): ${nucleo.motivacion_real}\n`;
      }
      if (nucleo.contradiccion_central) {
        systemPrompt += `- Contradicción central: ${nucleo.contradiccion_central}\n`;
      }
      if (nucleo.mecanismo_defensa_dominante) {
        systemPrompt += `- Mecanismo de defensa dominante: ${nucleo.mecanismo_defensa_dominante}\n`;
      }
      if (nucleo.detonante_de_quiebre) {
        systemPrompt += `- Detonante de quiebre: ${nucleo.detonante_de_quiebre}\n`;
      }
    }

    const hasPsicometria = ejes.proactividad !== undefined || traits.carisma !== undefined;
    if (hasPsicometria) {
      systemPrompt += `
PSICOMETRÍA (0-100):

EJES TEMPERAMENTALES:
- Proactividad: ${ejes.proactividad ?? 'N/A'} (0=pasivo, 100=proactivo)
- Analiticidad: ${ejes.analiticidad ?? 'N/A'} (0=impulsivo, 100=analítico)
- Sociabilidad: ${ejes.sociabilidad ?? 'N/A'} (0=introvertido, 100=extravertido)
- Hostilidad: ${ejes.hostilidad ?? 'N/A'} (0=abierto/amistoso, 100=hostil/desafiante)
- Estabilidad emocional: ${ejes.estabilidad_emocional ?? 'N/A'} (0=volátil, 100=estoico)
- Brújula moral: ${ejes.brujula_moral ?? 'N/A'} (0=caótico, 100=honorable/principista)

TRAITS EXPRESIVOS:
- Carisma: ${traits.carisma ?? 'N/A'}
- Inteligencia percibida: ${traits.inteligencia_percibida ?? 'N/A'}
- Sensualidad: ${traits.sensualidad ?? 'N/A'}
- Irreverencia: ${traits.irreverencia ?? 'N/A'}
- Elegancia: ${traits.elegancia ?? 'N/A'}
- Intensidad de humor: ${traits.intensidad_humor ?? 'N/A'}
- Confianza: ${traits.confianza ?? 'N/A'}
- Empatía: ${traits.empatia ?? 'N/A'}
- Agresividad verbal: ${traits.agresividad_verbal ?? 'N/A'}
- Autenticidad: ${traits.autenticidad ?? 'N/A'}
- Vulgaridad controlada: ${traits.vulgaridad_controlada ?? 'N/A'}
- Dramaturgia temporal: ${traits.dramaturgia_temporal ?? 'N/A'}
- Cercanía dialectal: ${traits.cercania_dialectal ?? 'N/A'}

USA ESTOS VALORES para modular la personalidad en el contenido generado.
`;
    }

    if (rulesAlways.length > 0 || rulesNever.length > 0) {
      systemPrompt += `
REGLAS ABSOLUTAS:

`;
      if (rulesAlways.length > 0) {
        systemPrompt += `SIEMPRE DEBE:
${rulesAlways.map(rule => `- ${rule}`).join('\n')}

`;
      }
      if (rulesNever.length > 0) {
        systemPrompt += `NUNCA DEBE:
${rulesNever.map(rule => `- ${rule}`).join('\n')}

`;
      }
    }

    if (dimensionHumana.vicio_defecto || dimensionHumana.miedo_trauma) {
      systemPrompt += `
DIMENSIÓN HUMANA (toques de humanidad):
`;
      if (dimensionHumana.vicio_defecto) {
        systemPrompt += `- Vicio/Defecto: ${dimensionHumana.vicio_defecto}\n`;
      }
      if (dimensionHumana.miedo_trauma) {
        systemPrompt += `- Miedo/Trauma: ${dimensionHumana.miedo_trauma}\n`;
      }
      if (dimensionHumana.peculiaridad_tic) {
        systemPrompt += `- Peculiaridad/Tic: ${dimensionHumana.peculiaridad_tic}\n`;
      }
      if (dimensionHumana.objeto_talisman) {
        systemPrompt += `- Objeto talismán: ${dimensionHumana.objeto_talisman}\n`;
      }
    }

    if (reglas.instruccion_maestra) {
      systemPrompt += `
INSTRUCCIÓN MAESTRA:
${reglas.instruccion_maestra}

`;
    }
  } else if (notes) {
    systemPrompt += `
INSTRUCCIONES MAESTRAS (Fallback - personaje sin perfil psicométrico completo):
${notes}

`;
  }

  systemPrompt += `
CONFIG DE PRODUCCIÓN VISUAL:
- Trigger word del LoRA: "${loraTrigger}"
- Estilo visual: ${styleWords}
- Cámara: ${cameraTemplates}

REGLAS DE ORO:
1. El personaje habla en ESPAÑOL.
2. La voz, dialecto y personalidad deben ser CONSISTENTES en TODO el contenido.
3. Usa la PSICOMETRÍA y el NÚCLEO PSICOLÓGICO para modular tono, elecciones de palabras, y decisiones narrativas.
4. Idioma: Todo el guion, captions y diálogos van en ESPAÑOL.
   Los prompts para la IA de video o imagen van en INGLÉS.
`;

  return systemPrompt;
}

function buildVideoSystemPrompt(c: CharacterProfile, rawWpm: number): string {
  return `${buildBaseSystemPrompt(c)}

REGLAS ESPECÍFICAS PARA VIDEO:

ESTRUCTURA I2V (Para SHOTS del Video):
Cada toma debe dividirse obligatoriamente en 4 campos:

- prompt_sujeto: Descripción física e identitaria, así como de personalidad. NO describir el escenario. Debe mantenerse ESTÁTICO en todas las tomas. EN INGLÉS.

- prompt_visual: Tipo de plano, acciones y escenario. IMPORTANTE: Aclara explícitamente cuando el sujeto habla a cámara ("speaking to the camera") y cuando es voz en off ("voiceover"). Añade SIEMPRE la restricción: "no text, no subtitles, no watermarks". TODOS los clips deben transcurrir en el MISMO entorno definido en cover_image_prompt. EN INGLÉS.

- prompt_dialogo: Transcripción exacta en ESPAÑOL con (gestos entre paréntesis). OBLIGATORIO: Iniciar con "Sujeto dice: " antes del diálogo. MAYÚSCULAS para énfasis.

- prompt_sonido: Control de audio (tono, volumen), sonidos ambientales y OBLIGATORIAMENTE WPM (${rawWpm} wpm). EN INGLÉS.

OTRAS REGLAS:

1. MAYÚSCULAS Y GESTOS: El diálogo DEBE contener gesticulación entre paréntesis (ej: "(resopla)", "(niega lentamente)") y palabras clave en MAYÚSCULAS para énfasis al leer (ej: "No es NADA fácil").

2. PACING: La velocidad de habla es ${rawWpm} palabras por minuto.

3. ESTRUCTURA NARRATIVA:
   - Shot 1 (Hook): Gancho irresistible.
   - Shots intermedios (Desarrollo).
   - Shot final (Punchline/Cierre). ¡NUNCA expliques el chiste!

4. UN SOLO PROMPT DE IMAGEN: Usa cover_image_prompt para describir la imagen base inspirada en el guion. ESTA IMAGEN DEBE DEFINIR EL ENTORNO (background) de todo el video.

5. PREVIEW_HTML OBLIGATORIO:
   - Además de los prompts, DEBES generar un preview_html COMPLETO para Hyperframes.
   - Resolución: 1080x1920 VERTICAL (formato reel).
   - Cada shot del guion debe aparecer como un bloque de texto animado.
   - Usa los diálogos (prompt_dialogo) como el texto de cada shot.
   - Usa GSAP para animaciones: fade-in, fade-out, slide-up, scale.
   - Colorea el texto según la personalidad: rojo para hostilidad/conflicto, azul para calma/reflexión, verde para humor/alegría, naranja para energía.
   - Gradientes modernos de fondo (oscuros: slate, azul, morado).
   - Texto GRANDE (56px-80px) y alto contraste.
   - Timeline registrada en window.__timelines["video-preview"].
   - TODO EL TEXTO DEL GUION (hook, body, punchline, cada prompt_dialogo de shot) debe aparecer animado.
   - EJEMPLO DE ESTRUCTURA (usa patron similar, NO copies el texto exacto):
     <div data-composition-id="video-preview" data-width="1080" data-height="1920" data-start="0"
       style="background:linear-gradient(135deg,#0f172a,#1e293b);width:100%;height:100%;overflow:hidden;position:relative;font-family:system-ui,sans-serif">
       <div class="clip" data-start="0" data-duration="5" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:48px">
         <div id="t1" style="color:white;font-size:72px;font-weight:900;text-align:center">TEXTO DEL HOOK AQUI</div>
       </div>
     </div>
     <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
     <script>
       const tl = gsap.timeline({paused:true});
       // animate cada fragmento con fade+slide
       window.__timelines = window.__timelines || {};
       window.__timelines["video-preview"] = tl;
     </script>`;
}

function buildCarouselSystemPrompt(c: CharacterProfile): string {
  return `${buildBaseSystemPrompt(c)}

REGLAS ESPECÍFICAS PARA CARRUSEL DE INSTAGRAM:

Un carrusel es una serie de imágenes donde el personaje "habla" a través de texto superpuesto en las imágenes.

ESTRUCTURA:

1. Slide 1 (Hook): Imagen impactante + texto superpuesto con la pregunta o afirmación contundente que enganche.

2. Slides intermedios: Cada slide desarrolla un punto del tema. Imagen coherente con el personaje + texto superpuesto con la idea.

3. Slide final (CTA): Llamado a la acción: ¿Qué opinas tú?, Comenta, Guarda, Comparte.

REGLAS DE CONTENIDO:

- overlay_text: Frase CORTA (máximo 2 líneas), DIRECTA, con la voz del personaje. Usa emojis sutiles si va con la personalidad.

- image_prompt: EN INGLÉS. Debe ser CONSISTENTE en TODO el carrusel. Mismo personaje, mismo entorno, misma iluminación.

- cover_image_prompt: Prompt MAESTRO que define el personaje y el entorno que se repite. INGLÉS.

REGLAS DE IDIOMA:

- overlay_text, caption, first_comment: ESPAÑOL.
- image_prompt, cover_image_prompt: INGLÉS.

El LoRA trigger "${c.lora_trigger}" debe aparecer SIEMPRE al inicio de TODOS los image_prompt.

6. PREVIEW_HTML OBLIGATORIO PARA CARRUSEL:
   - Además de los slides, DEBES generar un preview_html COMPLETO para Hyperframes.
   - Resolución: 1080x1080 CUADRADO.
   - Cada slide debe aparecer con su overlay_text como texto animado grande.
   - Transiciones distintas entre cada slide: fade, slide-right, slide-left, scale-up, zoom.
   - Repetición infinita (repeat: -1).
   - Cada slide dura ~4 segundos con 0.5s de transición.
   - Gradientes de fondo distintos por slide (pero mismo tono general).
   - Timeline registrada en window.__timelines["carousel-preview"].
   - EJEMPLO DE ESTRUCTURA:
     <div data-composition-id="carousel-preview" data-width="1080" data-height="1080" data-start="0"
       style="background:linear-gradient(135deg,#0f172a,#1e293b);width:100%;height:100%;overflow:hidden;position:relative;font-family:system-ui,sans-serif">
       <div class="clip" data-start="0" data-duration="4" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:80px">
         <div id="s1" style="color:white;font-size:64px;font-weight:900;text-align:center">TEXTO OVERLAY SLIDE 1</div>
       </div>
       <div class="clip" data-start="4" data-duration="4" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:80px">
         <div id="s2" style="color:#38bdf8;font-size:56px;font-weight:800;text-align:center">TEXTO OVERLAY SLIDE 2</div>
       </div>
     </div>
     <script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
     <script>
       const tl = gsap.timeline({paused:true,repeat:-1});
       // animate cada slide
       window.__timelines = window.__timelines || {};
       window.__timelines["carousel-preview"] = tl;
     </script>`;
}

function buildThreadSystemPrompt(c: CharacterProfile): string {
  return `${buildBaseSystemPrompt(c)}

REGLAS ESPECÍFICAS PARA HILO (THREAD) DE X / LINKEDIN:

Un hilo es una secuencia de posts donde el personaje habla directamente.

ESTRUCTURA:

- Post 1 (Hook): Pregunta o afirmación CONTUNDENTE. Máximo impacto.

- Posts intermedios: Cada post desarrolla un punto. Tono conversacional.

- Post final (CTA): Llamado a la acción: Pregunta para generar respuestas, o ¿Cuál es tu experiencia?

REGLAS DE CONTENIDO:

- content: Cada post es ÚNICO idea o 2 ideas. Máximo 280 caracteres. Voz del personaje, dialecto, latiguillos.

- is_hook: true SOLO el primer post.

- is_cta: true SOLO el último post.

- media_prompt: (opcional) Prompt de imagen EN INGLÉS si el post incluye imagen.

REGLAS DE IDIOMA:

- content, caption: ESPAÑOL.
- media_prompt: INGLÉS.

Tono: Conversacional, como si el personaje realmente estuviera escribiendo. Usa MAYÚSCULAS para énfasis, (gestos o paréntesis) si va con la personalidad.`;
}

// ============================================================
// FUNCIONES DE GENERACIÓN
// ============================================================

function buildCharacterSystemPrompt(draft: any): string {
  return `Eres un perfilador psicológico y diseñador narrativo experto.
Tu tarea es completar la ficha técnica de un personaje sintético.

Datos preliminares:
Nombre: ${draft?.identidad?.nombre || 'Desconocido'}
Edad: ${draft?.identidad?.edad || 'Desconocida'}
Género: ${draft?.identidad?.genero || 'Desconocido'}
Nacionalidad: ${draft?.identidad?.nacionalidad || 'Desconocida'}
Rol: ${draft?.identidad?.rol_principal || 'Desconocido'}
Filosofía: ${draft?.identidad?.filosofia_declarada || 'Desconocida'}

Instrucciones:
1. Completa la psicología profunda (arquetipos, sombra junguiana, contradicción central.
2. Genera latiguillos y dialecto FIEL a su Nacionalidad/Región.
3. Genera prompt_visual_base EN INGLÉS.
4. Escribe instruccion_maestra: párrafo síntesis potente.`;
}

export async function generateCharacterProfile(draft: any): Promise<any> {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: "Completa la ficha del personaje." }] }
    ],
    config: {
      systemInstruction: buildCharacterSystemPrompt(draft),
      responseMimeType: "application/json",
      responseSchema: characterSchema,
      temperature: 0.7,
      safetySettings,
    }
  });

  if (!response.text) throw new Error("La IA no devolvió contenido.");
  return JSON.parse(response.text);
}

// ============================================================
// FUNCIONES DE CONTENIDO MULTIPLATAFORMA
// ============================================================

interface VideoParams {
  platform: 'video' | 'reel';
  character: CharacterProfile;
  topic: string;
  script_duration: number;
  clip_duration: number;
  wpm_factor: number;
  humor_intensity: number;
  hook_hint?: string;
}

interface CarouselParams {
  platform: 'carousel';
  character: CharacterProfile;
  topic: string;
  slides_count: number;
  humor_intensity: number;
  hook_hint?: string;
}

interface ThreadParams {
  platform: 'thread';
  character: CharacterProfile;
  topic: string;
  posts_count: number;
  humor_intensity: number;
  hook_hint?: string;
}

type GenerateParams = VideoParams | CarouselParams | ThreadParams;

function isVideoParams(p: GenerateParams): p is VideoParams {
  return p.platform === 'video' || p.platform === 'reel';
}

function isCarouselParams(p: GenerateParams): p is CarouselParams {
  return p.platform === 'carousel';
}

function isThreadParams(p: GenerateParams): p is ThreadParams {
  return p.platform === 'thread';
}

function calculateDynamicTemperature(intensity: number): number {
  if (intensity <= 30) return 0.4;
  if (intensity <= 60) return 0.7;
  return 0.95;
}

function buildIntensityInstructions(intensity: number): string {
  if (intensity <= 30) {
    return `INTENSIDAD PSICOLÓGICA: ${intensity}/100 (BAJA / CONSERVADOR)

- Mantente FIEL al personaje. No exageres.
- La personalidad debe ser SUTIL y AUTÉNTICA.
- No fuerces el humor ni los rasgos extremos.
- Comunicación natural y creíble.`;
  } else if (intensity <= 60) {
    return `INTENSIDAD PSICOLÓGICA: ${intensity}/100 (MEDIA / BALANCEADA)

- Balance entre fidelidad al personaje y expresividad.
- Los rasgos psicométricos deben guiar las decisiones.
- Humor y expresión acordes a la personalidad base.`;
  } else {
    return `INTENSIDAD PSICOLÓGICA: ${intensity}/100 (ALTA / EXAGERADA)

- EXAGERA los rasgos del personaje.
- Si la irreverencia es alta, sé más irreverente.
- Si la hostilidad es alta, sé más desafiante.
- Si el humor es alto, sé más gracioso.
- Amplifica la voz, el dialecto, y las elecciones de palabras.
- MANTÉN la COHERENCIA con el núcleo psicológico — solo amplifícalo.`;
  }
}

export async function generateContentPack(params: GenerateParams): Promise<PackContent> {
  const ai = getAiClient();
  const { character, humor_intensity, hook_hint } = params;
  const rawWpm = character.wpm || 140;
  const dynamicTemperature = calculateDynamicTemperature(humor_intensity);
  const intensityInstructions = buildIntensityInstructions(humor_intensity);

  let systemPrompt: string;
  let userPrompt: string;
  let schema: any;

  if (isVideoParams(params)) {
    const { script_duration, clip_duration, wpm_factor } = params;
    const words_per_clip = Math.round((rawWpm / 60) * wpm_factor * clip_duration);
    
    systemPrompt = buildVideoSystemPrompt(character, rawWpm);
    userPrompt = `
PLATAFORMA: ${params.platform.toUpperCase()}
TEMA: ${params.topic}
DURACIÓN TOTAL: ${script_duration}s
DURACIÓN POR CLIP: ${clip_duration}s

${intensityInstructions}
${hook_hint ? `GANCHO ESPECÍFICO A INTEGRAR: ${hook_hint}` : ''}

REGLAS:
- Cada shot dura ~${clip_duration}s.
- Máximo ${words_per_clip} palabras de diálogo por shot (lip-sync).
- Incluye gestos y mayúsculas para énfasis.
- Usa la PSICOMETRÍA y el NÚCLEO PSICOLÓGICO para cada elección.

Genera el contenido completo.`;
    schema = videoPackSchema;
    
  } else if (isCarouselParams(params)) {
    systemPrompt = buildCarouselSystemPrompt(character);
    userPrompt = `
PLATAFORMA: CARRUSEL
TEMA: ${params.topic}
CANTIDAD DE SLIDES: ${params.slides_count}

${intensityInstructions}
${hook_hint ? `GANCHO ESPECÍFICO A INTEGRAR: ${hook_hint}` : ''}

REGLAS:
- Slide 1: Hook impactante.
- Slides del medio: Desarrollo del tema.
- Slide final: CTA.
- TODOS los image_prompt deben incluir el LoRA trigger "${character.lora_trigger}" al inicio.
- Usa la PSICOMETRÍA para el overlay_text y las decisiones narrativas.

Genera el carrusel completo.`;
    schema = carouselPackSchema;

  } else {
    systemPrompt = buildThreadSystemPrompt(character);
    userPrompt = `
PLATAFORMA: HILO (THREAD)
TEMA: ${params.topic}
CANTIDAD DE POSTS: ${params.posts_count}

${intensityInstructions}
${hook_hint ? `GANCHO ESPECÍFICO A INTEGRAR: ${hook_hint}` : ''}

REGLAS:
- Post 1 (Hook): máximo impacto.
- Posts intermedios: desarrollo.
- Post final (CTA): pregunta o llamado a la acción.
- Tono conversacional, como si el personaje realmente escribe.
- Cada post debe reflejar la PSICOMETRÍA y el NÚCLEO PSICOLÓGICO.

Genera el hilo completo.`;
    schema = threadPackSchema;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      { role: 'user', parts: [{ text: userPrompt }] }
    ],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: dynamicTemperature,
      safetySettings,
    }
  });

  if (!response.text) throw new Error("La IA no devolvió contenido.");
  return JSON.parse(response.text);
}
