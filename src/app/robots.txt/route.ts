export function GET() {
  return new Response("User-agent: *\nAllow: /\n", { headers: { "Content-Type": "text/plain" } });
}


