# PromptAI Studio — Estado del Proyecto y Hoja de Ruta

## Estado Actual (Mayo 2026)

El proyecto está en **producción activa** en Vercel. Las funcionalidades core están implementadas y funcionando.

---

## Qué está construido y funcionando

### ✅ Autenticación
- Login/registro con Supabase Auth (email/password).
- Guard de rutas privadas (`RequireAuth`).

### ✅ Gestión de Personajes
- **Guardar borrador:** Guarda perfiles incompletos como borradores en Supabase (columna `is_draft`).
- **Character Forge (Wizard):** 5 pasos para construir un perfil psicológico completo.
  - Paso 1: Identidad base (nombre, edad, género, nacionalidad, rol, filosofía).
  - Paso 2: Psicología profunda (arquetipos junguianos, sombra, motivación real vs visible).
  - Paso 3: Voz, dialecto y humor.
  - Paso 4: Apariencia y producción.
  - Paso 5: Reglas maestras (siempre/nunca + instrucción maestra).
  - **Autocompletar con IA:** Gemini deduce psicología, latiguillos, dialecto, prompt visual e instrucción maestra a partir de la identidad base.
- **Editor manual:** Formulario completo para editar todos los campos de un personaje.
- Subida de imagen de referencia al bucket `character-refs` de Supabase Storage.
- Análisis de imagen con Gemini para generar descripción visual.
- Galería de personajes con thumbnails y avatares.

### ✅ Generador de Paquetes de Contenido
- **Multi-plataforma:** Genera paquetes para 3 formatos:
  - **Reel/Video:** Guion + Shots I2V (formato tradicional)
  - **Carrusel:** Slides con `image_prompt`, `overlay_text`, `alt_text`
  - **Hilo (X/LinkedIn):** Posts con `content`, `is_hook`, `is_cta`
- **Previsualización Hyperframes (NUEVO):** Ahora genera **preview_html** para visualización instantánea en navegador:
  - **Reel/Video:** 1080x1920 vertical con animaciones GSAP
  - **Carrusel:** 1080x1080 cuadrado con transiciones entre slides
  - Componente `<HyperframesPreview>` en `PackDetail.tsx` (tab "Preview" por defecto)
- **Estrategia de render (Backup:** Hyperframes para preview + Remotion como backup para futuro render final.
- Selección de personaje activo.
- Configuración de tema, duraciones (total y por clip), Factor WPM y Intensidad de Rasgos Psicológicos.
- Generación de paquetes vía Gemini 2.5 Flash con JSON estructurado.
- Guardado automático en Supabase → redirección a vista detallada.

### ✅ Biblioteca y Vista de Packs
- Lista de todos los packs generados.
- Vista detallada con pestañas: Guion / Shots / Producción.
- Botón copiar en cada bloque de prompt.
- Reintentar generación (pasa parámetros por query string).
- Marcar como publicado con fecha y link.

### ✅ Ajustes
- Gestión de API Key de Gemini almacenada en `localStorage`.
- La clave del usuario tiene prioridad sobre la del `.env`.

### ✅ Feedback
- Modal flotante integrado que envía a Formspree (idea / bug / otro).

---

## Pendiente / Próximos pasos

### Prioridad alta
- [x] **Soporte multi-plataforma en el generador:** Genera paquetes para Reel/Video, Carrusel de Instagram, e Hilo de Twitter/X.
- [x] **Guardar borrador en Character Forge:** Guarda perfiles incompletos como borradores en Supabase (columna `is_draft`).
- [x] **FASE 1 — `buildBaseSystemPrompt()` lee `full_profile` JSONB:** Ahora el motor de IA usa TODOS los bloques del schema:
  - ✅ `nucleo_psicologico` (arquetipos, sombra, contradicción central)
  - ✅ `psicometria` (19 valores numéricos 0–100)
  - ✅ `reglas_maestras` como directivas estructuradas
  - ✅ `dimension_humana` (vicios, miedos, tics)
  - ✅ Temperatura DINÁMICA según slider de intensidad
- [x] **PREVIEW HYPERFRAMES:** Previsualización instantánea de Reels y Carruseles en el navegador usando `@hyperframes/player`.
  - ✅ Generación de `preview_html` en schemas `videoPackSchema` y `carouselPackSchema`
  - ✅ Componente `<HyperframesPreview>` con controles (play/pause/restart)
  - ✅ Integración en `PackDetail.tsx` (tab "Preview" por defecto)
  - ✅ Estrategia: Hyperframes para preview + Remotion como backup para render futuro
- [ ] **Verificación del sistema de Feedback:** Confirmar que el endpoint de Formspree esté activo y recibiendo mensajes en producción.

### Prioridad media
- [ ] **Regenerar partes sueltas de un pack:** "Regenérame solo el hook" o "Dame 3 versiones del punchline" desde PackDetail.
- [ ] **Soporte multi-personaje en PackDetail:** Mostrar el nombre del personaje vinculado y enlace a su perfil.
- [ ] **Calendario editorial:** Vista de packs publicados por fecha.

### Backlog / Futuro
- [ ] Generación de variaciones A/B del hook.
- [ ] Análisis de temas que funcionan mejor (basado en packs marcados como publicados).
- [ ] Conector con Buffer/Metricool para publicar directamente.
- [ ] Exportar pack completo como PDF o ZIP.
- [ ] Soporte para imágenes en carruseles (prompts de imagen por slide).

---

## Detalles técnicos actuales

- **Frontend**: React 18 + TypeScript + Vite 5.
- **UI**: TailwindCSS 3 + Shadcn/UI (Radix). Estética glassmorphism oscuro con acento ámbar/cobre.
- **BD**: Supabase PostgreSQL. Tablas: `character_profiles`, `content_packs`, `feedback`, `character_history`.
- **Storage**: Buckets `character-refs` (imágenes) y `character-voices` (audios).
- **IA**: `@google/genai` v2 · `gemini-2.5-flash`. Corre 100% en el cliente (sin Edge Functions).
- **Previsualización**: `@hyperframes/player` Web Component para previews de HTML → video en navegador.
- **Temperatura IA**: Dinámica según "Intensidad de Rasgos Psicológicos":
  - 0–30 → `0.4` (conservador)
  - 40–60 → `0.7` (balance)
  - 70–100 → `0.95` (exagerado)
- **Deploy**: Vercel con rewrite SPA. Repo: `Raymar74/promptai-studio`.
- **Feedback**: Formspree `mjglpwow`.

---

## Lecciones Aprendidas (FASE 1)

### Problema 1: `full_profile` JSONB no se usaba
- **Síntoma**: El Character Forge captura 12 bloques de datos psicológicos, pero `buildBaseSystemPrompt()` solo leía ~10% de la información (campos planos + `notes` como texto plano).
- **Causa**: El campo `full_profile` existía en la BD pero nadie lo leía.
- **Solución**: Refactorizar `buildBaseSystemPrompt()` para extraer y usar TODOS los bloques del `full_profile` JSONB.

### Problema 2: Índice `[0]` vs `[1]` en Storage Policies
- **Síntoma**: El bucket `character-voices` fallaba con "row-level security policy" mientras que `character-refs` funcionaba.
- **Causa**: `storage.foldername(name)` devuelve un array donde el `user_id` está en el índice `[1]`, no `[0]`. El bucket `character-refs` usaba `[1]` (correcto), pero `character-voices` usaba `[0]` (incorrecto).
- **Solución**: Cambiar todas las policies de `character-voices` para usar el índice `[1]`.

### Problema 3: Slider "Intensidad Psicológica" no hacía nada
- **Síntoma**: El slider aparecía en la UI y se guardaba en `humor_intensity`, pero no modificaba NINGÚN parámetro real.
- **Solución**: 
  1. Ahora el valor se inyecta en el user prompt con instrucciones explícitas.
  2. Ahora modifica la **temperatura** de Gemini dinámicamente.

### El Diferencial: Psicometría Numérica
Lo que hace único a PromptAI Studio es que **no solo describe la personalidad con texto** (arquetipos, sombra, contradicción), sino que **cuantifica la personalidad con 19 valores numéricos** (6 ejes temperamentales + 13 traits expresivos) en escala 0–100.

**ANTES**: Esta psicometría se guardaba pero NUNCA se usaba.
**AHORA**: Llega directamente al system prompt como datos estructurados, y Gemini puede interpolar estos valores en cualquier situación.

---

## Lo que la app NO hace (aclaración de scope)

- **NO genera videos finales MP4** — entrega:
  1. ✅ **Prompts** para el pipeline del usuario (ComfyUI, LTX, Runway, Luma...).
  2. ✅ **Previsualizaciones Hyperframes** (HTML animado con texto y transiciones) para ver la estructura instantáneamente.
- No publica en redes automáticamente.
- No entrena ni modifica LoRAs.