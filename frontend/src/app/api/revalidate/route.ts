import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { paths } = await req.json() as { paths?: string[] };
  for (const p of paths ?? []) {
    revalidatePath(p);
  }

  return NextResponse.json({ revalidated: true, paths });
}
