import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const entries = await getCollection('specs');
  entries.sort((a, b) => a.id.localeCompare(b.id));

  const parts: string[] = [
    '# Dogology HealthSpan Kits — Full Documentation',
    '',
    '> Auto-generated from all specs in the repository.',
    '> Source: https://dogkit.vercel.app/',
    '',
  ];

  for (const entry of entries) {
    const title = entry.data.title ?? entry.id.replace(/\.md$/i, '');
    parts.push('---');
    parts.push('');
    parts.push(`## ${title}`);
    parts.push(`Source: specs/${entry.id}`);
    parts.push('');
    parts.push(entry.body ?? '');
    parts.push('');
  }

  return new Response(parts.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
