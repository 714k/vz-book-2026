export function GET() {
  return new Response(
    `User-agent: *
Allow: /

Sitemap: https://victorzamudio.dev/sitemap-index.xml
`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    },
  );
}
