"use client";

import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Bookmark, BookOpen, CalendarDays, ImagePlus, MessageCircle, Palette, Shield, ShoppingBag, Sparkles, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Viewer = { id:string; name:string; email:string } | null;
type ProfileTab = "home" | "diary" | "records" | "guestbook";
type ProfileDetails = { name:string; intro:string; status:string; tags:string[] };
type GuestbookEntry = { id:number; author:string; message:string; date:string };
type RoomSettings = { backgroundImage:string; backgroundPosition:"top"|"center"|"bottom"; roomLabel:string; roomTitle:string; roomDescription:string; textTone:"light"|"dark"; overlayStyle:"none"|"light"|"dark" };

const defaultRoom:RoomSettings={backgroundImage:"",backgroundPosition:"center",roomLabel:"오늘의 취향",roomTitle:"좋아하는 장면을 오래 간직하는 방",roomDescription:"최근에는 프리렌의 조용한 장면들과 듄의 세계관을 다시 보고 있어요.",textTone:"dark",overlayStyle:"light"};

const diaries = [
  { date:"09.24", title:"프리렌 28화 엔딩 이후의 표정 이야기", body:"말보다 오래 남았던 마지막 표정과 장면을 천천히 다시 보았다." },
  { date:"09.22", title:"듄 원작과 영화의 장면을 나란히 보기", body:"같은 장면이 문장과 화면에서 어떻게 다르게 느껴지는지 기록했다." },
  { date:"09.19", title:"폰타인 퀘스트에서 다시 발견한 복선", body:"처음에는 지나쳤던 대사들이 결말을 알고 나니 새롭게 보였다." },
];
const records = [
  { work:"장송의 프리렌", kind:"회차 감상", date:"2026.09.24" },
  { work:"듄", kind:"원작·영화 비교", date:"2026.09.22" },
  { work:"푸리나 · 원신", kind:"인물 기록", date:"2026.09.19" },
  { work:"데미안", kind:"문장 수집", date:"2026.09.14" },
];

export function FandomProfile({user,signInPath,signOutPath,openMessages}:{user:Viewer;signInPath:string;signOutPath:string;openMessages:()=>void}) {
  const [decorating,setDecorating]=useState(false);
  const [activeTab,setActiveTab]=useState<ProfileTab>("home");
  const [editing,setEditing]=useState(false);
  const roomImageRef=useRef<HTMLInputElement>(null);
  const [guestbookMessage,setGuestbookMessage]=useState("");
  const [guestbook,setGuestbook]=useState<GuestbookEntry[]>([
    {id:1,author:"모카별",message:"새 글 잘 읽었어요! 다음 기록도 기다릴게요.",date:"09.23"},
    {id:2,author:"윤슬",message:"취향이 닮아서 반가워요. 자주 놀러 올게요!",date:"09.20"},
  ]);
  const [initialStyle]=useState(()=>{if(typeof window==="undefined")return {accent:"#5a82d7",pattern:"dot",frame:"classic"};try{return JSON.parse(localStorage.getItem("mini-home-style")||"null")||{accent:"#5a82d7",pattern:"dot",frame:"classic"}}catch{return {accent:"#5a82d7",pattern:"dot",frame:"classic"}}});
  const [accent]=useState(initialStyle.accent);
  const [pattern]=useState(initialStyle.pattern);
  const [frame]=useState(initialStyle.frame);
  const [initialRoom]=useState<RoomSettings>(()=>{if(typeof window==="undefined")return defaultRoom;try{return {...defaultRoom,...JSON.parse(localStorage.getItem("mini-home-room")||"null")}}catch{return defaultRoom}});
  const [room,setRoom]=useState<RoomSettings>(initialRoom);
  const [roomDraft,setRoomDraft]=useState<RoomSettings>(initialRoom);
  const [roomError,setRoomError]=useState("");
  const defaultProfile:ProfileDetails={name:user?.name||"",intro:"이야기가 오래 남는 작품과 인물을 천천히 기록해요.",status:"오늘도 좋아하는 것을 오래 보기",tags:["프리렌","듄","원신","데미안"]};
  const [profile,setProfile]=useState<ProfileDetails>(defaultProfile);
  const [draft,setDraft]=useState<ProfileDetails>(defaultProfile);
  const openDecor=()=>{setRoomDraft(room);setRoomError("");setDecorating(true)};
  const cancelDecor=()=>{setRoomDraft(room);setRoomError("");setDecorating(false)};
  const saveDecor=()=>{try{localStorage.setItem("mini-home-style",JSON.stringify({accent,pattern,frame}));localStorage.setItem("mini-home-room",JSON.stringify(roomDraft));setRoom(roomDraft);setDecorating(false);toast.success("내 덕질방 꾸미기를 저장했어요")}catch{setRoomError("브라우저 저장 공간이 부족해요. 더 작은 사진을 선택해 주세요.")}};
  const pickRoomImage=(file?:File)=>{if(!file)return;setRoomError("");if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setRoomError("JPG, PNG, WebP 이미지만 사용할 수 있어요.");return;}if(file.size>5_000_000){setRoomError("배경 이미지는 5MB 이하로 선택해 주세요.");return;}const objectUrl=URL.createObjectURL(file);const image=new Image();image.onload=()=>{const scale=Math.min(1,1600/image.width,900/image.height);const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext("2d")?.drawImage(image,0,0,canvas.width,canvas.height);const backgroundImage=canvas.toDataURL("image/webp",.82);URL.revokeObjectURL(objectUrl);if(backgroundImage.length>1_200_000){setRoomError("압축 후에도 이미지가 너무 커요. 더 작은 사진을 선택해 주세요.");return;}setRoomDraft(value=>({...value,backgroundImage}));};image.onerror=()=>{URL.revokeObjectURL(objectUrl);setRoomError("이미지를 불러오지 못했어요.")};image.src=objectUrl};
  const openProfileEditor=()=>{setDraft({...profile,tags:[...profile.tags]});setEditing(true)};
  const saveProfile=(event:FormEvent)=>{event.preventDefault();const name=draft.name.trim();if(!name){toast.error("표시 이름을 입력해 주세요");return;}setProfile({...draft,name,tags:draft.tags.filter(Boolean)});setEditing(false);toast.success("프로필을 저장했어요")};
  const addGuestbook=(event:FormEvent)=>{event.preventDefault();const message=guestbookMessage.trim();if(!message)return;setGuestbook(entries=>[{id:Date.now(),author:profile.name,message,date:"방금"},...entries]);setGuestbookMessage("")};
  if(!user) return <div className="single-page profile-login"><h1>나만의 덕질 기록을 모아보세요</h1><p>로그인하면 최애 작품, 커뮤니티, 기록과 덕친을 한곳에서 관리할 수 있어요.</p><a className="primary" href={signInPath} target="_top">로그인 / 회원가입</a></div>;
  const items=[[Users,"가입한 커뮤니티","2개"],[BookOpen,"덕질 기록","8개"],[Palette,"2차창작","3개"],[Bookmark,"북마크","24개"],[CalendarDays,"참여 중인 활동","2개"],[ShoppingBag,"거래 중인 굿즈","1개"]] as const;
  const style={"--mini-accent":accent} as CSSProperties;
  const visibleRoom=decorating?roomDraft:room;
  const roomStyle={backgroundImage:visibleRoom.backgroundImage?`url(${JSON.stringify(visibleRoom.backgroundImage)})`:undefined,backgroundPosition:visibleRoom.backgroundPosition} as CSSProperties;
  return <div className={`single-page profile-page mini-home pattern-${pattern} frame-${frame}`} style={style}>
    <header className="mini-home-top"><div className="visit-counter"><small>TODAY</small><b>024</b><i/><small>TOTAL</small><b>12,948</b></div><div className="mini-home-title"><span>MY TASTE HOME</span><h1>{profile.name}의 작은 취향 공간</h1></div><div className="mini-home-mood"><small>♬ {profile.status}</small><button className="decorate-button" onClick={openDecor}><Sparkles/> 꾸미기</button></div></header>
    {decorating&&<section className="decorate-panel room-decor-panel" aria-label="내 덕질방 꾸미기"><header><div><b>내 덕질방 꾸미기</b><p>좋아하는 작품이나 장면으로 나만의 공간을 꾸며보세요.</p></div></header><div className="room-decor-grid"><fieldset><legend>내 덕질방 배경</legend><input ref={roomImageRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>pickRoomImage(event.target.files?.[0])}/><div className="room-image-actions"><button className="outline" type="button" onClick={()=>roomImageRef.current?.click()}><ImagePlus/>{roomDraft.backgroundImage?"사진 변경":"사진 선택"}</button>{roomDraft.backgroundImage&&<button type="button" onClick={()=>setRoomDraft(value=>({...value,backgroundImage:""}))}>사진 제거</button>}</div><small>JPG, PNG, WebP · 원본 5MB 이하</small><label>배경 위치<select value={roomDraft.backgroundPosition} onChange={event=>setRoomDraft(value=>({...value,backgroundPosition:event.target.value as RoomSettings["backgroundPosition"]}))}><option value="top">위</option><option value="center">가운데</option><option value="bottom">아래</option></select></label></fieldset><fieldset><legend>덕질방 문구</legend><label>오늘의 라벨<input maxLength={20} value={roomDraft.roomLabel} onChange={event=>setRoomDraft(value=>({...value,roomLabel:event.target.value}))}/><small>{roomDraft.roomLabel.length}/20</small></label><label>메인 문구<input maxLength={40} value={roomDraft.roomTitle} onChange={event=>setRoomDraft(value=>({...value,roomTitle:event.target.value}))}/><small>{roomDraft.roomTitle.length}/40</small></label><label>소개<textarea maxLength={100} value={roomDraft.roomDescription} onChange={event=>setRoomDraft(value=>({...value,roomDescription:event.target.value}))}/><small>{roomDraft.roomDescription.length}/100</small></label></fieldset><fieldset><legend>사진 위 가독성</legend><label>텍스트<select value={roomDraft.textTone} onChange={event=>setRoomDraft(value=>({...value,textTone:event.target.value as RoomSettings["textTone"]}))}><option value="dark">어둡게</option><option value="light">밝게</option></select></label><label>배경 효과<select value={roomDraft.overlayStyle} onChange={event=>setRoomDraft(value=>({...value,overlayStyle:event.target.value as RoomSettings["overlayStyle"]}))}><option value="none">없음</option><option value="light">밝게</option><option value="dark">어둡게</option></select></label></fieldset></div>{roomError&&<p className="form-error">{roomError}</p>}<footer><span>아래 덕질방에서 미리보기를 확인할 수 있어요.</span><div><button className="outline" type="button" onClick={cancelDecor}>취소</button><button className="primary" type="button" onClick={saveDecor}>저장</button></div></footer></section>}
    <div className="mini-home-body"><aside className="mini-profile-panel"><span className="panel-label">PROFILE</span><span className="avatar lg">{profile.name[0]}</span><h2>{profile.name}</h2><small>@taste_friend</small><p>{profile.intro}</p><div className="mini-status">♬ {profile.status}</div><div className="interest-tags">{profile.tags.map(tag=><span key={tag}>{tag}</span>)}</div><button className="outline" onClick={openProfileEditor}>프로필 편집</button></aside>
      <main className="mini-main">
      {activeTab==="home"&&<><section className={`mini-feature tone-${visibleRoom.textTone} overlay-${visibleRoom.overlayStyle} ${visibleRoom.backgroundImage?"has-room-image":""}`} style={roomStyle}><div className="room-overlay"/><div className="room-content"><span className="panel-label">TODAY&apos;S ROOM</span><div className="feature-copy"><small>{visibleRoom.roomLabel}</small><h2>{visibleRoom.roomTitle}</h2><p>{visibleRoom.roomDescription}</p></div><div className="mini-shelf">{profile.tags.map(tag=><span key={tag}>{tag}</span>)}</div></div></section><section className="mini-diary"><header><span className="panel-label">RECENT DIARY</span><button onClick={()=>setActiveTab("diary")}>전체 보기</button></header>{diaries.map(item=><article key={item.title}><time>{item.date}</time><b>{item.title}</b><span>댓글 12</span></article>)}</section></>}
      {activeTab==="diary"&&<section className="mini-diary mini-tab-list"><header><span className="panel-label">MY DIARY</span></header>{diaries.map(item=><article key={item.title}><time>{item.date}</time><div><b>{item.title}</b><p>{item.body}</p></div></article>)}</section>}
      {activeTab==="records"&&<section className="mini-diary mini-tab-list"><header><span className="panel-label">TASTE RECORDS</span></header>{records.map(item=><article key={`${item.work}-${item.date}`}><time>{item.date}</time><div><b>{item.work}</b><p>{item.kind}</p></div></article>)}</section>}
      {activeTab==="guestbook"&&<section className="mini-diary mini-tab-list"><header><span className="panel-label">GUEST BOOK</span></header><form className="guestbook-form" onSubmit={addGuestbook}><input value={guestbookMessage} onChange={event=>setGuestbookMessage(event.target.value)} placeholder="방명록을 남겨주세요" aria-label="방명록 내용"/><button className="primary" type="submit">등록</button></form>{guestbook.map(entry=><article key={entry.id}><time>{entry.date}</time><div><b>{entry.author}</b><p>{entry.message}</p></div></article>)}</section>}
      </main>
      <nav className="mini-menu" aria-label="미니홈피 메뉴">{[["home","홈"],["diary","다이어리"],["records","기록"],["guestbook","방명록"]].map(([id,label])=><button key={id} className={activeTab===id?"active":""} onClick={()=>setActiveTab(id as ProfileTab)}>{label}</button>)}</nav></div>
    <nav className="mini-utility-menu" aria-label="마이페이지 바로가기">{items.map(([Icon,label,count])=><button key={label}><Icon/><span>{label}</span><b>{count}</b></button>)}<button onClick={openMessages}><MessageCircle/><span>덕친 대화</span><b>3</b></button></nav>
    <section className="mini-bottom-grid"><section><h2>팔로우한 작품·인물</h2>{["장송의 프리렌","듄","원신","하야미 사오리"].map((name,i)=><div className="followed-work" key={name}><span>{name[0]}</span><div><b>{name}</b><small>{i===3?"성우":"새 기록이 도착했어요"}</small></div></div>)}</section><section><h2>덕친과 방명록</h2><div className="friend-preview"><span className="avatar sm">모</span><span><b>모카별</b><small>“새 글 잘 읽었어요!”</small></span><button className="primary">수락</button></div><div className="friend-preview"><span className="avatar sm">윤</span><span><b>윤슬</b><small>공통 최애 · 푸리나</small></span><button className="outline" onClick={openMessages}>대화</button></div></section></section><div className="profile-bottom"><button onClick={()=>toast("차단·신고 관리 화면입니다")}><Shield/> 차단·신고 관리</button><a href={signOutPath} target="_top">로그아웃</a></div>
    <Dialog open={editing} onOpenChange={setEditing}><DialogContent className="profile-editor"><DialogHeader><DialogTitle>프로필 편집</DialogTitle></DialogHeader><form onSubmit={saveProfile}><label>표시 이름<input value={draft.name} onChange={event=>setDraft(value=>({...value,name:event.target.value}))}/></label><label>프로필 소개<textarea value={draft.intro} onChange={event=>setDraft(value=>({...value,intro:event.target.value}))}/></label><label>상태 메시지<input value={draft.status} onChange={event=>setDraft(value=>({...value,status:event.target.value}))}/></label><label>관심 태그<input value={draft.tags.join(", ")} onChange={event=>setDraft(value=>({...value,tags:event.target.value.split(",").map(tag=>tag.trim())}))} placeholder="쉼표로 구분"/></label><div><button className="outline" type="button" onClick={()=>setEditing(false)}>취소</button><button className="primary" type="submit">저장</button></div></form></DialogContent></Dialog>
  </div>;
}

export function FandomPublicProfile({name,openMessages}:{name:string;openMessages:()=>void}) {
  return <div className="single-page person-page"><header className="public-profile-head"><span className="avatar lg">{name[0]}</span><div><small>@blue_fandom</small><h1>{name}</h1><p>좋아하는 장면과 세계관을 오래 기록하고 있어요.</p><div className="interest-tags"><span>장송의 프리렌</span><span>듄</span><span>원신</span></div></div><div className="profile-actions"><button className="primary" onClick={()=>toast.success("덕친 요청을 보냈어요")}><Users/> 덕친 요청</button><button className="outline" onClick={openMessages}><MessageCircle/> 대화 시작</button><button className="icon-only" aria-label="사용자 차단"><Shield/></button></div></header><div className="relationship-summary"><div><b>3개</b><span>공통 작품</span></div><div><b>1명</b><span>공통 최애</span></div><div><b>2개</b><span>함께 가입한 커뮤니티</span></div></div><section className="public-records"><h2>{name}님의 공개 덕질 기록</h2>{[["듄","폴이 물을 마시는 장면, 원작과 달라진 의미"],["장송의 프리렌","28화 엔딩 이후 프리렌 표정 이야기"],["원신","폰타인 퀘스트 이후 다시 보이는 복선"]].map(([work,title])=><article key={title}><span className="kind">기록</span><div><small>{work} · 공개 덕질 기록</small><h3>{title}</h3></div></article>)}</section></div>;
}
