"use client";

import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Bookmark, Heart } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReadablePost = { id:string; title:string; community:string; author:string; time:string; kind:string; body?:string; image?:string; spoiler?:boolean; warning?:string; likes:number; comments:number; liked?:boolean; saved?:boolean };

export function PostDetail({post,navigationPosts=[],onNavigate,onClose,onToggleLike,onToggleSave,onOpenProfile,requireLogin}:{post:ReadablePost|null;navigationPosts?:ReadablePost[];onNavigate?:(id:string)=>void;onClose:()=>void;onToggleLike?:(id:string)=>void;onToggleSave?:(id:string)=>void;onOpenProfile?:(name:string)=>void;requireLogin?:(action:()=>void)=>void}) {
  const [revealed,setRevealed]=useState<string|null>(null);
  const [comment,setComment]=useState("");
  const hidden=post && (post.spoiler||post.kind==="스포일러") && revealed!==post.id;
  const currentIndex=post?navigationPosts.findIndex(item=>item.id===post.id):-1;
  // 게시판 목록은 최신글부터 정렬되어 있으므로 이전글은 한 칸 아래, 다음글은 한 칸 위입니다.
  const previousPost=currentIndex>=0?navigationPosts[currentIndex+1]:undefined;
  const nextPost=currentIndex>0?navigationPosts[currentIndex-1]:undefined;
  // The parent owns post reactions so the list and this reading view always share one value.
  const toggleLike=()=>post&&onToggleLike?.(post.id);
  const toggleSave=()=>post&&onToggleSave?.(post.id);
  const submitComment=()=>requireLogin?.(()=>{if(!comment.trim())return;setComment("");});
  return <Dialog open={Boolean(post)} onOpenChange={open=>{if(!open){setRevealed(null);setComment("");onClose()}}}>
    <DialogContent className="board-detail" aria-describedby={undefined}>
      {post&&<article className="post-detail-reading">
        <header className="post-detail-header"><div className="post-detail-tools"><button className="post-detail-back" type="button" onClick={onClose}><ArrowLeft/> 목록으로</button><span className="kind">{post.kind}</span></div><h1>{post.title}</h1><div className="post-detail-meta">{post.author==="익명"?<span>작성자 익명</span>:<button className="author-profile-link" type="button" onClick={()=>onOpenProfile?.(post.author)}>작성자 {post.author}</button>}<span>2026.09.25 · {post.time}</span><span>조회 42</span><span>댓글 {post.comments}</span></div></header>
        <div className="post-detail-body">{hidden?<div className="spoiler-gate"><p>{post.warning||"스포일러가 포함된 글이에요. 감상한 뒤 열어보세요."}</p><button className="outline" type="button" onClick={()=>setRevealed(post.id)}>스포일러 내용 보기</button></div>:<><p>{post.body}</p>{post.image&&<img src={post.image} alt="게시글 첨부 이미지"/>}</>}</div>
        <div className="post-detail-reaction"><button className={post.liked?"liked":""} type="button" aria-pressed={Boolean(post.liked)} onClick={toggleLike}><Heart fill={post.liked?"currentColor":"none"}/>{post.liked?"좋아요":"좋아요"} {post.likes}</button><button className={post.saved?"saved":""} type="button" aria-pressed={Boolean(post.saved)} onClick={toggleSave}><Bookmark fill={post.saved?"currentColor":"none"}/>{post.saved?"북마크됨":"북마크"}</button></div>
        {navigationPosts.length>1&&<nav className="post-detail-neighbors" aria-label="이전글과 다음글"><button type="button" disabled={!previousPost} onClick={()=>previousPost&&onNavigate?.(previousPost.id)}><ArrowUp/><span>이전글</span><b>{previousPost?.title||"이전글이 없어요"}</b></button><button type="button" disabled={!nextPost} onClick={()=>nextPost&&onNavigate?.(nextPost.id)}><ArrowDown/><span>다음글</span><b>{nextPost?.title||"다음글이 없어요"}</b></button></nav>}
        <section className="post-detail-comments" aria-label="댓글 영역"><h2>댓글 {post.comments}</h2><div className="comment-box"><Input value={comment} onChange={event=>setComment(event.target.value)} placeholder="댓글을 입력하세요" aria-label="댓글 내용"/><Button type="button" onClick={submitComment}>등록</Button></div></section>
      </article>}
    </DialogContent>
  </Dialog>;
}
