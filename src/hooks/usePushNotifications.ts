/**
 * Push notifications: single source of truth is PushNotificationsProvider (App.tsx).
 * Importă hook-ul din context pentru compatibilitate cu importurile existente.
 */
export {
  PushNotificationsProvider,
  usePushNotifications,
} from "../context/PushNotificationsContext";
export type { PushNotificationState } from "../context/PushNotificationsContext";
