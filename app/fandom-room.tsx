"use client";

import { Plus, Shield, MessageCircle, CalendarDays } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type RoomPost = { id:string; title:string; author:string; kind:string; time:string; likes:number; comments:number; image?:string };

export function FandomRoomView({boardName,joined,join,requireLogin,posts,openComposer,openMarket,openMessages}:{boardName:string;joined:string[];join:(name:string)=>void;requireLogin:(action:()=>void)=>void;posts:RoomPost[];openComposer:()=>void;openMarket:()=>void;openMessages:()=>void}) {
  const fanwork=boardName.startsWith("2차창작");
  const joinedHere=joined.includes(boardName);
  const work=fanwork?"여러 원작":boardName.includes("프리렌")?"장송의 프리렌":boardName.includes("듄")?"듄":boardName.includes("원신")?"원신":"데미안";
  const write=()=>{if(!joinedHere){toast("먼저 이 덕질방에 가입해 주세요");return;}requireLogin(openComposer)};
  return <div className="single-page fandom-room">
    <header className="room-head">
      <div><small>{fanwork?"2차창작":"덕질방"} · {work}</small><h1>{boardName}</h1><p>{fanwork?"원작과 창작자를 존중하며 팬아트, 팬픽, 코스프레와 커버를 나누는 공간이에요.":"작품을 좋아하는 사람들이 감상과 해석, 앓는 마음을 나누는 작은 방이에요."}</p><div className="room-tags"><span>#{work.replaceAll(" ","")}</span><span>#스포표기</span><span>#다정한대화</span></div><div className="room-stats">멤버 {fanwork?"3,218":"12,428"}명 · 오늘 새 글 {fanwork?"74":"38"}개</div></div>
      <div className="board-actions"><button className="outline" onClick={()=>join(boardName)}>{joinedHere?"가입됨":"가입하기"}</button><button className="primary" onClick={write}><Plus/> 이 덕질방에 글쓰기</button></div>
    </header>
    <Tabs defaultValue="posts" className="community-tabs"><TabsList><TabsTrigger value="home">홈</TabsTrigger><TabsTrigger value="posts">게시글</TabsTrigger><TabsTrigger value="gallery">작품·사진</TabsTrigger><TabsTrigger value="members">멤버</TabsTrigger><TabsTrigger value="activity">활동</TabsTrigger><TabsTrigger value="goods">굿즈</TabsTrigger><TabsTrigger value="chat">단체 대화</TabsTrigger></TabsList>
      <TabsContent value="home"><div className="room-overview"><section><h2>이 방에서 나누는 이야기</h2><p>회차 감상, 인물 해석, 정보, 앓는 글과 팬 작품을 함께 나눠요.</p></section><section><Shield/><div><h2>스포일러와 창작 규칙</h2><p>회차·챕터·진행 구간을 적고, 다른 해석과 최애를 존중해 주세요.</p></div></section></div></TabsContent>
      <TabsContent value="posts"><div className="inside-board-head"><h2>게시글</h2><button className="primary" onClick={write}><Plus/> 글쓰기</button></div><div className="inside-board-list"><div className="inside-cols"><span>말머리</span><span>제목</span><span>작성자</span><span>시간</span><span>조회</span><span>댓글</span><span>좋아요</span></div><div className="inside-notice"><b>공지</b><span>{work} 덕질방 이용 규칙과 스포일러 안내</span><span>운영자</span></div>{posts.concat(posts.slice(0,2)).map((post,i)=><button key={`${post.id}-${i}`}><span className="kind">{i===2?"스포일러":post.kind}</span><b>{i===2?"[진행 구간 포함] 확인 후 열어주세요":post.title}</b><span>{i===3?"익명":post.author}</span><time>{post.time}</time><span>{328-i*31}</span><span>{post.comments}</span><span>{post.likes}</span></button>)}</div></TabsContent>
      <TabsContent value="gallery"><p className="gallery-note">원작명, 대상, 스포일러와 민감한 내용 여부가 작품마다 함께 표시됩니다.</p><div className="gallery"><article><span>팬아트</span><b>{work} 장면 재해석</b><small>원작 · {work}</small></article><article><span>팬픽·글</span><b>엔딩 이후의 짧은 이야기</b><small>스포일러 경고</small></article></div></TabsContent>
      <TabsContent value="members"><div className="room-members">{["파란귤","모카별","윤슬","고래구름"].map((name,i)=><div key={name}><span>{name[0]}</span><div><b>{name}</b><small>{i===0?"운영자":"공통 작품 2개"}</small></div><button className="outline">덕친 요청</button></div>)}</div></TabsContent>
      <TabsContent value="activity"><div className="room-feature-link"><CalendarDays/><div><h2>{work} 같이 즐기기</h2><p>같이 보기, 온라인 감상회, 공연 동행과 굿즈 교환 모임을 확인하세요.</p><small>오프라인 상세 장소는 참가 승인 후 공개됩니다.</small></div></div></TabsContent>
      <TabsContent value="goods"><div className="room-feature-link"><div><h2>{work} 굿즈</h2><p>판매·구해요·교환·나눔 글을 작품과 캐릭터 기준으로 확인하세요.</p></div><button className="outline" onClick={openMarket}>거래소에서 보기</button></div></TabsContent>
      <TabsContent value="chat"><div className="room-feature-link"><MessageCircle/><div><h2>{boardName} 단체 대화</h2><p>방 멤버들과 실시간으로 감상과 소식을 나눠요.</p></div><button className="primary" onClick={()=>requireLogin(openMessages)}>대화 참여</button></div></TabsContent>
    </Tabs>
  </div>;
}
