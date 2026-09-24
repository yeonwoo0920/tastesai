import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function GET() {
  try {
    const result = await env.DB.prepare("SELECT id, author_name as author, community, kind, body, images, tags, created_at as createdAt FROM public_posts ORDER BY created_at DESC LIMIT 40").all();
    return Response.json({ posts: result.results.map((p: Record<string, unknown>) => ({ ...p, images: JSON.parse(String(p.images)), tags: JSON.parse(String(p.tags)) })) });
  } catch (error) {
    console.error("posts load failed", error);
    return Response.json({ posts: [], unavailable: true });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요해요." }, { status: 401 });
  const input = await request.json() as { body?: string; community?: string; kind?: string; images?: string[]; tags?: string[] };
  if (!input.body?.trim() && !input.images?.length) return Response.json({ error: "글이나 이미지를 추가해 주세요." }, { status: 400 });
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO public_posts (id, user_id, author_name, community, kind, body, images, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, user.userId, user.fullName ?? user.email.split("@")[0], input.community ?? "자유 취향", input.kind ?? "잡담", input.body?.trim() ?? "", JSON.stringify(input.images ?? []), JSON.stringify(input.tags ?? []), Date.now()).run();
  return Response.json({ id, created: true }, { status: 201 });
}
