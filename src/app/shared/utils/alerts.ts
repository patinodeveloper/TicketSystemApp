import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

/**
 * Muestra un toast de éxito
 */
export function showToastSuccess(messageService: MessageService, message: string, summary: string = 'Éxito'): void {
  messageService.add({
    severity: 'success',
    summary,
    detail: message,
  });
}

/**
 * Muestra un toast de error
 */
export function showToastError(messageService: MessageService, message: string, summary: string = 'Error'): void {
  messageService.add({
    severity: 'error',
    summary,
    detail: message,
  });
}

/**
 * Muestra un toast de advertencia
 */
export function showToastWarning(messageService: MessageService, message: string, summary: string = 'Advertencia'): void {
  messageService.add({
    severity: 'warn',
    summary,
    detail: message,
  });
}

/**
 * Muestra un toast informativo
 */
export function showToastInfo(messageService: MessageService, message: string, summary: string = 'Información'): void {
  messageService.add({
    severity: 'info',
    summary,
    detail: message,
  });
}

/**
 * Muestra un pequeño modal de confirmación
 * @param confirmService Servicio confirmService
 * @param message Mensaje descriptivo a mostrar
 * @param acceptCallback accion a realizar
 * @param header Header el mensaje
 * @param icon Icono del mensaje
 */
export function showConfirmDialog(
  confirmService: ConfirmationService,
  message: string,
  acceptCallback: () => void,
  header: string = 'Confirmación',
  icon: string = 'pi pi-exclamation-triangle',
) {
  confirmService.confirm({
    message,
    header,
    icon,
    accept: acceptCallback,
  });
}
