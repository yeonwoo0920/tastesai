import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function GET() {
  try {
    const result = await env.DB.prepare("SELECT id, author_name as author, community, kind, title, body, images, tags, created_at as createdAt FROM public_posts ORDER BY created_at DESC LIMIT 40").all();
    return Response.json({ posts: result.results.map((p: Record<string, unknown>) => ({ ...p, images: JSON.parse(String(p.images)), tags: JSON.parse(String(p.tags)) })) });
  } catch (error) {
    console.error("posts load failed", error);
    return Response.json({ posts: [], unavailable: true });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요해요." }, { status: 401 });
  const input = await request.json() as { title?: string; body?: string; community?: string; kind?: string; images?: string[]; tags?: string[]; anonymous?: boolean };
  if (!input.title?.trim()) return Response.json({ error: "제목을 입력해 주세요." }, { status: 400 });
  if (!input.body?.trim() && !input.images?.length) return Response.json({ error: "내용이나 이미지를 추가해 주세요." }, { status: 400 });
  const id = crypto.randomUUID();
  const authorName = input.anonymous ? "익명" : user.fullName ?? user.email.split("@")[0];
  await env.DB.prepare("INSERT INTO public_posts (id, user_id, author_name, community, kind, title, body, images, tags, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, user.userId, authorName, input.community ?? "기타 자유게시판", input.kind ?? "잡담", input.title.trim(), input.body?.trim() ?? "", JSON.stringify(input.images ?? []), JSON.stringify(input.tags ?? []), Date.now()).run();
  return Response.json({ id, created: true }, { status: 201 });
}
