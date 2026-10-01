export const POST_CATEGORIES = ["잡담", "감상·후기", "질문", "정보", "작품", "스포일러", "팬아트", "팬픽·글", "코스프레", "커버·리믹스"] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export function normalizePostCategory(category: string): PostCategory {
  if (["감상", "후기", "해석", "감상·후기"].includes(category)) return "감상·후기";
  if (["앓는 글", "덕질 기록", "잡담"].includes(category)) return "잡담";
  if (["정보 공유", "정보"].includes(category)) return "정보";
  if (["작품 공유", "작품"].includes(category)) return "작품";
  if (["팬아트", "팬픽·글", "코스프레", "커버·리믹스"].includes(category)) return category as PostCategory;
  if (category === "스포일러") return "스포일러";
  if (category === "질문") return "질문";
  return "잡담";
}
