# PromptAI Studio

**PromptAI Studio** es una suite creativa asistida por IA para la generación de guiones hiper-segmentados y perfiles psicológicos sintéticos. Permite a creadores de contenido mantener consistencia actoral, visual y de *lip-sync* a través de herramientas de I2V (Image-to-Video) como Luma Dream Machine o Runway Gen-3.

> El nombre visible en la app es **PromptAI Studio** (`AppShell.tsx`). El nombre interno del paquete npm es `vite_react_shadcn_ts`.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite 5 |
| **UI / Estilos** | TailwindCSS 3 + Shadcn/UI (Radix UI) + glassmorphism oscuro |
| **Routing** | React Router DOM v6 |
| **Estado servidor** | TanStack Query v5 |
| **Base de Datos** | Supabase (PostgreSQL) con Row Level Security |
| **Autenticación** | Supabase Auth (email/password) |
| **Motor de IA** | Google Gemini SDK `@google/genai` v2 · modelo `gemini-2.5-flash` |
| **Formularios** | React Hook Form + Zod |
| **Feedback** | Formspree (`https://formspree.io/f/mjglpwow`) |
| **Deploy** | Vercel |

> **Arquitectura serverless:** Toda la lógica de IA corre directamente en el navegador del usuario usando el SDK oficial de Google (`@google/genai`). No hay Edge Functions ni backends intermedios para generación de contenido.

---

## Requisitos de Configuración

### 1. Clonar e instalar
```bash
git clone <repo>
cd app
npm install
```

### 2. Variables de entorno (`.env`)
```env
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="tu-anon-key-publica"
VITE_GEMINI_API_KEY="AIzaSy..."   # Fallback — el usuario puede sobreescribirla en Ajustes
```

### 3. Base de datos
Ejecuta el script `docs/db/setup_database.sql` en el SQL Editor de Supabase. Esto crea:
- Tablas `character_profiles` y `content_packs` con RLS.
- Storage bucket `character-refs` (público) para imágenes de referencia de personajes.
- Triggers `touch_updated_at` en ambas tablas.

### 4. Levantar entorno de desarrollo
```bash
npm run dev
```

### Scripts disponibles
| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (una pasada) |
| `npm run test:watch` | Vitest en modo watch |

---

## Estructura de Carpetas

```
app/
├── docs/
│   ├── db/
│   │   ├── setup_database.sql       # Script completo de BD (idempotente)
│   │   └── add_full_profile.sql     # Migración auxiliar (columna full_profile)
│   ├── reference/
│   │   ├── V1_7_PERSONASCRIPT AI — SYSTEM PROMPT.txt
│   │   └── personaje_schema_v2.5.json
│   └── backups/                     # CSVs de respaldo de la BD original
├── src/
│   ├── components/
│   │   ├── AppShell.tsx             # Layout principal con nav y footer
│   │   ├── CopyButton.tsx           # Botón copiar al portapapeles
│   │   ├── FeedbackModal.tsx        # Modal flotante de feedback (Formspree)
│   │   ├── NavLink.tsx              # Wrapper de NavLink con estilos
│   │   ├── RequireAuth.tsx          # Guard de rutas privadas
│   │   ├── character-forge/         # Wizard multi-paso de creación de personaje
│   │   │   ├── CharacterForge.tsx   # Orquestador del wizard (5 pasos)
│   │   │   ├── Step1Identity.tsx    # Paso 1: Identidad base
│   │   │   ├── Step2Psychology.tsx  # Paso 2: Psicología profunda
│   │   │   ├── Step3Voice.tsx       # Paso 3: Voz, dialecto y humor
│   │   │   ├── Step4Appearance.tsx  # Paso 4: Apariencia y producción
│   │   │   └── Step5Rules.tsx       # Paso 5: Reglas maestras
│   │   └── ui/                      # Componentes Shadcn/UI
│   ├── hooks/
│   │   ├── useAuth.tsx              # Contexto de sesión Supabase
│   │   ├── use-mobile.tsx           # Detección de móvil
│   │   └── use-toast.ts             # Hook de toasts (Radix)
│   ├── integrations/
│   │   └── supabase/                # Cliente Supabase auto-generado
│   ├── lib/
│   │   ├── character.ts             # CRUD de personajes contra Supabase
│   │   ├── gemini.ts                # Motor de IA (generación de perfiles y packs)
│   │   ├── types.ts                 # Tipos de dominio (CharacterProfile, ContentPack…)
│   │   └── utils.ts                 # Utilidades (cn)
│   ├── pages/
│   │   ├── Auth.tsx                 # Login / registro
│   │   ├── Character.tsx            # Editor manual de personaje (form completo)
│   │   ├── CharacterForgePage.tsx   # Wrapper de página para el Wizard Forge
│   │   ├── CharacterList.tsx        # Galería de personajes (grid con avatares)
│   │   ├── Generate.tsx             # Generador de paquetes de contenido
│   │   ├── Library.tsx              # Biblioteca de packs generados
│   │   ├── NotFound.tsx             # 404
│   │   ├── PackDetail.tsx           # Vista detallada de un pack (shots, prompts, script)
│   │   └── Settings.tsx             # Configuración de la API Key de Gemini
│   ├── types/
│   │   └── character.ts             # Schema completo CharacterProfileSchema v2.5
│   ├── App.tsx                      # Router principal con rutas y providers
│   ├── main.tsx                     # Entry point de React
│   └── index.css                    # Tokens CSS globales y estilos base
├── public/                          # Assets estáticos
├── supabase/                        # Config local de Supabase CLI (si aplica)
├── .env                             # Variables de entorno (no commitear)
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── vercel.json                      # Rewrite SPA para Vercel
```

---

## Módulos Principales

### 1. Character Forge — Wizard de Creación de Personajes
**Ruta:** `/character/forge` → `CharacterForgePage.tsx` → `CharacterForge.tsx`

Wizard de 5 pasos para crear perfiles psicológicos tridimensionales:
1. **Identidad Base**: nombre, edad, género, nacionalidad, rol, filosofía declarada.
2. **Psicología Profunda**: arquetipos junguianos, sombra, motivación real vs visible, mecanismo de defensa.
3. **Voz y Dialecto**: tono, latiguillos, dialecto, humor (intensidad y tipos).
4. **Apariencia y Producción**: descripción física, outfit, elementos identitarios, prompt visual base.
5. **Reglas Maestras**: reglas SIEMPRE / NUNCA, instrucción maestra final.

**Autocompletar con IA:** En cualquier paso, el botón "Autocompletar con IA" envía el borrador a `generateCharacterProfile()` (Gemini) que rellena los campos avanzados (psicología, dialecto, latiguillos, prompt visual en inglés, instrucción maestra). El resultado se serializa en el campo `notes` de Supabase como texto plano para evitar problemas de caché de esquema.

### 2. Editor Manual de Personaje
**Ruta:** `/character/new` o `/character/:id` → `Character.tsx`

Formulario completo para editar todos los campos de un `CharacterProfile`. Permite:
- Subir imagen de referencia al bucket `character-refs` de Supabase Storage.
- Analizar la imagen con Gemini para generar un `reference_image_description`.
- Editar latiguillos, palabras a evitar, trigger word del LoRA, estilo visual y plantillas de cámara.

### 3. Generador de Paquetes de Contenido
**Ruta:** `/` → `Generate.tsx`

Formulario principal de la app:
- Selección de personaje activo (thumbnail con imagen de referencia).
- Tema / idea (texto libre, hasta 500 chars).
- Duración total del guion (15s, 30s, 60s o personalizado).
- Duración por clip (5s, 10s, 15s o personalizado).
- **Factor WPM (0.5–1.0):** multiplica el WPM del personaje para calcular el máximo de palabras por clip (previene desincronización de lip-sync).
- **Intensidad de rasgos psicológicos (0–100):** inyectada al prompt del sistema para amplificar o suavizar los rasgos del personaje.
- Gancho sugerido (opcional).

La generación llama a `generateContentPack()` → Gemini → guarda en `content_packs` → redirige a `/pack/:id`.

### 4. Paquete de Contenido (PackDetail)
**Ruta:** `/pack/:id` → `PackDetail.tsx`

Vista de resultados con pestañas:
- **Guion:** hook, desarrollo, punchline + voiceover completo.
- **Shots I2V:** para cada clip, los 4 bloques de prompt: `[Sujeto]`, `[VISUAL]`, `[DIÁLOGO]`, `[SONIDO]`.
- **Producción:** `cover_image_prompt` (con trigger LoRA), `cover_i2v_prompt`, caption y hashtags.

Cada bloque tiene un `CopyButton` para copiar al portapapeles. Permite marcar el pack como publicado con link.

### 5. Biblioteca
**Ruta:** `/library` → `Library.tsx`

Lista de todos los packs generados, ordenados por fecha. Enlaza al detalle y permite regenerar ("Reintentar" pasa los parámetros via query string a `/`).

### 6. Ajustes
**Ruta:** `/settings` → `Settings.tsx`

Gestión de la **API Key de Gemini** del usuario. Se guarda en `localStorage` del navegador (nunca se envía a servidores). Si está presente tiene prioridad sobre `VITE_GEMINI_API_KEY` del `.env`.

### 7. Feedback
**Componente:** `FeedbackModal.tsx` (botón flotante en el layout)

Envía feedback de usuarios (ideas, bugs, comentarios) a Formspree. Solo visible cuando hay sesión activa.

---

## Esquema de Base de Datos

### Tabla `character_profiles`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK a `auth.users` |
| `name` | TEXT | Nombre del personaje |
| `occupation` | TEXT | Rol/oficio |
| `description` | TEXT | Descripción física (apariencia) |
| `voice_tone` | TEXT | Tono de voz general |
| `catchphrases` | TEXT[] | Latiguillos/frases recurrentes |
| `avoid_words` | TEXT[] | Palabras/temas a evitar |
| `references_list` | TEXT[] | Referentes creativos |
| `lora_trigger` | TEXT | Trigger word del LoRA |
| `style_words` | TEXT | Palabras de estilo visual |
| `camera_templates` | TEXT | Plantillas de cámara para I2V |
| `default_humor` | INTEGER | Intensidad de rasgos por defecto (0–100) |
| `notes` | TEXT | Perfil psicológico avanzado (texto serializado) |
| `reference_image_url` | TEXT | URL pública en Supabase Storage |
| `reference_image_description` | TEXT | Descripción generada por IA de la imagen |
| `full_profile` | JSONB | Perfil completo `CharacterProfileSchema` (reservado) |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-actualizado por trigger |

### Tabla `content_packs`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK a `auth.users` |
| `character_id` | UUID | FK a `character_profiles` (nullable) |
| `topic` | TEXT | Tema del paquete |
| `platform` | TEXT | Plataforma (`"video"` en implementación actual) |
| `format` | TEXT | Formato (ej: `"30s / 10s"`) |
| `humor_intensity` | INTEGER | Intensidad usada en la generación |
| `hook_hint` | TEXT | Gancho sugerido (nullable) |
| `content` | JSONB | `PackContent` completo (schema en `src/lib/types.ts`) |
| `published` | BOOLEAN | Estado de publicación |
| `published_at` | TIMESTAMPTZ | |
| `published_link` | TEXT | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-actualizado por trigger |

### Storage
- **Bucket `character-refs`** (público): Almacena imágenes de referencia. Estructura de carpetas: `{user_id}/{filename}`.

---

## Motor de IA (`src/lib/gemini.ts`)

El cliente se inicializa en cada llamada con `getAiClient()`, que prioriza la clave guardada en `localStorage` sobre el `.env`.

### `generateCharacterProfile(draft)`
- **Modelo:** `gemini-2.5-flash`
- **Salida:** JSON estructurado con schema `characterSchema` (arquetipos, psicometría, voz, dialecto, humor, apariencia, reglas maestras).
- **Temperatura:** 0.7

### `generateContentPack(params)`
- **Modelo:** `gemini-2.5-flash`
- **Salida:** JSON estructurado con schema `packSchema` (título, resumen, guion 3 partes, array de shots I2V con 4 bloques, cover prompts, caption, hashtags).
- **Temperatura:** 0.7
- **Lógica de WPM:** `words_per_clip = round((wpm / 60) × wpm_factor × clip_duration)`. Se inyecta en el prompt de usuario para que el modelo no supere el límite de palabras por clip.

### Estructura de 4 bloques I2V (por cada shot)
| Campo | Idioma | Descripción |
|---|---|---|
| `prompt_sujeto` | EN | Rasgos físicos/identitarios del personaje. Sin escenario. |
| `prompt_visual` | EN | Tipo de plano, acción y escenario. Siempre incluye `"no text, no subtitles, no watermarks"`. |
| `prompt_dialogo` | ES | Transcripción con gestos en paréntesis. Siempre inicia con `"Sujeto dice: "`. |
| `prompt_sonido` | EN | Tono vocal, ambiente y WPM obligatorio. |

---

## Schema del Personaje (`CharacterProfileSchema` v2.5)

Definido en `src/types/character.ts`. Tiene 12 bloques:
1. `metadata` – versión, tipo, estado de producción
2. `identidad` – nombre, edad, género, nacionalidad, rol, filosofía
3. `nucleo_psicologico` – arquetipos, sombra, creencia nuclear, contradicción
4. `psicometria` – ejes temperamentales (6) + traits expresivos (13)
5. `voz_y_lenguaje` – tono, registro, cadencia, WPM, latiguillos, filtros de lenguaje
6. `dialecto` – tipo, intensidad, marcadores obligatorios, exclusiones
7. `humor` – intensidad, tipos activos, técnicas, prohibiciones
8. `dimension_humana` – vicio/defecto, miedo/trauma, tic, objeto talismán
9. `apariencia` – física, outfit, accesorios, `prompt_visual_base`
10. `gesticulacion` – gestos típicos, lenguaje corporal
11. `produccion` – entorno habitual, iluminación, paleta, ángulos
12. `reglas_maestras` – reglas siempre/nunca, instrucción maestra

---

## Rutas de la Aplicación

| Ruta | Componente | Descripción |
|---|---|---|
| `/auth` | `Auth.tsx` | Login / Registro (pública) |
| `/` | `Generate.tsx` | Generador de paquetes *(requiere auth)* |
| `/library` | `Library.tsx` | Biblioteca de packs *(requiere auth)* |
| `/pack/:id` | `PackDetail.tsx` | Detalle de un pack *(requiere auth)* |
| `/characters` | `CharacterList.tsx` | Galería de personajes *(requiere auth)* |
| `/character/forge` | `CharacterForgePage.tsx` | Wizard de creación *(requiere auth)* |
| `/character/new` | `Character.tsx` | Editor manual (personaje nuevo) *(requiere auth)* |
| `/character/:id` | `Character.tsx` | Editor manual (personaje existente) *(requiere auth)* |
| `/settings` | `Settings.tsx` | Configuración de API Key *(requiere auth)* |
| `*` | `NotFound.tsx` | 404 |

---

## Archivos de Referencia

En `docs/reference/` se preserva el historial de ingeniería de prompts:
- **`V1_7_PERSONASCRIPT AI — SYSTEM PROMPT.txt`**: Prompt maestro original del que heredan las técnicas de acting (lip-sync, gesticulación, WPM).
- **`personaje_schema_v2.5.json`**: Borrador inicial del schema del personaje del que deriva `CharacterProfileSchema`.

En `docs/backups/` se guardan copias CSV de la base de datos original.

---

## Despliegue (Vercel)

El archivo `vercel.json` configura un rewrite SPA (`/* → /index.html`) para que React Router funcione correctamente. El proyecto se despliega automáticamente desde la rama principal.

Variables de entorno requeridas en Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_GEMINI_API_KEY` (opcional, el usuario puede configurar la suya en Ajustes)

---

## Lo que SÍ hace

- ✅ **Multi-plataforma**: Genera paquetes para Reel/Video, Carrusel de Instagram, e Hilo de Twitter/X.
- ✅ **Guardar borrador**: Guarda perfiles de personaje incompletos como borradores en Supabase.
- ✅ **Character Forge**: Genera perfiles completos de personajes usando IA.
- ✅ **Content Forge**: Genera guiones y prompts de contenido para personajes.

## Lo que la App NO hace

- ❌ No genera imágenes ni videos finales — entrega prompts para usar en ComfyUI, LTX, Runway, Luma, etc.
- ❌ No publica en redes automáticamente — el usuario copia y pega.
- ❌ No entrena ni modifica LoRAs.
