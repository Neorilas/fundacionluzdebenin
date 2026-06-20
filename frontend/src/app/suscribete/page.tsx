import { redirect } from 'next/navigation';

// Enlace corto para compartir (p. ej. por WhatsApp): /suscribete → /es/suscribete/
export default function SuscribeteRootPage() {
  redirect('/es/suscribete/');
}
