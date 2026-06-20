// Fuentes válidas de un suscriptor. Permite distinguir, por ejemplo, las altas
// llegadas desde la landing de captación (compartida por WhatsApp) de las del
// formulario normal de la web.
export const SUBSCRIBER_SOURCES = ['newsletter', 'landing', 'tu-santo'] as const;

export type SubscriberSource = (typeof SUBSCRIBER_SOURCES)[number];

const DEFAULT_SOURCE: SubscriberSource = 'newsletter';

// Normaliza un valor recibido del cliente a una fuente válida. Cualquier valor
// desconocido o ausente cae al valor por defecto ('newsletter').
export function resolveSubscriberSource(raw: unknown): SubscriberSource {
  if (typeof raw !== 'string') return DEFAULT_SOURCE;
  const value = raw.trim().toLowerCase();
  return (SUBSCRIBER_SOURCES as readonly string[]).includes(value)
    ? (value as SubscriberSource)
    : DEFAULT_SOURCE;
}
