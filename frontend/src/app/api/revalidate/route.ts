import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { paths, tags } = await req.json() as { paths?: string[]; tags?: string[] };
  for (const p of paths ?? []) {
    revalidatePath(p);
  }
  for (const t of tags ?? []) {
    revalidateTag(t);
  }

  return NextResponse.json({ revalidated: true, paths, tags });
}
