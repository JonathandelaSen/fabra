# Admin User Impersonation

## Estado

Decisiones acordadas para una primera versión beta. Implementada.

## Objetivo

Permitir que un administrador adopte temporalmente la sesión de un usuario desde la zona de administración para ver la aplicación exactamente como la ve ese usuario, reproducir errores y ayudar a resolver incidencias.

La funcionalidad se denomina **Become this user** o **impersonación de usuario**.

## Preguntas y respuestas

### 1. ¿La impersonación permite modificar datos?

**Pregunta:** ¿Mientras estás usando "Become this user", quieres poder modificar datos como si fueras el usuario?

**Recomendación planteada:** comenzar con modo lectura para reducir el riesgo de modificar información o ejecutar acciones facturables accidentalmente.

**Respuesta acordada:** sí, la impersonación permite realizar todas las acciones disponibles para el usuario. No se restringen ediciones.

**Decisión:** la sesión impersonada tendrá lectura y escritura completas, incluyendo cambios de datos, acciones de IA, subida de archivos y configuración.

### 2. ¿Cómo se distingue visualmente una sesión impersonada?

**Pregunta:** ¿Qué marca visual debe mostrar que la aplicación está en un modo diferente?

**Respuesta acordada:** debe existir una marca visual evidente que sea sencilla de implementar y no obligue a modificar muchas pantallas.

**Decisión:** centralizar el indicador en `AppShell` mediante una barra permanente y visualmente diferenciada. La barra mostrará el email del usuario impersonado y una acción para salir de la impersonación.

### 3. ¿La impersonación se abre en una pestaña separada?

**Pregunta:** ¿La sesión impersonada debe abrirse en una pestaña separada?

**Recomendación inicial planteada:** abrir una pestaña separada para mantener la sesión admin original.

**Restricción identificada:** las pestañas comparten las cookies de autenticación. Una implementación sencilla que sustituya la sesión de Supabase afectará a todas las pestañas.

**Respuesta acordada:** se acepta sustituir temporalmente la sesión admin en todas las pestañas.

**Decisión:** la impersonación usa la misma sesión de navegador y reemplaza la sesión admin actual.

### 4. ¿Qué ocurre al salir de la impersonación?

**Pregunta:** ¿Debe restaurarse automáticamente la sesión admin al finalizar?

**Recomendación planteada:** no restaurar automáticamente la sesión admin en la primera versión para evitar almacenar tokens o credenciales privilegiadas adicionales.

**Respuesta acordada:** al salir se puede volver al login.

**Decisión:** finalizar la impersonación cierra la sesión del usuario impersonado y redirige al login. El administrador debe autenticarse de nuevo.

### 5. ¿Dónde vive la funcionalidad?

**Pregunta:** ¿Dónde debe estar disponible la selección de usuarios?

**Respuesta acordada:** crear una sección de administración dentro de la aplicación, visible solo para administradores, que pueda evolucionar con nuevas herramientas en el futuro.

**Decisión:** convertir `/admin` en una zona administrativa extensible. Las secciones iniciales serán:

- Usuarios
- Observabilidad

El acceso seguirá limitado a usuarios incluidos en `admin_users`.

### 6. ¿Cómo se selecciona al usuario?

**Pregunta:** ¿Cómo debe localizarse al usuario que se quiere impersonar?

**Recomendación planteada:** tabla paginada con búsqueda parcial por email, mostrando información básica y una confirmación antes de iniciar la impersonación.

**Respuesta acordada:** aceptada.

**Decisión:** la sección Usuarios tendrá:

- Tabla paginada.
- Búsqueda parcial por email.
- Email y fecha de alta.
- Acción **Become this user**.
- Confirmación previa a sustituir la sesión.

### 7. ¿Se notifica al usuario o se mantiene una auditoría?

**Pregunta:** ¿El usuario debe recibir una notificación cuando un admin entra en su cuenta? ¿Debe mantenerse una auditoría interna detallada?

**Recomendación planteada:** no avisar al usuario en la primera versión, pero registrar el inicio, fin y acciones realizadas durante la sesión.

**Respuesta acordada:** no enviar notificaciones ni crear auditoría interna detallada durante la beta.

**Restricción del repositorio:** toda nueva acción backend debe añadirse a observabilidad.

**Decisión:** registrar únicamente el evento técnico `admin_impersonation_started`. No se creará una tabla de auditoría ni se registrarán las acciones posteriores de la sesión impersonada.

### 8. ¿Puede un admin impersonar a otro admin o a sí mismo?

**Pregunta:** ¿Un administrador puede impersonar a otro administrador?

**Recomendación planteada:** bloquear tanto la impersonación de otros administradores como la autoimpersonación.

**Respuesta acordada:** se permite impersonar a otros administradores; solo se bloquea la autoimpersonación.

**Decisión:** un administrador no puede impersonarse a sí mismo. Sí puede impersonar a otros usuarios incluidos en `admin_users`.

## Alcance consolidado de la primera versión

- `/admin` será una zona administrativa extensible y exclusiva para administradores.
- La zona incluirá Usuarios y la vista de Observabilidad existente.
- Usuarios permitirá buscar y paginar usuarios.
- Antes de impersonar habrá una confirmación explícita.
- La impersonación sustituirá la sesión actual de Supabase.
- La aplicación se comportará exactamente como para el usuario objetivo, aprovechando sus permisos y políticas RLS.
- No habrá restricciones de lectura, escritura ni ejecución de acciones.
- `AppShell` mostrará una barra permanente durante toda la impersonación.
- Salir cerrará la sesión y redirigirá al login.
- No se notificará al usuario impersonado.
- No existirá auditoría detallada durante la beta.
- Se registrará `admin_impersonation_started` en observabilidad.
- No se permitirá la autoimpersonación. Sí se permitirá impersonar a otros administradores.

## Riesgos aceptados para la beta

- Un administrador impersonando puede modificar o eliminar datos del usuario.
- Puede ejecutar acciones de IA u otras operaciones con coste.
- Las acciones realizadas durante la impersonación aparecerán como acciones del usuario en los sistemas que solo conozcan la identidad de Supabase.
- Sin auditoría detallada, no será posible distinguir posteriormente qué cambios concretos realizó el administrador.
- La sustitución de sesión afecta a todas las pestañas que compartan las cookies del navegador.

Estos riesgos se aceptan conscientemente para mantener sencilla la primera versión beta.

## Dirección técnica acordada

La implementación debe mantenerse localizada:

- Extender la zona `/admin` con navegación entre Usuarios y Observabilidad.
- Añadir endpoints administrativos para listar/buscar usuarios e iniciar la impersonación.
- Verificar siempre que el actor actual pertenece a `admin_users`.
- Bloquear únicamente objetivos que coincidan con el actor (autoimpersonación).
- Sustituir la sesión Supabase del navegador por una sesión válida del usuario objetivo.
- Añadir el indicador global y la acción de salida en `AppShell`.
- Registrar `admin_impersonation_started` mediante observabilidad.

No se modificarán las políticas RLS ni las rutas de negocio para admitir una identidad efectiva separada: una vez iniciada la impersonación, Supabase tratará la sesión como la del usuario objetivo.

## Implementación

- Módulo hexagonal `src/modules/admin/` (zona administrativa global, pensada para acoger más casos de uso de administración):
  - Dominio: entidad `User` (VOs `UserId`, `UserEmail`, `Timestamp`), puertos `UserRepository` e `ImpersonationSessionService`, value object `ImpersonationSession` (tokenHash + target) y errores `SelfImpersonationError` / `ImpersonationTargetNotFoundError`.
  - Aplicación: `ListUsersUseCase` (paginación de 20 por página, devuelve entidades `User`) y `StartUserImpersonationUseCase` (bloquea autoimpersonación y registra `admin_impersonation_started` vía `EventTracker`).
  - Infraestructura: `SupabaseUserRepository` (Auth Admin API `listUsers`, hidrata entidades `User`) y `SupabaseImpersonationSessionService` (`auth.admin.generateLink({ type: "magiclink" })`, devuelve el `hashed_token`).
  - Composition root `admin.module.ts`, registrado como singleton en `src/lib/container.ts`. No usa `bindRequest` porque opera con el cliente service-role, no con el cliente por petición.
- `GET /api/admin/users`: guard de admin + validación HTTP en la ruta; delega en `listUsers.execute(...)` y serializa `User.toPrimitives()`.
- `POST /api/admin/impersonate`: guard de admin + validación HTTP en la ruta; delega en `startUserImpersonation.execute(...)`; los errores de dominio se mapean con `handleApiError` (400/404).
- El navegador canjea el token con `supabase.auth.verifyOtp({ type: "magiclink", token_hash })`, lo que sustituye la sesión, y recarga la aplicación.
- `src/features/admin/`: zona administrativa con navegación entre Usuarios y Observabilidad.
- `src/features/admin-users/`: tabla de usuarios, confirmación e inicio de la impersonación.
- `src/components/shell/impersonation-banner.tsx`: barra permanente en `AppShell`. Se apoya en un marcador de `localStorage` (`fabra.impersonatedEmail`, helpers cliente en `src/frontend/impersonation.ts`) que solo se muestra si coincide con el email de la sesión activa. Salir cierra la sesión, limpia el marcador y redirige a `/login`.

## Evolución futura

Fuera del alcance de esta primera versión:

- Restauración automática de la sesión admin.
- Sesiones impersonadas aisladas por pestaña.
- Modo de solo lectura.
- Motivo obligatorio antes de impersonar.
- Historial de sesiones de impersonación.
- Auditoría detallada de acciones.
- Notificación al usuario.
- Permisos administrativos más granulares.
