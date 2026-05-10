# PromptAI Studio — Estado del Proyecto y Hoja de Ruta

## Estado Actual (Mayo 2026)

El proyecto está en **producción activa** en Vercel. Las funcionalidades core están implementadas y funcionando.

---

## Qué está construido y funcionando

### ✅ Autenticación
- Login/registro con Supabase Auth (email/password).
- Guard de rutas privadas (`RequireAuth`).

### ✅ Gestión de Personajes
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
- Selección de personaje activo.
- Configuración de tema, duraciones (total y por clip), Factor WPM y Intensidad de Rasgos Psicológicos.
- Generación de paquetes vía Gemini 2.5 Flash con JSON estructurado.
- Guion con 3 partes (hook, desarrollo, punchline + voiceover completo).
- Array de shots I2V con estructura de 4 bloques (Sujeto, Visual, Diálogo, Sonido).
- Cover image prompt con trigger LoRA, cover I2V prompt, caption y hashtags.
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
- [ ] **Soporte multi-plataforma en el generador:** El schema de `content_packs` ya tiene un campo `platform`, pero la UI actual solo genera paquetes de "video". Implementar generación de Carruseles e Hilos (X/LinkedIn).
- [ ] **Guardar borrador en Character Forge:** El botón "Guardar borrador" actualmente solo hace `console.log`. Implementar persistencia real (localStorage o Supabase).
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
- **UI**: TailwindCSS 3 + Shadcn/UI (Radix). Estética glassmorphism oscura con acento ámbar/cobre.
- **BD**: Supabase PostgreSQL. Tablas: `character_profiles`, `content_packs`. Storage: bucket `character-refs`.
- **IA**: `@google/genai` v2 · `gemini-2.5-flash`. Corre 100% en el cliente (sin Edge Functions).
- **Deploy**: Vercel con rewrite SPA.
- **Feedback**: Formspree `mjglpwow`.

---

## Lo que la app NO hace (aclaración de scope)

- No genera imágenes ni videos finales — entrega prompts para el pipeline del usuario (ComfyUI, LTX, Runway, Luma...).
- No publica en redes automáticamente.
- No entrena ni modifica LoRAs.