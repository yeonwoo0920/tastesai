import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

type CommunityInput = { name?: string; work?: string; category?: string; description?: string; coverImage?: string };

const trim = (value: unknown, limit: number) => typeof value === "string" ? value.trim().slice(0, limit) : "";

export async function GET() {
  try {
    const user = await getChatGPTUser();
    const db = env.DB;
    if (!db) return Response.json({ communities: [], unavailable: true });
    const result = await db.prepare("SELECT id, owner_user_id, name, work, category, description, color, accent, cover_image FROM communities ORDER BY created_at DESC LIMIT 100").all<Record<string, string>>();
    return Response.json({ communities: result.results.map(item => ({
      id: item.id,
      name: item.name,
      work: item.work,
      cat: item.category,
      desc: item.description,
      color: item.color,
      accent: item.accent,
      members: "1",
      memberCount: "1",
      today: 0,
      isOwner: item.owner_user_id === user?.userId,
      coverImage: item.cover_image || "",
    })) });
  } catch (error) {
    console.error("communities load failed", error);
    return Response.json({ communities: [], unavailable: true });
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요해요." }, { status: 401 });
  const db = env.DB;
  if (!db) return Response.json({ error: "저장소를 사용할 수 없어요." }, { status: 503 });

  const input = await request.json() as CommunityInput;
  const name = trim(input.name, 40);
  const work = trim(input.work, 40);
  const category = trim(input.category, 40);
  const description = trim(input.description, 180);
  if (!name || !work || !category || !description) return Response.json({ error: "커뮤니티 이름, 작품·인물, 분야, 소개를 모두 입력해 주세요." }, { status: 400 });

  const id = crypto.randomUUID();
  const color = "#53789a";
  const accent = "#c4dce5";
  try {
    await db.prepare("INSERT INTO communities (id, owner_user_id, name, work, category, description, color, accent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, user.userId, name, work, category, description, color, accent, Date.now()).run();
    return Response.json({ community: { id, name, work, cat: category, desc: description, color, accent, members: "1", memberCount: "1", today: 0, isOwner: true } }, { status: 201 });
  } catch (error) {
    console.error("community create failed", error);
    return Response.json({ error: "같은 이름의 커뮤니티가 이미 있거나 생성하지 못했어요." }, { status: 409 });
  }
}

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "로그인이 필요해요." }, { status: 401 });
  const db = env.DB;
  if (!db) return Response.json({ error: "저장소를 사용할 수 없어요." }, { status: 503 });
  const input = await request.json() as CommunityInput & { id?: string };
  const id = trim(input.id, 80);
  const name = trim(input.name, 40), work = trim(input.work, 40), category = trim(input.category, 40), description = trim(input.description, 180);
  if (!id || !name || !work || !category || !description) return Response.json({ error: "커뮤니티 정보를 모두 입력해 주세요." }, { status: 400 });
  const existing = await db.prepare("SELECT id, owner_user_id, color, accent FROM communities WHERE id = ?").bind(id).first<Record<string, string>>();
  if (!existing) return Response.json({ error: "커뮤니티를 찾을 수 없어요." }, { status: 404 });
  if (existing.owner_user_id !== user.userId) return Response.json({ error: "만든 커뮤니티만 수정할 수 있어요." }, { status: 403 });
  const coverImage = typeof input.coverImage === "string" && input.coverImage.length <= 1_200_000 ? input.coverImage : "";
  await db.prepare("UPDATE communities SET name = ?, work = ?, category = ?, description = ?, cover_image = ? WHERE id = ?").bind(name, work, category, description, coverImage, id).run();
  return Response.json({ community: { id, name, work, cat: category, desc: description, color: existing.color, accent: existing.accent, coverImage, members: "1", memberCount: "1", today: 0, isOwner: true } });
}
