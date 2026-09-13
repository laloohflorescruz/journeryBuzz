# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y versionado [SemVer](https://semver.org/lang/es/).

## [0.1.0] — 2026-09-13

Primera versión numerada. Buzz pasa a ser el **panel del proveedor**: gestiona
lo suyo, propone contenido al catálogo y deja la administración global al panel
de administración.

### Añadido
- **Filtro de fechas** compartido (`DateFilterPanel`): calendario del mes con los
  días marcados según su actividad, selección de un día y rango desde/hasta, en
  Reservas, Participantes, Reseñas y Pagos.
- **Participantes conectado a datos reales**: cada fila es una reserva, con
  búsqueda por participante, filtros por servicio, estado y fecha, y detalle del
  servicio solicitado, importe, pagos y notas.
- **Detalle de reseña** con el servicio reseñado, el comentario completo y la
  moderación desde el propio detalle.
- **Estado de aprobación** visible en POIs, Destinos, Tours y Tours de ciudad,
  con aviso en el alta de que el contenido se envía a revisión.
- Controles que faltaban en el alta de **POIs** (datos destacados, operador,
  entrada, actividades, estilos de viaje y consejos) y en la de **Destinos**
  (ficha técnica completa: idioma, moneda, mejor época, zona horaria, IATA,
  coste y calidad de vida, pros y contras, estilos y categorías).
- Regla de rangos de fechas en los formularios (`lib/dateRange.ts`) y mensajes de
  error reales de la API (`lib/apiError.ts`).
- Modal compartido (`Modal`, `ConfirmModal`) con Esc, clic fuera y pie común.

### Cambiado
- **Aislamiento por tenant**: Hospedajes, Rent a car, Tours, Tours de ciudad e
  Itinerarios listan solo lo de la empresa del usuario; Reseñas deja de incluir
  las aprobadas de toda la plataforma.
- **POIs y Destinos pasan a ser propuestas**: se listan solo los envíos propios.
  Los destinos, una vez enviados, los gestiona el administrador; los POIs se
  pueden corregir mientras no estén aprobados.
- **Categorías**: rediseño sobrio con selector de iconos, filtros y el control de
  `poi_only`, que no se podía editar.
- **Pie de página**: sustituido el pie de sitio público (cuatro columnas, redes,
  estrellas) por una línea discreta anclada al fondo.

### Eliminado
- **Geografía, Categorías, Actividades, Usuarios y Roles y permisos**: el
  catálogo global y la identidad se administran en el panel de administración.
  Sus rutas antiguas redirigen al inicio.
- `components/Header.tsx`, que era código muerto.
