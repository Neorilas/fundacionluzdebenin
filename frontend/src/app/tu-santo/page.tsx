import { redirect } from 'next/navigation';

// Canonical share URL: /tu-santo/?santo=ID  →  redirects to /es/tu-santo/?santo=ID
export default async function TuSantoRootPage({
  searchParams,
}: {
  searchParams: Promise<{ santo?: string }>;
}) {
  const sp = await searchParams;
  const santoParam = sp.santo ? `?santo=${sp.santo}` : '';
  redirect(`/es/tu-santo/${santoParam}`);
}
