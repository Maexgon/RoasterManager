# Matriz de Permisos — Rugby Squad Manager

Este documento se basa en la tabla de permisos de la hoja "Funciones" del archivo "tabla_permisos_rugby.xlsx".

Roles (columnas): **Admin**, **Manager**, **Staff**, **Padres/Parents**.

Regla base: por cada `Func_ID`, **SI** habilita al rol a ejecutar la acción indicada en `Tipo_Acción`; **NO** lo bloquea.

---

## Reglas globales de autorización (OBLIGATORIAS para el generador de código)

1. Por ahora el sistema es un solo tenant, por lo que no es necesario filtrar por `club_id` / `tenant_id`, y una sola categoria, por lo cual tampoco requiere de filtro por categoría.

2. **Scoping por relación (Padres/Parents)**  
   Cuando un endpoint/pantalla devuelve datos de jugadores y `Padres/Parents = SI`, se debe filtrar por:  
   `player_id IN (hijos_asociados_al_padre)`  
   Si intenta acceder a un `player_id` fuera de la relación ⇒ responder **403**.

3. **Validación por acción**  
   No alcanza con permitir la pantalla: validar también el `Tipo_Acción` real (Crear/Editar/Eliminar/Importar/Configurar/Ver).

4. **Sensibilidad**  
   - `Alta`: requiere auditoría (actor/rol/func_id/timestamp) + validaciones estrictas de inputs.
   - `Media`: validaciones estándar + control de integridad.
   - `Baja`: lectura amplia dentro del club, igual respetando tenant.

---

## Permisos por módulo (según hoja "Funciones")

### Cartelera (Billboard)
| Func_ID | Submódulo | Funcionalidad | Tipo_Acción | Sens. | Admin | Manager | Staff | Padres/Parents |
|---|---|---|---|---|---|---|---|---|
| BILL-001 | Anuncios | Publicación de Anuncios | Crear | Media | SI | SI | NO | NO |
| BILL-002 | Anuncios | Categorización de Visibilidad | Configurar | Alta | SI | SI | NO | NO |
| BILL-003 | Anuncios | Carga Multimedia | Cargar | Media | SI | SI | NO | NO |
| BILL-004 | Anuncios | Links Inteligentes | Ver | Baja | SI | SI | SI | SI |
| BILL-005 | Moderación | Moderación de anuncios | Eliminar | Alta | SI | SI | NO | NO |

**Regla Parents:** si `Padres/Parents = SI` en este módulo, solo expone anuncios visibles para padres (según categoría/visibilidad), siempre dentro del club.

---

### Configuración y Perfil
| Func_ID | Submódulo | Funcionalidad | Tipo_Acción | Sens. | Admin | Manager | Staff | Padres/Parents |
|---|---|---|---|---|---|---|---|---|
| CONF-001 | Perfil | Perfil de Staff | Editar | Media | SI | SI | SI | NO |
| CONF-002 | Staff | Gestión de Cuerpo Técnico | Gestionar | Alta | SI | SI | NO | NO |
| CONF-003 | Preferencias | Idioma | Configurar | Baja | SI | SI | SI | SI |
| CONF-004 | Preferencias | Modo Visual | Configurar | Baja | SI | SI | SI | SI |

---

### Panel de Inicio (Dashboard)
| Func_ID | Submódulo | Funcionalidad | Tipo_Acción | Sens. | Admin | Manager | Staff | Padres/Parents |
|---|---|---|---|---|---|---|---|---|
| DASH-001 | Métricas | Métricas de Plantilla | Ver | Baja | SI | SI | SI | NO |
| DASH-002 | Skills | Radar de Skills | Ver | Baja | SI | SI | SI | NO |
| DASH-003 | Asistencia | Analítica de Presencialidad | Ver | Media | SI | SI | SI | NO |
| DASH-004 | Evolución | Crecimiento Técnico | Ver | Media | SI | SI | SI | NO |
| DASH-005 | Ranking | Top 5 Jugadores | Ver | Media | SI | SI | SI | NO |

---

### Entrenamientos y Eventos
| Func_ID | Submódulo | Funcionalidad | Tipo_Acción | Sens. | Admin | Manager | Staff | Padres/Parents |
|---|---|---|---|---|---|---|---|---|
| TRAI-001 | Calendario | Calendario Seguimiento | Ver | Baja | SI | SI | SI | SI |
| TRAI-002 | Drills | Librería de Drills (Ejercicios) | Gestionar | Media | SI | SI | SI | NO |
| TRAI-003 | Sesiones | Armado de bloques de tiempo | Gestionar | Media | SI | SI | SI | NO |
| TRAI-004 | Sesiones | Asignación de entrenadores a cada bloque | Gestionar | Media | SI | SI | SI | NO |
| TRAI-005 | Sesiones | Indicar equipos/niveles por ejercicio | Gestionar | Media | SI | SI | SI | NO |
| TRAI-006 | Asistencia | Control de Asistencia | Gestionar | Alta | SI | SI | SI | NO |
| TRAI-007 | Bitácora | Notas de Campo | Gestionar | Alta | SI | SI | SI | NO |
| TRAI-008 | WhatsApp | Compartir a WhatsApp | Exportar | Baja | SI | SI | SI | NO |

**Regla Parents:** cuando `TRAI-001 = SI`, Parents solo ve eventos/planificaciones publicadas para padres (y/o asociadas a la categoría del/los hijo/s). Nunca puede tomar asistencia ni ver bitácora si está en NO.

---

### Gestión de Plantel (Roster)
| Func_ID | Submódulo | Funcionalidad | Tipo_Acción | Sens. | Admin | Manager | Staff | Padres/Parents |
|---|---|---|---|---|---|---|---|---|
| ROST-001 | Directorio | Directorio de Jugadores | Ver | Media | SI | SI | SI | NO |
| ROST-002 | Altas | Alta de Jugadores | Crear | Alta | SI | SI | SI | NO |
| ROST-003 | Importación | Importación Masiva | Importar | Alta | SI | SI | NO | NO |
| ROST-004 | Perfil | Datos Personales | Editar | Alta | SI | SI | NO | NO |
| ROST-005 | Perfil | Biometría | Editar | Alta | SI | SI | NO | NO |
| ROST-006 | Skills | Evaluación de Skills | Editar | Alta | SI | SI | SI | NO |
| ROST-007 | Skills | Historial de Evaluación | Ver | Media | SI | SI | SI | NO |

---

### Partidos y Equipos (Fixture)
| Func_ID | Submódulo | Funcionalidad | Tipo_Acción | Sens. | Admin | Manager | Staff | Padres/Parents |
|---|---|---|---|---|---|---|---|---|
| FIXT-001 | Rivales | Gestión de Clubes | Gestionar | Media | SI | SI | SI | NO |
| FIXT-002 | Partidos | Agendado de Partidos | Gestionar | Media | SI | SI | SI | NO |
| FIXT-003 | Lineups | Armado de Equipos (Lineups) | Gestionar | Alta | SI | SI | SI | NO |
| FIXT-004 | Stats | Radar comparativo entre equipos armados | Ver | Media | SI | SI | SI | NO |
| FIXT-005 | Match | Control de Match | Gestionar | Alta | SI | SI | SI | NO |
| FIXT-006 | Premios | Premios Post-Partido | Gestionar | Media | SI | SI | SI | NO |
| FIXT-007 | WhatsApp | WhatsApp de Convocatoria | Exportar | Baja | SI | SI | SI | NO |

---

## Funciones de Sensibilidad Alta (endpoints con controles extra)
Recomendación: además de RBAC, implementar auditoría + validación estricta.

| Func_ID | Funcionalidad | Tipo_Acción |
|---|---|---|
| BILL-002 | Categorización de Visibilidad | Configurar |
| BILL-005 | Moderación de anuncios | Eliminar |
| CONF-002 | Gestión de Cuerpo Técnico | Gestionar |
| TRAI-006 | Control de Asistencia | Gestionar |
| TRAI-007 | Notas de Campo | Gestionar |
| ROST-002 | Alta de Jugadores | Crear |
| ROST-003 | Importación Masiva | Importar |
| ROST-004 | Datos Personales | Editar |
| ROST-005 | Biometría | Editar |
| ROST-006 | Evaluación de Skills | Editar |
| FIXT-003 | Armado de Equipos (Lineups) | Gestionar |
| FIXT-005 | Control de Match | Gestionar |