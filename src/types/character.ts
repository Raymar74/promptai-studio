export type CharacterArchetype =
  | 'Héroe' | 'Rebelde' | 'Sabio' | 'Bufón' | 'Cuidador' | 'Explorador'
  | 'Amante' | 'Gobernante' | 'Creador' | 'Inocente' | 'Forajido' | 'Mago'
  | 'Mártir' | 'Seductor' | 'Estratega' | 'Superviviente' | 'Devoto'
  | 'Nihilista' | 'Trickster' | 'Sombra';

export type DefenseMechanism =
  | 'Negación' | 'Proyección' | 'Racionalización' | 'Disociación'
  | 'Humor' | 'Control' | 'Represión' | 'Sublimación' | 'Idealización'
  | 'Desplazamiento' | 'Intelectualización' | 'Regresión';

export interface CharacterProfileSchema {
  // Bloque 0: Metadata
  metadata: {
    id: string;
    version_ficha: string;
    fecha_creacion: string;
    fecha_ultima_modificacion?: string;
    tipo_personaje: 'protagonista' | 'secundario' | 'recurrente' | 'episodico' | 'antagonista';
    nivel_dificultad_ia: 'bajo' | 'medio' | 'alto' | 'extremo';
    estado: 'borrador' | 'validado' | 'produccion' | 'archivado';
    notas_desarrollo?: string;
  };

  // Bloque 1: Identidad
  identidad: {
    nombre: string;
    nombre_completo?: string;
    alias?: string[];
    edad: number;
    edad_aparente?: number;
    genero: string;
    nacionalidad: string;
    region_especifica?: string;
    rol_principal: string;
    roles_secundarios?: string[];
    filosofia_declarada: string;
  };

  // Bloque 2: Núcleo Psicológico
  nucleo_psicologico: {
    arquetipo_primario: CharacterArchetype;
    arquetipo_en_tension: CharacterArchetype;
    sombra_junguiana: CharacterArchetype;
    creencia_nuclear: string;
    motivacion_visible: string;
    motivacion_real: string;
    contradiccion_central: string;
    mecanismo_defensa_dominante: DefenseMechanism;
    detonante_de_quiebre: string;
  };

  // Bloque 3: Psicometría
  psicometria: {
    ejes_temperamentales: {
      proactividad: number; // 0-100
      analiticidad: number;
      sociabilidad: number;
      hostilidad: number;
      estabilidad_emocional: number;
      brujula_moral: number;
    };
    traits_expresivos: {
      carisma: number;
      inteligencia_percibida: number;
      sensualidad: number;
      irreverencia: number;
      elegancia: number;
      intensidad_humor: number;
      confianza: number;
      empatia: number;
      agresividad_verbal: number;
      autenticidad: number;
      vulgaridad_controlada: number;
      dramaturgia_temporal: number;
      cercania_dialectal: number;
    };
  };

  // Bloque 4: Voz y Lenguaje
  voz_y_lenguaje: {
    tono_general: string;
    tono_tags: string[];
    registro: string;
    registro_detalle?: string;
    cadencia_sintactica: string;
    velocidad_habla_wpm?: number;
    latiguillos: string[]; // min 3, max 7
    muletillas?: string[];
    caracteristicas_habla: string[];
    filtros_lenguaje: {
      permite_groserias: boolean;
      permite_tecnicismos: boolean;
      permite_jerga_callejera: boolean;
      permite_eufemismos: boolean;
      ironia_constante: boolean;
      notas_adicionales?: string;
    };
  };

  // Bloque 5: Dialecto
  dialecto: {
    tipo_dialecto: string;
    intensidad: number; // 0-100
    caracteristicas: string[];
    marcadores_obligatorios: string[];
    exclusiones_dialectales: string[];
  };

  // Bloque 6: Humor
  humor: {
    intensidad: number; // 0-100
    tipos_activos: string[];
    tecnicas: string[];
    prohibiciones: string[];
  };

  // Bloque 7: Dimensión Humana
  dimension_humana: {
    vicio_defecto: string;
    miedo_trauma: string;
    peculiaridad_tic: string;
    objeto_talisman?: string;
  };

  // Bloque 8: Apariencia
  apariencia: {
    descripcion_fisica: string;
    elementos_identitarios: string[];
    outfit_base: {
      superior?: string;
      inferior?: string;
      capa_exterior?: string;
      calzado?: string;
      variaciones_permitidas?: string[];
      prohibiciones_outfit?: string[];
    };
    accesorios?: string[];
    maquillaje_estetica?: string;
    prompt_visual_base?: string;
  };

  // Bloque 9: Gesticulación
  gesticulacion: {
    gestos_tipicos: string[];
    lenguaje_corporal_dominante: string;
    prohibiciones_gestuales?: string[];
  };

  // Bloque 10: Producción
  produccion: {
    entorno_habitual: string;
    iluminacion?: string;
    paleta_colores?: string;
    angulos_camara?: string[];
    notas_tecnicas_produccion?: string[];
  };

  // Bloque 11: Formato Contenido
  formato_contenido: {
    formatos_soportados: string[];
    estructura_base_guion: string;
    duracion_objetivo?: {
      minimo_segundos?: number;
      maximo_segundos?: number;
      optimo_segundos?: number;
    };
    reglas_hook?: string;
    reglas_cta?: string;
    metricas_exito?: string[];
    ejemplos_guiones_referencia?: {
      tema?: string;
      formato?: string;
      hook?: string;
      desarrollo?: string;
      punchline?: string;
      cta?: string;
      notas?: string;
    }[];
  };

  // Bloque 12: Reglas Maestras
  reglas_maestras: {
    reglas_siempre: string[];
    reglas_nunca: string[];
    instruccion_maestra: string;
  };
}

export const createEmptyDraftCharacter = (): Partial<CharacterProfileSchema> => {
  return {
    metadata: {
      id: '',
      version_ficha: '2.5',
      fecha_creacion: new Date().toISOString(),
      tipo_personaje: 'protagonista',
      nivel_dificultad_ia: 'medio',
      estado: 'borrador',
    },
    identidad: {
      nombre: '',
      edad: 30,
      genero: '',
      nacionalidad: '',
      rol_principal: '',
      filosofia_declarada: '',
    },
    // Inicializaciones parciales para facilitar bindings en la UI
    nucleo_psicologico: {} as any,
    psicometria: {
      ejes_temperamentales: {
        proactividad: 50,
        analiticidad: 50,
        sociabilidad: 50,
        hostilidad: 50,
        estabilidad_emocional: 50,
        brujula_moral: 50,
      },
      traits_expresivos: {
        carisma: 50,
        inteligencia_percibida: 50,
        sensualidad: 50,
        irreverencia: 50,
        elegancia: 50,
        intensidad_humor: 50,
        confianza: 50,
        empatia: 50,
        agresividad_verbal: 50,
        autenticidad: 50,
        vulgaridad_controlada: 50,
        dramaturgia_temporal: 50,
        cercania_dialectal: 50,
      }
    },
    voz_y_lenguaje: {
      tono_general: '',
      tono_tags: [],
      registro: '',
      cadencia_sintactica: '',
      latiguillos: [],
      caracteristicas_habla: [],
      filtros_lenguaje: {
        permite_groserias: false,
        permite_tecnicismos: false,
        permite_jerga_callejera: false,
        permite_eufemismos: false,
        ironia_constante: false,
      }
    },
    dialecto: {
      tipo_dialecto: '',
      intensidad: 50,
      caracteristicas: [],
      marcadores_obligatorios: [],
      exclusiones_dialectales: [],
    },
    humor: {
      intensidad: 50,
      tipos_activos: [],
      tecnicas: [],
      prohibiciones: [],
    },
    apariencia: {
      descripcion_fisica: '',
      elementos_identitarios: [],
      outfit_base: {}
    },
    reglas_maestras: {
      reglas_siempre: [],
      reglas_nunca: [],
      instruccion_maestra: ''
    }
  };
};
