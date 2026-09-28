"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Plus, Shield, MessageCircle, CalendarDays, Check, Users, Clock3, MapPin, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PostDetail } from "./post-detail";
import { POST_CATEGORIES, normalizePostCategory } from "./post-categories";

type RoomPost = { id:string; title:string; author:string; community:string; kind:string; time:string; likes:number; comments:number; liked?:boolean; saved?:boolean; image?:string; body?:string; spoiler?:boolean; warning?:string };
type Community = { name:string; work:string; cat:string; members:string; memberCount:string; today:number; desc:string; color:string; accent:string };
type RoomTab = "posts"|"fanwork"|"members"|"chat";
type FanworkKind = "팬아트"|"팬픽·글"|"코스프레"|"커버·리믹스";
type FanworkFilter = FanworkKind|"인기글";
type SecretRoom = { id:string; name:string; password:string; description:string };
const POST_FILTER_CATEGORIES = POST_CATEGORIES.filter(category=>category!=="작품"&&category!=="스포일러");
const makeFanworkPosts=(work:string,community:string):RoomPost[]=>[
  {id:`${community}-fanwork-1`,community,kind:"팬아트",title:`${work} 장면 재해석`,author:"새벽책",time:"18분",likes:92,comments:14,body:`${work}에서 오래 남았던 장면을 제 색으로 다시 그려 봤어요. 원작의 분위기를 해치지 않도록 색감과 표정을 조심해서 잡았습니다.`},
  {id:`${community}-fanwork-2`,community,kind:"팬아트",title:"최애 캐릭터 색연필 드로잉",author:"윤슬",time:"1시간",likes:76,comments:9,body:"색연필로 가볍게 남긴 드로잉이에요. 좋아하는 장면의 온도를 담아 보고 싶었습니다."},
  {id:`${community}-fanwork-3`,community,kind:"팬픽·글",title:"엔딩 이후의 짧은 이야기",author:"책갈피",time:"3시간",likes:54,comments:21,body:"엔딩 이후를 상상하며 쓴 짧은 글입니다. 원작 이후의 감정을 천천히 이어가 보고 싶었어요."},
  {id:`${community}-fanwork-4`,community,kind:"코스프레",title:"주말 의상 제작 기록",author:"밤산책",time:"어제",likes:41,comments:7,body:"주말 동안 만든 의상 제작 기록입니다. 원단 선택부터 작은 장식까지 차근차근 정리했어요."},
  {id:`${community}-fanwork-5`,community,kind:"커버·리믹스",title:"메인 테마 피아노 커버",author:"모카별",time:"어제",likes:69,comments:11,body:"좋아하는 메인 테마를 피아노로 편곡해 봤어요. 원곡의 조용한 분위기를 살리는 데 집중했습니다."}
];

export function FandomRoomView({boardName,communities,joined,onSelect,join,requireLogin,posts,openComposer,openMarket,openMessages,openProfile,initialPostId,onPostDetailClose,onTogglePost}:{boardName:string;communities:readonly Community[];joined:string[];onSelect:(name:string)=>void;join:(name:string)=>void;requireLogin:(action:()=>void)=>void;posts:RoomPost[];openComposer:(kind?:string)=>void;openMarket:()=>void;openMessages:(communityName:string)=>void;openProfile:(name:string)=>void;initialPostId?:string|null;onPostDetailClose?:()=>void;onTogglePost:(id:string,key:"liked"|"saved")=>void}) {
  const [selectedPostId,setSelectedPostId]=useState<string|null>(initialPostId??null);
  const [postCategory,setPostCategory]=useState("전체");
  const [activeTab,setActiveTab]=useState<RoomTab>("posts");
  const [fanworkKind,setFanworkKind]=useState<FanworkFilter>("팬아트");
  const [fanworkPosts,setFanworkPosts]=useState<RoomPost[]>([]);
  const [joinedActivities,setJoinedActivities]=useState<string[]>([]);
  const [wishedGoods,setWishedGoods]=useState<string[]>([]);
  const [communityDockOpen,setCommunityDockOpen]=useState(false);
  const [secretRooms,setSecretRooms]=useState<SecretRoom[]>([]);
  const [secretRoomComposerOpen,setSecretRoomComposerOpen]=useState(false);
  const [secretRoomName,setSecretRoomName]=useState("");
  const [secretRoomDescription,setSecretRoomDescription]=useState("");
  const [secretRoomPassword,setSecretRoomPassword]=useState("");
  const [secretRoomToEnter,setSecretRoomToEnter]=useState<SecretRoom|null>(null);
  const [passwordAttempt,setPasswordAttempt]=useState("");
  const [unlockedSecretRoom,setUnlockedSecretRoom]=useState<SecretRoom|null>(null);
  const joinedCommunities=communities.filter(community=>joined.includes(community.name));
  const community=communities.find(item=>item.name===boardName) ?? joinedCommunities[0] ?? communities[0];
  const joinedHere=joined.includes(boardName);
  const work=community.work;
  const roomPosts=posts.filter(post=>post.community===boardName);
  const allCommunityPosts=[...roomPosts,...fanworkPosts];
  const selectedPost=allCommunityPosts.find(post=>post.id===selectedPostId)??null;
  const hotThreshold=Math.ceil(Number(community.memberCount.replace(/[^0-9]/g,""))*0.15);
  const visiblePosts=roomPosts.filter(post=>postCategory==="전체"||postCategory==="인기글"&&post.likes>=hotThreshold||normalizePostCategory(post.kind)===postCategory);
  const visibleFanworkPosts=fanworkPosts.filter(post=>fanworkKind==="인기글"||post.kind===fanworkKind).sort((a,b)=>fanworkKind==="인기글"?b.likes-a.likes:0);
  const activities=[
    {id:"ra1",type:`온라인 · ${work}`,title:`${work} 같이 보기와 감상 대화`,date:"27",month:"9월",time:"9월 27일 · 오후 9:00",count:"18 / 30명",desc:"각자 공식 감상 경로로 시청한 뒤 커뮤니티 톡방에서 이야기를 나눠요."},
    {id:"ra2",type:`오프라인 · ${work}`,title:"팬 전시 관람 동행",date:"03",month:"10월",time:"10월 3일 · 오후 2:00",count:"5 / 8명",desc:"공개된 장소에서 만나 함께 관람하고 감상을 기록해요."}
  ];
  const goods=[
    {id:"rg1",type:"판매",title:`${work} 아크릴 스탠드 미개봉`,price:"24,000원",seller:"모카별",status:"판매 중"},
    {id:"rg2",type:"교환",title:`${work} 특전 포토카드 교환`,price:"교환",seller:"윤슬",status:"교환 중"}
  ];
  useEffect(()=>{if(initialPostId)setSelectedPostId(initialPostId)},[initialPostId]);
  useEffect(()=>{setFanworkPosts(makeFanworkPosts(work,boardName))},[boardName,work]);
  useEffect(()=>{try{const stored=localStorage.getItem(`chwihyang-secret-rooms:${boardName}`);setSecretRooms(stored?JSON.parse(stored) as SecretRoom[]:[])}catch{setSecretRooms([])}setSecretRoomToEnter(null);setUnlockedSecretRoom(null)},[boardName]);
  const write=()=>requireLogin(()=>{if(!joinedHere){toast("먼저 이 커뮤니티에 가입해 주세요");return;}openComposer(activeTab==="fanwork"?"작품":"잡담")});
  const openSecretRoomComposer=()=>requireLogin(()=>{if(!joinedHere){toast("먼저 이 커뮤니티에 가입해 주세요");return;}setSecretRoomComposerOpen(true)});
  const createSecretRoom=()=>{const name=secretRoomName.trim(),password=secretRoomPassword.trim();if(!name||!password){toast("방 이름과 비밀번호를 입력해 주세요");return;}const next={id:`secret-${Date.now()}`,name,password,description:secretRoomDescription.trim()||"이 방에서만 나누고 싶은 이야기를 남겨보세요."};const rooms=[...secretRooms,next];setSecretRooms(rooms);localStorage.setItem(`chwihyang-secret-rooms:${boardName}`,JSON.stringify(rooms));setSecretRoomName("");setSecretRoomDescription("");setSecretRoomPassword("");setSecretRoomComposerOpen(false);toast.success("비밀방을 만들었어요")};
  const enterSecretRoom=()=>{if(!secretRoomToEnter)return;if(passwordAttempt!==secretRoomToEnter.password){toast.error("비밀번호가 일치하지 않아요");return;}setUnlockedSecretRoom(secretRoomToEnter);setSecretRoomToEnter(null);setPasswordAttempt("")};
  const toggleFanworkPost=(id:string,key:"liked"|"saved")=>setFanworkPosts(current=>current.map(post=>post.id!==id?post:key==="liked"?{...post,liked:!post.liked,likes:post.likes+(post.liked?-1:1)}:{...post,saved:!post.saved}));
  const roomStyle={"--room-color":community.color,"--room-accent":community.accent} as CSSProperties;
  return <div className="single-page fandom-room community-homepage" style={roomStyle}>
    {joinedCommunities.length>1&&<nav className={`joined-community-dock ${communityDockOpen?"open":""}`} aria-label="가입한 커뮤니티 바로 전환"><button className="joined-community-dock-toggle" type="button" aria-expanded={communityDockOpen} onClick={()=>setCommunityDockOpen(open=>!open)}><strong>가입한 커뮤니티</strong><b>{communityDockOpen?"−":"+"}</b></button>{communityDockOpen&&joinedCommunities.map(item=><button key={item.name} type="button" className={item.name===community.name?"active":""} aria-current={item.name===community.name?"page":undefined} aria-label={`${item.name} 커뮤니티로 전환`} onClick={()=>{onSelect(item.name);window.scrollTo({top:0,behavior:"smooth"})}}><CommunityArt community={item}/><span>{item.work}</span></button>)}</nav>}
    <header className="room-head"><div className="room-banner-art"><CommunityArt community={community} large/><span>{work.toUpperCase()} FAN HOME</span></div>
      <div className="room-heading-copy"><small>COMMUNITY HOME · {work}</small><h1>{boardName}</h1><p>{community.desc}</p><div className="room-tags"><span>#{work.replaceAll(" ","")}</span><span>#스포표기</span><span>#다정한대화</span></div><div className="room-stats"><span>TODAY <b>{community.today}</b></span><span>MEMBER <b>{community.memberCount}</b></span></div></div>
      <div className="board-actions"><button className="outline" onClick={()=>join(boardName)}>{joinedHere?"가입 중 · 탈퇴":"가입하기"}</button><button className="secret-room-create" onClick={openSecretRoomComposer}><Shield/> 비밀방 만들기</button></div>
    </header>
    <Tabs value={activeTab} onValueChange={value=>setActiveTab(value as RoomTab)} className="community-tabs"><TabsList><TabsTrigger value="posts">게시글</TabsTrigger><TabsTrigger value="fanwork">2차창작</TabsTrigger><TabsTrigger value="members">멤버</TabsTrigger><TabsTrigger value="chat">단체 대화</TabsTrigger></TabsList>
      <TabsContent value="posts"><div className="inside-board-head"><h2>게시글</h2><button className="primary" onClick={write}><Plus/> 글쓰기</button></div><div className="post-category-filter" aria-label="게시글 카테고리 필터">{["전체","인기글",...POST_FILTER_CATEGORIES].map(category=><button key={category} aria-pressed={postCategory===category} className={postCategory===category?"active":""} onClick={()=>setPostCategory(category)}>{category}</button>)}</div><div className="inside-board-list"><div className="inside-cols"><span>말머리</span><span>제목</span><span>작성자</span><span>시간</span><span>댓글</span><span>좋아요</span></div><div className="inside-notice"><b>공지</b><span>{work} 커뮤니티 이용 규칙과 스포일러 안내</span><span>운영자</span></div>{visiblePosts.map(post=><button key={post.id} onClick={()=>setSelectedPostId(post.id)}><span className="kind">{normalizePostCategory(post.kind)}</span><b>{post.title}</b><span className={post.author==="익명"?"":"author-profile-link"} onClick={event=>{if(post.author!=="익명"){event.stopPropagation();openProfile(post.author)}}}>{post.author}</span><time>{post.time}</time><span>{post.comments}</span><span>{post.likes}</span></button>)}</div>
        {!visiblePosts.length&&<p className="empty-state">이 분류에는 아직 글이 없어요. 첫 기록을 남겨보세요.</p>}
      </TabsContent>
      <TabsContent value="fanwork" className="fanwork-panel"><div className="inside-board-head"><div><h2>2차창작</h2><p className="fanwork-intro">이 커뮤니티의 원작을 바탕으로 만든 팬아트, 팬픽·글, 코스프레, 커버·리믹스를 나눠요.</p></div><button className="primary" onClick={write}><Plus/> 창작 올리기</button></div><div className="post-category-filter" aria-label="2차창작 분류">{(["인기글","팬아트","팬픽·글","코스프레","커버·리믹스"] as FanworkFilter[]).map(name=><button aria-pressed={fanworkKind===name} className={fanworkKind===name?"active":""} onClick={()=>setFanworkKind(name)} key={name}>{name}</button>)}</div><div className="inside-board-list fanwork-board-list"><div className="inside-cols"><span>분류</span><span>제목</span><span>작성자</span><span>시간</span><span>댓글</span><span>좋아요</span></div>{visibleFanworkPosts.map(post=><button key={post.id} onClick={()=>setSelectedPostId(post.id)}><span className="kind">{post.kind}</span><b>{post.title}</b><span className="author-profile-link" onClick={event=>{event.stopPropagation();openProfile(post.author)}}>{post.author}</span><time>{post.time}</time><span>{post.comments}</span><span>{post.likes}</span></button>)}</div>{!visibleFanworkPosts.length&&<p className="empty-state">이 분류에는 아직 창작물이 없어요. 첫 작품을 올려보세요.</p>}</TabsContent>
      <TabsContent value="members"><div className="room-members">{["파란귤","모카별","윤슬","고래구름"].map((name,i)=><div key={name}><button className="member-profile" onClick={()=>openProfile(name)}><span>{name[0]}</span><span><b>{name}</b><small>{i===0?"운영자":"공통 작품 2개"}</small></span></button><button className="outline" onClick={()=>requireLogin(()=>toast.success(`${name}님에게 친구 요청을 보냈어요`))}>친구 요청</button></div>)}</div></TabsContent>
      <TabsContent value="chat"><div className="room-feature-link"><MessageCircle/><div><h2>{boardName} 단체 대화</h2><p>친구 대화와 분리된 이 커뮤니티 전용 톡방으로 이동합니다.</p><small>현재 커뮤니티가 선택된 상태로 열려요.</small></div><button className="primary" onClick={()=>requireLogin(()=>openMessages(boardName))}>대화 참여</button></div><section className="secret-room-list"><div><h2>비밀방</h2><p>비밀번호를 아는 멤버만 방의 글을 읽을 수 있어요.</p></div>{secretRooms.length?<div className="secret-room-items">{secretRooms.map(room=><button key={room.id} onClick={()=>requireLogin(()=>setSecretRoomToEnter(room))}><Shield/><span><b>{room.name}</b><small>{room.description}</small></span><em>비밀번호</em></button>)}</div>:<button className="secret-room-empty" onClick={openSecretRoomComposer}>아직 비밀방이 없어요. 비밀방 만들기</button>}</section></TabsContent>
    </Tabs>
    <PostDetail post={selectedPost} navigationPosts={selectedPost&&fanworkPosts.some(post=>post.id===selectedPost.id)?fanworkPosts:roomPosts} onNavigate={setSelectedPostId} onClose={()=>{setSelectedPostId(null);onPostDetailClose?.()}} onToggleLike={id=>fanworkPosts.some(post=>post.id===id)?requireLogin(()=>toggleFanworkPost(id,"liked")):onTogglePost(id,"liked")} onToggleSave={id=>fanworkPosts.some(post=>post.id===id)?requireLogin(()=>toggleFanworkPost(id,"saved")):onTogglePost(id,"saved")} onOpenProfile={openProfile} requireLogin={requireLogin}/>
    <Dialog open={secretRoomComposerOpen} onOpenChange={setSecretRoomComposerOpen}><DialogContent className="secret-room-dialog"><DialogHeader><DialogTitle>비밀방 만들기</DialogTitle></DialogHeader><p>비밀번호를 아는 멤버만 이 방의 글 내용을 볼 수 있어요.</p><Input value={secretRoomName} onChange={event=>setSecretRoomName(event.target.value)} maxLength={30} placeholder="비밀방 이름"/><Input value={secretRoomPassword} onChange={event=>setSecretRoomPassword(event.target.value)} type="password" maxLength={40} placeholder="비밀번호"/><Input value={secretRoomDescription} onChange={event=>setSecretRoomDescription(event.target.value)} maxLength={80} placeholder="방 소개 (선택)"/><button className="primary" type="button" onClick={createSecretRoom}>비밀방 만들기</button></DialogContent></Dialog>
    <Dialog open={Boolean(secretRoomToEnter)} onOpenChange={open=>{if(!open){setSecretRoomToEnter(null);setPasswordAttempt("")}}}><DialogContent className="secret-room-dialog"><DialogHeader><DialogTitle>{secretRoomToEnter?.name}</DialogTitle></DialogHeader><p>이 방의 글을 읽으려면 비밀번호가 필요해요.</p><Input value={passwordAttempt} onChange={event=>setPasswordAttempt(event.target.value)} onKeyDown={event=>event.key==="Enter"&&enterSecretRoom()} type="password" placeholder="비밀번호 입력"/><button className="primary" type="button" onClick={enterSecretRoom}>내용 보기</button></DialogContent></Dialog>
    <Dialog open={Boolean(unlockedSecretRoom)} onOpenChange={open=>!open&&setUnlockedSecretRoom(null)}><DialogContent className="secret-room-dialog secret-room-reading"><DialogHeader><DialogTitle>{unlockedSecretRoom?.name}</DialogTitle></DialogHeader><span className="kind">비밀방</span><p>{unlockedSecretRoom?.description}</p><small>비밀번호 확인 후 열람한 비밀방입니다.</small></DialogContent></Dialog>
    <details className="joined-community-section"><summary>가입한 커뮤니티 전체보기 · {joinedCommunities.length}개</summary><header><div><span>ALL MY COMMUNITIES</span><h2>가입한 커뮤니티 전체보기</h2><p>카드를 선택하면 위의 커뮤니티 내용이 바로 전환됩니다.</p></div><b>{joinedCommunities.length}개</b></header><div className="joined-community-grid">{joinedCommunities.map(item=><button key={item.name} className={item.name===community.name?"selected":""} onClick={()=>{onSelect(item.name);window.scrollTo({top:0,behavior:"smooth"})}}><CommunityArt community={item} large/><span className="card-copy"><small>{item.cat}</small><strong>{item.name}</strong><p>{item.desc}</p><em><Users/> 멤버 {item.members}명</em></span>{item.name===community.name&&<i><Check/> 현재 보는 중</i>}</button>)}</div></details>
  </div>;
}

function CommunityArt({community,large=false}:{community:Community;large?:boolean}){return <span className={`community-art ${large?"large":""}`} style={{"--cover":community.color,"--accent":community.accent} as CSSProperties} role="img" aria-label={`${community.work} 커뮤니티 대표 이미지`}><span>{community.work.slice(0,1)}</span><i/><b/></span>}
