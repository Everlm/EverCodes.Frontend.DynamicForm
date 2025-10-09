/**
 * Representa UNA respuesta/envío de un formulario por parte de un usuario.
 * Este es el DTO que se envía al backend para persistir.
 */
export interface FormSubmission {
  // ====== IDENTIFICACIÓN ======
  id?: string;                          // Se genera en el backend
  formDefinitionId: string;             // FK: ID del formulario usado
  formVersion: number;                  // Versión del formulario usada

  // ====== AUDITORÍA ======
  submittedAt?: Date;                   // Se genera en el backend
  submittedBy?: string;                 // Usuario que envió (del token JWT)
  ipAddress?: string;                   // Se captura en el backend
  userAgent?: string;                   // Se captura del request

  // ====== ESTADO ======
  status?: SubmissionStatus;            // Se gestiona en el backend
  isComplete: boolean;                  // true = envío final, false = borrador

  // ====== DATOS DEL USUARIO ======
  data: Record<string, any>;            // { username: "johndoe", email: "john@example.com", ... }

  // ====== METADATOS ======
  completionTime?: number;              // Tiempo en segundos para completar el formulario
  metadata?: Record<string, any>;       // Información adicional (browser, screen, etc.)

  // ====== VALIDACIÓN ======
  validationErrors?: ValidationError[]; // Errores de validación (si los hay)
}

/**
 * Estados posibles de un envío de formulario
 */
export enum SubmissionStatus {
  Draft = 'Draft',             // Auto-guardado (borrador)
  Submitted = 'Submitted',     // Enviado por el usuario
  Validated = 'Validated',     // Validado por el sistema
  Approved = 'Approved',       // Aprobado por administrador
  Rejected = 'Rejected',       // Rechazado
  Processing = 'Processing',   // En procesamiento
  Completed = 'Completed'      // Completado
}

/**
 * Error de validación en un campo específico
 */
export interface ValidationError {
  fieldKey: string;            // Clave del campo (e.g., "username")
  errorType: string;           // Tipo de error (e.g., "required", "minlength")
  message: string;             // Mensaje de error legible
}

/**
 * Respuesta del servidor después de enviar un formulario
 */
export interface SubmissionResponse {
  id: string;                  // ID del envío creado
  formDefinitionId: string;    // ID del formulario usado
  submittedAt: Date;           // Fecha/hora de envío
  status: SubmissionStatus;    // Estado del envío
  message: string;             // Mensaje para el usuario
}

/**
 * Request para crear un nuevo envío de formulario
 */
export interface CreateSubmissionRequest {
  formDefinitionId: string;
  formVersion: number;
  isComplete: boolean;
  data: Record<string, any>;
  completionTime?: number;
  metadata?: FormSubmissionMetadata;
}

/**
 * Metadatos del navegador/dispositivo del usuario
 */
export interface FormSubmissionMetadata {
  browserInfo?: string;        // "Chrome 120.0.0.0"
  screenResolution?: string;   // "1920x1080"
  language?: string;           // "es-ES"
  referrer?: string;           // URL de referencia
  deviceType?: string;         // "desktop" | "mobile" | "tablet"
  os?: string;                 // "Windows 10"
  timezone?: string;           // "America/Bogota"
  [key: string]: any;          // Campos adicionales
}

/**
 * Helper para crear un objeto de submission listo para enviar
 */
export function createFormSubmission(
  formDefinitionId: string,
  formVersion: number,
  data: Record<string, any>,
  isComplete: boolean = true,
  completionTime?: number
): CreateSubmissionRequest {
  const metadata: FormSubmissionMetadata = {
    browserInfo: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    deviceType: getDeviceType(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  return {
    formDefinitionId,
    formVersion,
    isComplete,
    data,
    completionTime,
    metadata
  };
}

/**
 * Detecta el tipo de dispositivo basado en el user agent
 */
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}
