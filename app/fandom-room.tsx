"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Plus, Shield, MessageCircle, CalendarDays, ChevronDown, Check, Users, Compass } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { POST_CATEGORIES, normalizePostCategory } from "./post-categories";

type RoomPost = { id:string; title:string; author:string; community:string; kind:string; time:string; likes:number; comments:number; image?:string };
type Community = { name:string; work:string; cat:string; members:string; memberCount:string; today:number; desc:string; color:string; accent:string };

export function FandomRoomView({boardName,communities,joined,onSelect,join,requireLogin,posts,openComposer,openMarket,openMessages,openDiscover}:{boardName:string;communities:readonly Community[];joined:string[];onSelect:(name:string)=>void;join:(name:string)=>void;requireLogin:(action:()=>void)=>void;posts:RoomPost[];openComposer:()=>void;openMarket:()=>void;openMessages:()=>void;openDiscover:()=>void}) {
  const [selectorOpen,setSelectorOpen]=useState(false);
  const [postCategory,setPostCategory]=useState("전체");
  const selectorRef=useRef<HTMLDivElement>(null);
  const joinedCommunities=communities.filter(community=>joined.includes(community.name));
  const community=communities.find(item=>item.name===boardName) ?? joinedCommunities[0] ?? communities[0];
  const joinedHere=joined.includes(boardName);
  const work=community.work;
  const roomPosts=posts.filter(post=>post.community===boardName);
  const visiblePosts=roomPosts.filter(post=>postCategory==="전체"||normalizePostCategory(post.kind)===postCategory);
  useEffect(()=>{const close=(event:MouseEvent)=>{if(!selectorRef.current?.contains(event.target as Node))setSelectorOpen(false)};document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close)},[]);
  const write=()=>{if(!joinedHere){toast("먼저 이 커뮤니티에 가입해 주세요");return;}requireLogin(openComposer)};
  const roomStyle={"--room-color":community.color,"--room-accent":community.accent} as CSSProperties;
  return <div className="single-page fandom-room community-homepage" style={roomStyle}>
    <section className="community-switcher" ref={selectorRef}>
      <div className="switcher-heading"><div><span>내 커뮤니티</span><small>가입한 {joinedCommunities.length}개 커뮤니티</small></div><button className="find-community" onClick={openDiscover}><Compass/> 커뮤니티 찾기</button></div>
      {joinedCommunities.length ? <><button className="current-community" aria-haspopup="listbox" aria-expanded={selectorOpen} onClick={()=>setSelectorOpen(open=>!open)}><CommunityArt community={community}/><span><small>현재 선택된 커뮤니티</small><b>{community.name}</b><em>{community.cat}</em></span><ChevronDown className={selectorOpen?"open":""}/></button>
      {selectorOpen&&<div className="community-picker" role="listbox" aria-label="가입한 커뮤니티 선택"><div className="picker-title"><b>커뮤니티 전환</b><small>페이지 이동 없이 바로 바뀌어요</small></div>{joinedCommunities.map(item=><button key={item.name} role="option" aria-selected={item.name===community.name} onClick={()=>{onSelect(item.name);setSelectorOpen(false)}}><CommunityArt community={item}/><span><b>{item.name}</b><small>{item.desc}</small></span>{item.name===community.name&&<Check/>}</button>)}</div>}</>:<div className="no-communities"><Users/><div><b>아직 가입한 커뮤니티가 없어요</b><p>관심 있는 작품의 커뮤니티를 찾아 가입해 보세요.</p></div><button className="primary" onClick={openDiscover}>커뮤니티 찾기</button></div>}
    </section>
    <header className="room-head"><div className="room-banner-art"><CommunityArt community={community} large/><span>{work.toUpperCase()} FAN HOME</span></div>
      <div className="room-heading-copy"><small>COMMUNITY HOME · {work}</small><h1>{boardName}</h1><p>{community.desc}</p><div className="room-tags"><span>#{work.replaceAll(" ","")}</span><span>#스포표기</span><span>#다정한대화</span></div><div className="room-stats"><span>TODAY <b>{community.today}</b></span><span>MEMBER <b>{community.memberCount}</b></span></div></div>
      <div className="board-actions"><button className="outline" onClick={()=>join(boardName)}>{joinedHere?"가입됨":"가입하기"}</button></div>
    </header>
    <Tabs defaultValue="posts" className="community-tabs"><TabsList><TabsTrigger value="home">홈</TabsTrigger><TabsTrigger value="posts">게시글</TabsTrigger><TabsTrigger value="fanwork">2차창작</TabsTrigger><TabsTrigger value="gallery">작품·사진</TabsTrigger><TabsTrigger value="members">멤버</TabsTrigger><TabsTrigger value="activity">활동</TabsTrigger><TabsTrigger value="goods">굿즈</TabsTrigger><TabsTrigger value="chat">단체 대화</TabsTrigger></TabsList>
      <TabsContent value="home"><div className="room-overview"><section><h2>이 방에서 나누는 이야기</h2><p>잡담, 감상·후기, 질문, 정보와 팬 작품을 함께 나눠요.</p></section><section><Shield/><div><h2>스포일러와 창작 규칙</h2><p>스포일러가 있는 글은 옵션을 켜고, 다른 감상과 최애를 존중해 주세요.</p></div></section></div></TabsContent>
      <TabsContent value="posts"><div className="inside-board-head"><h2>게시글</h2><button className="primary" onClick={write}><Plus/> 글쓰기</button></div><div className="post-category-filter" aria-label="게시글 카테고리 필터">{["전체",...POST_CATEGORIES].map(category=><button key={category} className={postCategory===category?"active":""} onClick={()=>setPostCategory(category)}>{category}</button>)}</div><div className="inside-board-list"><div className="inside-cols"><span>말머리</span><span>제목</span><span>작성자</span><span>시간</span><span>조회</span><span>댓글</span><span>좋아요</span></div><div className="inside-notice"><b>공지</b><span>{work} 커뮤니티 이용 규칙과 스포일러 안내</span><span>운영자</span></div>{visiblePosts.concat(visiblePosts.slice(0,2)).map((post,i)=><button key={`${post.id}-${i}`}><span className="kind">{normalizePostCategory(post.kind)}</span><b>{post.title}</b><span>{post.author}</span><time>{post.time}</time><span>{328-i*31}</span><span>{post.comments}</span><span>{post.likes}</span></button>)}</div></TabsContent>
      <TabsContent value="fanwork"><div className="inside-board-head"><div><h2>2차창작</h2><p className="fanwork-intro">이 커뮤니티의 원작을 바탕으로 만든 팬아트, 팬픽·글, 코스프레, 커버·리믹스를 나눠요.</p></div><button className="primary" onClick={write}><Plus/> 창작 올리기</button></div><div className="fanwork-categories" aria-label="2차창작 분류">{["팬아트","팬픽·글","코스프레","커버·리믹스"].map((name,i)=><button className={i===0?"active":""} key={name}>{name}</button>)}</div><div className="gallery"><article><span>팬아트</span><b>{work} 장면 재해석</b><small>원작 · {work}</small></article><article><span>팬픽·글</span><b>엔딩 이후의 짧은 이야기</b><small>스포일러 경고</small></article></div></TabsContent>
      <TabsContent value="gallery"><p className="gallery-note">스포일러와 민감한 내용 여부가 작품마다 함께 표시됩니다.</p><div className="gallery"><article><span>팬아트</span><b>{work} 장면 재해석</b></article><article><span>팬픽·글</span><b>엔딩 이후의 짧은 이야기</b><small>스포일러 경고</small></article></div></TabsContent>
      <TabsContent value="members"><div className="room-members">{["파란귤","모카별","윤슬","고래구름"].map((name,i)=><div key={name}><span>{name[0]}</span><div><b>{name}</b><small>{i===0?"운영자":"공통 작품 2개"}</small></div><button className="outline">덕친 요청</button></div>)}</div></TabsContent>
      <TabsContent value="activity"><div className="room-feature-link"><CalendarDays/><div><h2>{work} 같이 즐기기</h2><p>같이 보기, 온라인 감상회, 공연 동행과 굿즈 교환 모임을 확인하세요.</p><small>오프라인 상세 장소는 참가 승인 후 공개됩니다.</small></div></div></TabsContent>
      <TabsContent value="goods"><div className="room-feature-link"><div><h2>{work} 굿즈</h2><p>판매·구해요·교환·나눔 글을 작품과 캐릭터 기준으로 확인하세요.</p></div><button className="outline" onClick={openMarket}>거래소에서 보기</button></div></TabsContent>
      <TabsContent value="chat"><div className="room-feature-link"><MessageCircle/><div><h2>{boardName} 단체 대화</h2><p>방 멤버들과 실시간으로 감상과 소식을 나눠요.</p></div><button className="primary" onClick={()=>requireLogin(openMessages)}>대화 참여</button></div></TabsContent>
    </Tabs>
    <section className="joined-community-section"><header><div><span>ALL MY COMMUNITIES</span><h2>가입한 커뮤니티 전체보기</h2><p>카드를 선택하면 위의 커뮤니티 내용이 바로 전환됩니다.</p></div><b>{joinedCommunities.length}개</b></header><div className="joined-community-grid">{joinedCommunities.map(item=><button key={item.name} className={item.name===community.name?"selected":""} onClick={()=>{onSelect(item.name);window.scrollTo({top:0,behavior:"smooth"})}}><CommunityArt community={item} large/><span className="card-copy"><small>{item.cat}</small><strong>{item.name}</strong><p>{item.desc}</p><em><Users/> 멤버 {item.members}명</em></span>{item.name===community.name&&<i><Check/> 현재 보는 중</i>}</button>)}</div></section>
  </div>;
}

function CommunityArt({community,large=false}:{community:Community;large?:boolean}){return <span className={`community-art ${large?"large":""}`} style={{"--cover":community.color,"--accent":community.accent} as CSSProperties} role="img" aria-label={`${community.work} 커뮤니티 대표 이미지`}><span>{community.work.slice(0,1)}</span><i/><b/></span>}
