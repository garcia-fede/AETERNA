---
name: code-conventions
description: Patrones y convenciones de codigo establecidos en AETERNA
metadata:
  type: project
---

## Backend Java
- Lombok: @Data @Builder @NoArgsConstructor @AllArgsConstructor en todas las entidades
- Timestamps: @CreationTimestamp/@UpdateTimestamp (Hibernate) o @CreatedDate/@LastModifiedDate (Spring Data con @EntityListeners)
  - Medicamento usa Hibernate annotations (sin EntityListeners)
  - Residente y Usuario usan Spring Data Auditing (con @EntityListeners(AuditingEntityListener.class))
- Response DTOs: metodo estatico from(Entity) para mapeo — sin MapStruct por simplicidad
- ApiResponse<T>: wrapper estandar con success, message, data. Metodos ApiResponse.ok(data) / ApiResponse.ok(data, message) / ApiResponse.error(message)
- Excepciones: NotFoundException (404) y BadRequestException (400) en com.aeterna.common.exception, manejadas por GlobalExceptionHandler
- Controllers: solo HTTP, sin logica de negocio. Usan @PreAuthorize para seguridad granular.
- Roles en @PreAuthorize: ADMIN, PERSONAL, FAMILIAR (Spring Security agrega ROLE_ prefix automaticamente con hasRole())

## Frontend TypeScript/React
- Services: objeto exportado con metodos async que retornan el data.data del ApiResponse
- React Query keys: arrays descriptivos ['medicamentos', residenteId], ['tomas-turno', fecha, turno]
- Stores Zustand: solo auth store con persistencia en sessionStorage
- Componentes UI reutilizables: Button (variant primary/secondary/danger), Badge (color green/yellow/red/blue/gray), Input (forwardRef, extends InputHTMLAttributes), Modal (size sm/md/lg, cierre con Escape y click backdrop), Card
- Estilo: Tailwind con clases custom input-field, btn-primary, btn-secondary, btn-danger definidas en index.css
- Tipos helpers en types/index.ts: formatTurno(), formatEstadoAdministracion(), getTurnoActual()
- Toast: react-hot-toast (importado como `import toast from 'react-hot-toast'`)
