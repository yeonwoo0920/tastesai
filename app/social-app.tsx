"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Home, Compass, Users, CalendarDays, MessageCircle, Bell, UserRound, Search, Plus, Heart, Bookmark, MoreHorizontal, ImagePlus, Send, MapPin, Clock3, Check, X, Settings, LogOut, Shield, Flag, ChevronRight, Gamepad2, Music2, BookOpen, Palette, Dumbbell, Plane, Code2, Utensils, Clapperboard, Sparkles, Sun, Moon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { FandomRoomView } from "./fandom-room";
import { FandomProfile, FandomPublicProfile } from "./fandom-profile";
import { FandomComposer } from "./fandom-composer";
import { PostDetail } from "./post-detail";
import { WeatherAmbient } from "./weather-ambient";

type Viewer = { id: string; name: string; email: string } | null;
type View = "home" | "discover" | "mine" | "fanwork" | "activities" | "market" | "messages" | "notifications" | "profile" | "person" | "more";
type Post = { id: string; title: string; author: string; handle: string; avatar: string; community: string; kind: string; body: string; time: string; image?: string; likes: number; comments: number; tags: string[]; liked?: boolean; saved?: boolean; spoiler?:boolean; warning?:string; mine?: boolean };
type ProfileDetails = { name:string; intro:string; status:string; tags:string[] };
type Community = { id?:string; name:string; work:string; cat:string; members:string; memberCount:string; today:number; desc:string; color:string; accent:string; joined?:boolean };

function FreshStartDiscover(){return <section className="single-page fresh-discover"><header className="page-title"><h1>작품과 최애를 찾아보세요</h1><p>아직 등록된 커뮤니티가 없어요. 첫 커뮤니티를 만들어 좋아하는 이야기를 시작해 보세요.</p></header><div className="fresh-discover-empty"><Users/><h2>비어 있는 취향 공간이에요</h2><p>커뮤니티를 만든 뒤 멤버를 초대하고 첫 게시글을 남겨보세요.</p><button className="primary" onClick={()=>document.querySelector<HTMLButtonElement>(".community-create-entry button")?.click()}><Plus/> 첫 커뮤니티 만들기</button></div></section>}

function CommunityCreateDiscoverView({search,setSearch,communities,joined,join,requireLogin,createCommunity,openBoard}:{search:string;setSearch:(value:string)=>void;communities:readonly Community[];joined:string[];join:(name:string)=>void;requireLogin:(action:()=>void)=>void;createCommunity:(input:{name:string;work:string;category:string;description:string})=>Promise<void>;openBoard:(name:string)=>void}) {
  const [open,setOpen]=useState(false),[name,setName]=useState(""),[work,setWork]=useState(""),[category,setCategory]=useState("애니·만화"),[description,setDescription]=useState(""),[error,setError]=useState(""),[saving,setSaving]=useState(false);
  const submit=async(event:React.FormEvent)=>{event.preventDefault();setSaving(true);setError("");try{await createCommunity({name,work,category,description});setOpen(false);setName("");setWork("");setDescription("");}catch(reason){setError(reason instanceof Error?reason.message:"커뮤니티를 만들지 못했어요.");}finally{setSaving(false)}};
  return <><DiscoverView search={search} setSearch={setSearch} communities={communities} joined={joined} join={join} openBoard={openBoard}/><div className="community-create-entry"><button className="primary" onClick={()=>requireLogin(()=>setOpen(true))}><Plus/> 커뮤니티 만들기</button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="community-create-dialog"><DialogHeader><DialogTitle>새 커뮤니티 만들기</DialogTitle></DialogHeader><p>같은 작품이나 인물을 좋아하는 사람들이 공개적으로 이야기할 공간을 만들어요.</p><form onSubmit={submit}><label>커뮤니티 이름<Input value={name} onChange={event=>setName(event.target.value)} maxLength={40} placeholder="예: 프리렌 OST 이야기방" required/></label><label>작품 또는 인물<Input value={work} onChange={event=>setWork(event.target.value)} maxLength={40} placeholder="예: 장송의 프리렌" required/></label><label>분야<select value={category} onChange={event=>setCategory(event.target.value)}>{categories.map(([field])=><option key={field}>{field}</option>)}</select></label><label>소개<Textarea value={description} onChange={event=>setDescription(event.target.value)} maxLength={180} placeholder="어떤 이야기를 나누는 커뮤니티인지 적어주세요." required/></label>{error&&<p className="form-error">{error}</p>}<Button type="submit" disabled={saving}>{saving?"만드는 중…":"공개 커뮤니티 만들기"}</Button></form></DialogContent></Dialog></>;
}

const categories = [
  ["영화·드라마", "영화 · 드라마 · OTT", Clapperboard, "#edf2f8"], ["애니·만화", "애니 · 만화 · 웹툰", Sparkles, "#f3f0eb"], ["아이돌·음악", "아이돌 · 밴드 · 공연", Music2, "#f2eef4"], ["게임", "콘솔 · PC · 모바일", Gamepad2, "#edf1f7"], ["소설·독서", "소설 · 작가 · 등장인물", BookOpen, "#eef3ed"], ["배우·성우", "배우 · 성우 · 크리에이터", UserRound, "#f4f1ed"], ["2차창작", "팬아트 · 팬픽 · 코스프레", Palette, "#f0eff5"],
] as const;

const seedCommunities: Community[] = [];
const legacyCommunityNames = new Set(["프리렌 회차 감상방","듄 원작·영화 비교방","원신 세계관 정리방","데미안 문장 수집방"]);

const communities = seedCommunities;

const seedPosts: Post[] = [];

const nav: [View,string,typeof Home,number?][] = [["home","홈",Home],["mine","내 커뮤니티",Users],["discover","탐색",Compass],["activities","함께하는 활동",CalendarDays],["market","굿즈 거래소",Bookmark],["messages","대화",MessageCircle],["notifications","알림",Bell],["profile","마이페이지",UserRound],["more","더보기",MoreHorizontal]];

export default function SocialApp({ user, signInPath, signOutPath }: { user: Viewer; signInPath: string; signOutPath: string }) {
  const [view, setView] = useState<View>("home");
  const [posts, setPosts] = useState(seedPosts);
  const [communities, setCommunities] = useState<Community[]>(seedCommunities);
  const [joined, setJoined] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [feed, setFeed] = useState("최신 글");
  const [composerKind,setComposerKind]=useState("잡담");
  const [notificationRead,setNotificationRead]=useState(true);
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [postToOpen, setPostToOpen] = useState<string|null>(null);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [messageCommunity, setMessageCommunity] = useState<string|null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loginPromptOpen,setLoginPromptOpen] = useState(false);
  const [profile,setProfile] = useState<ProfileDetails>(() => ({name:user?.name||"",intro:"",status:"",tags:[]}));
  const hydrated = useRef(false);
  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});},[view]);
  const requireLogin = (action: () => void) => user ? action() : setLoginPromptOpen(true);

  useEffect(() => {
    const saved = localStorage.getItem("chwihyang-theme");
    const dark = saved === "dark";
    // Theme is restored from the browser after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDarkMode(dark);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, []);

  useEffect(() => {
    fetch("/api/communities").then(response => response.json() as Promise<{communities?:Community[]}>).then(({communities: created}) => {
      if (!created?.length) return;
      setCommunities(current => [...current, ...created.filter(item => !current.some(existing => existing.name === item.name))]);
    }).catch(() => { /* The built-in communities remain available when storage is unavailable. */ });
  }, []);

  useEffect(() => {
    fetch("/api/posts").then(response => response.json() as Promise<{posts?:Array<{id:string;title:string;author:string;community:string;kind:string;body:string;images?:string[];tags?:string[]}>}>).then(({posts: saved}) => {
      if (!saved) return;
      setPosts(saved.map(post => ({...post,handle:"",avatar:post.author,time:"방금",image:post.images?.[0],likes:0,comments:0,tags:post.tags??[]})));
    }).catch(() => { /* An empty feed remains usable while the public feed is unavailable. */ });
  }, []);
  const toggleTheme = () => setDarkMode(current => {
    const next = !current;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("chwihyang-theme", next ? "dark" : "light");
    return next;
  });

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: unknown) => unknown } }).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    try {
      void Promise.resolve(context.registerTool({ name:"search_fandom_rooms", title:"작품과 커뮤니티 찾기", description:"취향사이에서 작품, 인물, 캐릭터 또는 커뮤니티을 검색하고 결과를 표시합니다.", inputSchema:{type:"object",properties:{query:{type:"string"}},required:["query"],additionalProperties:false}, annotations:{readOnlyHint:true,untrustedContentHint:true}, execute:(input:unknown)=>{ const q=String((input as {query?:string}).query||"").trim(); if(!q) throw new Error("검색어가 필요합니다."); setSearch(q); setView("discover"); return {query:q,results:communities.filter(c=>(c.name+c.cat+c.desc).includes(q)).map(c=>c.name)}; } }, {signal:controller.signal}));
    } catch { /* unsupported preview */ }
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/state").then(r => r.json() as Promise<{state?:{joined?:string[];selectedBoard?:string;posts?:Record<string,Partial<Post>>;profile?:ProfileDetails}|null}>).then(({state}) => {
      if (state?.joined) setJoined((state.joined as string[]).filter(name=>!legacyCommunityNames.has(name)));
      if (state?.selectedBoard&&!legacyCommunityNames.has(state.selectedBoard)) setSelectedBoard(state.selectedBoard);
      const savedPosts = state?.posts;
      if (savedPosts) setPosts((current: Post[]) => current.map(p => savedPosts[p.id] ? {...p,...savedPosts[p.id]} : p));
      if (state?.profile?.name) setProfile(state.profile);
      hydrated.current = true;
    }).catch(() => { hydrated.current = true; toast.error("저장된 정보를 불러오지 못했어요") });
  }, [user]);

  useEffect(() => {
    if (!user || !hydrated.current) return;
    const id = setTimeout(() => {
      const reactions = Object.fromEntries(posts.map(p => [p.id, {liked:p.liked,saved:p.saved,likes:p.likes}]));
      fetch("/api/state", {method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({joined,selectedBoard,posts:reactions,profile})}).catch(()=>toast.error("변경 사항을 저장하지 못했어요"));
    }, 500);
    return () => clearTimeout(id);
  }, [joined, selectedBoard, posts, profile, user]);

  const profileUser = user ? {...user,name:profile.name||user.name} : null;

  const filteredCommunities = useMemo(() => communities.filter(c => (c.name+c.cat+c.desc).toLowerCase().includes(search.toLowerCase())), [search]);
  const togglePost = (id:string, key:"liked"|"saved") => requireLogin(() => setPosts(p => p.map(x => x.id===id ? {...x,[key]:!x[key], likes:key==="liked" ? x.likes+(x.liked?-1:1) : x.likes} : x)));
  const join = (name:string) => requireLogin(() => { const leaving=joined.includes(name); setJoined(v => leaving ? v.filter(x=>x!==name) : [...v,name]); if(leaving&&selectedBoard===name){const next=joined.find(x=>x!==name);if(next)setSelectedBoard(next);} toast(leaving?"커뮤니티에서 탈퇴했어요":"커뮤니티에 가입했어요"); });
  const createCommunity = async (input:{name:string;work:string;category:string;description:string}) => {
    const response = await fetch("/api/communities", {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(input)});
    const result = await response.json() as {community?:Community;error?:string};
    if (!response.ok || !result.community) throw new Error(result.error || "커뮤니티를 만들지 못했어요.");
    setCommunities(current => [result.community!, ...current]);
    setJoined(current => current.includes(result.community!.name) ? current : [...current, result.community!.name]);
    setSelectedBoard(result.community.name);
    setView("mine");
    toast.success("커뮤니티를 만들었어요");
  };

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={()=>setView("home")} aria-label="취향사이 홈"><span className="brand-mark">취</span><span>취향사이</span></button>
      <nav className="desktop-nav" aria-label="주요 메뉴">{nav.slice(0,5).map(([id,label])=><button key={id} aria-current={view===id?"page":undefined} className={view===id?"active":""} onClick={()=>setView(id)}>{label}</button>)}</nav>
      <label className="top-search"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setView("discover")} placeholder="작품, 인물, 캐릭터 검색" aria-label="작품과 인물 검색"/></label>
      <WeatherAmbient/>
      <div className="top-actions">
        <IconNav id="messages" label="대화" icon={MessageCircle} count={0} active={view==="messages"} onClick={next=>requireLogin(()=>{setMessageCommunity(null);setView(next)})}/>
        <IconNav id="notifications" label="알림" icon={Bell} count={0} active={view==="notifications"} onClick={next=>requireLogin(()=>setView(next))}/>
        {profileUser ? <button className="mini-profile" onClick={()=>setView("profile")}><Avatar text={profileUser.name}/><span>{profileUser.name}</span></button> : <a className="login" href={signInPath} target="_top">로그인</a>}
      </div>
    </header>

    <main className="page-wrap">
      {(view==="home"||view==="discover")&&<button className="community-create-quick primary" onClick={()=>{if(view==="discover"){document.querySelector<HTMLButtonElement>(".community-create-entry button")?.click();return;}setView("discover");window.setTimeout(()=>document.querySelector<HTMLButtonElement>(".community-create-entry button")?.click(),0);}}><Plus/> 커뮤니티 만들기</button>}
      {view==="home" && <CommunityHome user={profileUser} posts={posts} feed={feed} setFeed={setFeed} setView={setView} openBoard={name=>{setSelectedBoard(name);setView("mine")}} openCommunityPost={post=>{setSelectedBoard(post.community);setPostToOpen(post.id);setView("mine")}} openProfile={name=>{setSelectedPerson(name);setView("person")}} togglePost={togglePost} requireLogin={requireLogin} joined={joined} join={join}/>} 
      {view==="discover" && <><FreshStartDiscover/><CommunityCreateDiscoverView search={search} setSearch={setSearch} communities={communities} joined={joined} join={join} requireLogin={requireLogin} createCommunity={createCommunity} openBoard={name=>{setSelectedBoard(name);setView("mine")}}/></>}
      {view==="mine" && (communities.length ? <FandomRoomView key={selectedBoard}
        boardName={selectedBoard} communities={communities} joined={joined} onSelect={setSelectedBoard}
        join={join} requireLogin={requireLogin} posts={posts} openComposer={kind=>{setComposerKind(kind||"잡담");setComposerOpen(true)}}
        openMarket={()=>setView("market")} openMessages={communityName=>{setMessageCommunity(communityName);setView("messages")}}
        openProfile={name=>{setSelectedPerson(name);setView("person")}} initialPostId={postToOpen} onPostDetailClose={()=>setPostToOpen(null)} onTogglePost={togglePost}
      /> : <div className="single-page"><Empty title="아직 만든 커뮤니티가 없어요" text="탐색에서 첫 커뮤니티를 만들고 이야기를 시작해 보세요." action={<button className="primary" onClick={()=>setView("discover")}>커뮤니티 만들기</button>}/></div>)}
      {view==="activities" && <ActivitiesView requireLogin={requireLogin} openComposer={()=>{setComposerKind("잡담");setComposerOpen(true)}} openProfile={name=>{setSelectedPerson(name);setView("person")}}/>}
      {view==="market" && <MarketplaceView requireLogin={requireLogin} setView={setView} openProfile={name=>{setSelectedPerson(name);setView("person")}}/>}
      {view==="messages" && <MessagesView key={messageCommunity||"friends"} user={profileUser} joined={joined} requireLogin={requireLogin} initialCommunityName={messageCommunity}/>} 
      {view==="notifications" && <NotificationsView read={notificationRead} markRead={()=>setNotificationRead(true)}/>}
      {view==="profile" && <FandomProfile openSection={section=>setView(section)} joinedCount={joined.length} posts={posts} user={profileUser} profile={profile} onSaveProfile={setProfile} signInPath={signInPath} signOutPath={signOutPath} openMessages={()=>{setMessageCommunity(null);setView("messages")}}/>} 
      {view==="person" && <FandomPublicProfile name={selectedPerson} openMessages={()=>requireLogin(()=>setView("messages"))} requireLogin={requireLogin}/>}
      {view==="more" && <MoreView setView={setView}/>}
    </main>
    <nav className="mobile-nav" aria-label="모바일 메뉴">{nav.filter(([id])=>["home","discover","messages","profile","more"].includes(id)).map(([id,label,Icon,count])=><button key={id} aria-current={view===id?"page":undefined} className={view===id?"active":""} onClick={()=>["messages","profile"].includes(id)?requireLogin(()=>{if(id==="messages")setMessageCommunity(null);setView(id)}):setView(id)}><span><Icon/>{count&&<i>{count}</i>}</span><small>{label.replace("커뮤니티","탐색").replace("마이페이지","MY")}</small></button>)}</nav>
    <FandomComposer key={`${selectedBoard}-${composerKind}`} initialKind={composerKind} boardName={selectedBoard} open={composerOpen} setOpen={setComposerOpen} user={profileUser} onAdd={post=>{setPosts(p=>[post,...p]);setComposerOpen(false);toast.success(`${post.community} 커뮤니티에 글을 올렸어요`);}}/>
    <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}><DialogContent className="login-required-dialog"><DialogHeader><DialogTitle>로그인이 필요한 기능이에요</DialogTitle></DialogHeader><p>취향사이에 로그인하고 함께 이야기해보세요.</p><div><button className="outline" type="button" onClick={()=>setLoginPromptOpen(false)}>취소</button><a className="primary" href={signInPath} target="_top">로그인</a><a className="outline" href={signInPath} target="_top">회원가입</a></div></DialogContent></Dialog>
  </div>;
}

function IconNav({id,label,icon:Icon,count,active,onClick}:{id:View,label:string,icon:typeof Bell,count:number,active:boolean,onClick:(v:View)=>void}) { return <button className={`icon-nav ${active?"active":""}`} aria-label={`${label}, 읽지 않음 ${count}개`} onClick={()=>onClick(id)}><Icon/>{count>0&&<b>{count}</b>}</button>; }
function Avatar({text,size="md"}:{text:string,size?:"sm"|"md"|"lg"}) { return <span className={`avatar ${size}`}>{text.slice(0,1)}</span>; }

function CommunityHome({user,posts,feed,setFeed,setView,openBoard,openCommunityPost,openProfile,togglePost,requireLogin,joined,join}:{user:Viewer;posts:Post[];feed:string;setFeed:(x:string)=>void;setView:(v:View)=>void;openBoard:(name:string)=>void;openCommunityPost:(post:Post)=>void;openProfile:(name:string)=>void;togglePost:(id:string,k:"liked"|"saved")=>void;requireLogin:(f:()=>void)=>void;joined:string[];join:(name:string)=>void}) {
  const [selectedPostId,setSelectedPostId]=useState<string|null>(null);
  const selected=posts.find(post=>post.id===selectedPostId)??null;
  const homePosts=joined.length?posts.filter(post=>joined.includes(post.community)):posts;
  const shownPosts=feed==="인기 글"?[...homePosts].sort((a,b)=>b.likes-a.likes):homePosts;
  const hotPosts=posts.filter(post=>{
    const memberCount=Number(communities.find(community=>community.name===post.community)?.memberCount.replace(/[^0-9]/g,"")||0);
    return memberCount>0&&post.likes>=Math.ceil(memberCount*.15);
  }).sort((a,b)=>b.likes-a.likes).slice(0,5);
  return <div className="community-home">
    <header className="home-heading"><div><h1>{user?`${user.name}님의 덕질 소식`:"오늘의 덕질 소식"}</h1><p>좋아하는 작품의 동네를 오가며, 오늘의 감상과 소식을 나눠요.</p></div></header>
    <section className="my-community-zone"><div className="zone-title"><div><h2>내 커뮤니티</h2></div><button onClick={()=>setView("mine")}>전체 보기</button></div>{joined.length?<div className="my-community-rows">{joined.map((name)=><button key={name} onClick={()=>openBoard(name)}><span className="community-mark">{name[0]}</span><span><b>{name}</b><small>{communities.find(c=>c.name===name)?.work}</small></span><em>새 글 {communities.find(c=>c.name===name)?.today||0}</em><ChevronRight/></button>)}</div>:<Empty title="아직 가입한 커뮤니티가 없어요" text="좋아하는 작품이나 인물을 찾고 커뮤니티에 들어가 보세요." action={<button className="primary" onClick={()=>setView("discover")}>작품 탐색</button>}/>}</section>
    <div className="home-main-grid"><section className="record-zone"><div className="zone-title"><div><h2>오늘의 덕질 기록</h2><span>가입한 커뮤니티의 새 기록</span></div><div className="plain-tabs">{[["최신 글","가장 최근에 올라온 글"],["인기 글","좋아요가 많은 글"]].map(([label,description])=><button aria-label={description} title={description} aria-pressed={feed===label} className={feed===label?"active":""} onClick={()=>setFeed(label)} key={label}>{label}</button>)}</div></div><div className="record-table">{shownPosts.map(post=><article key={post.id}><span className="record-kind">{post.kind}</span><button className="record-copy" onClick={()=>setSelectedPostId(post.id)}><small>{post.community}</small><b>{post.title}</b></button><span className="has-image">{post.image&&<ImagePlus aria-label="이미지 있음"/>}</span><span className="record-meta"><button onClick={()=>openProfile(post.author)}>{post.author}</button><time>{post.time}{post.time!=="방금"&&" 전"}</time><em>댓글 {post.comments}</em></span></article>)}</div>{!shownPosts.length&&<Empty title="아직 이곳에 기록이 없어요" text="커뮤니티에 가입하거나 다른 분류의 기록을 살펴보세요."/>}</section>
      <aside className="hot-rail"><div className="zone-title"><div><h2>지금 불타는 이야기</h2><span>커뮤니티 인원의 15% 이상이 좋아요를 누른 글</span></div></div><div className="hot-compact">{hotPosts.length?hotPosts.map((post,i)=><button key={post.id} onClick={()=>openCommunityPost(post)}><b>{i+1}</b><span><strong>{post.title}</strong><small>{post.community}</small></span><em>♥ {post.likes} · 댓글 {post.comments}</em></button>):<p className="hot-empty">아직 기준을 넘은 글이 없어요.</p>}</div></aside>
    </div>
    <PostDetail post={selected} onClose={()=>setSelectedPostId(null)} onToggleLike={id=>togglePost(id,"liked")} onToggleSave={id=>togglePost(id,"saved")} onOpenProfile={openProfile} requireLogin={requireLogin}/>
    <nav className="home-quiet-links" aria-label="다른 기능"><button onClick={()=>setView("discover")}>작품·인물 탐색</button><button onClick={()=>setView("activities")}>함께하는 활동</button><button onClick={()=>setView("market")}>굿즈 거래소</button></nav>
  </div>;
}

function MoreView({setView}:{setView:(v:View)=>void}) { return <div className="single-page more-page"><header className="page-title"><h1>더보기</h1></header><div className="more-list">{[["mine","내 커뮤니티","가입한 작품·최애 커뮤니티 관리"],["activities","함께하는 활동","같이 보기·공연 동행·게임 파티"],["market","굿즈 거래소","작품·캐릭터·멤버별 거래"],["notifications","알림","댓글·친구·활동 소식"]].map(([id,title,desc])=><button key={id} onClick={()=>setView(id as View)}><span><b>{title}</b><small>{desc}</small></span><ChevronRight/></button>)}</div></div> }

function HomeView({user,posts,feed,setFeed,setView,openBoard,togglePost,requireLogin,joined}:{user:Viewer;posts:Post[];feed:string;setFeed:(x:string)=>void;setView:(v:View)=>void;openBoard:(name:string)=>void;togglePost:(id:string,k:"liked"|"saved")=>void;requireLogin:(f:()=>void)=>void;joined:string[]}) {
  const [selected,setSelected]=useState<Post|null>(null);
  const rows=[
    ...posts,
    {id:"b4",title:"이번 주말 무료 체험 인디게임 6개",author:"고래구름",handle:"@whale_cloud",avatar:"고",community:"인디게임 발견대",kind:"정보",body:"직접 플레이해 보고 재미있었던 작품 위주로 정리했습니다.",time:"2시간",likes:76,comments:18,tags:["#인디게임"]},
    {id:"b5",title:"야간 사진 손떨림 줄이는 방법 있나요?",author:"밤산책",handle:"@nightwalk",avatar:"밤",community:"퇴근 후 한 장",kind:"질문",body:"삼각대 없이 야간 촬영을 할 때 다들 어떤 자세나 설정을 쓰는지 궁금해요.",time:"3시간",likes:42,comments:27,tags:["#사진"]},
    {id:"b6",title:"완독 후 바로 다음 책으로 넘어가시나요?",author:"책갈피",handle:"@page_mark",avatar:"책",community:"매일 20분 독서",kind:"잡담",body:"저는 여운 때문에 하루 정도 쉬게 되는데 여러분의 독서 리듬도 궁금합니다.",time:"어제",likes:31,comments:14,tags:["#독서"]},
  ];
  return <div className="board-shell">
    <aside className="board-sidebar">
      <h2>내 커뮤니티</h2>
      <button className="board-all active" onClick={()=>setView("home")}><Home/> 전체 게시판 <b>25</b></button>
      {joined.map((name,i)=><button key={name} onClick={()=>openBoard(name)}><span className={`community-dot c${i}`}>{name[0]}</span><span>{name}</span><b>{i===0?18:7}</b></button>)}
      <hr/><button onClick={()=>setView("discover")}><Compass/> 커뮤니티 찾기</button><button onClick={()=>setView("market")}><Bookmark/> 굿즈 거래소</button>
    </aside>
    <section className="board-main">
      <header className="board-header"><div><span className="demo-chip">예시 데이터</span><h1>전체 게시판</h1><p>게시판을 먼저 선택한 뒤 글을 작성할 수 있어요.</p></div></header>
      <div className="board-sections">
        <section className="hot-section"><header><span>HOT</span><h2>실시간 인기글</h2><button>더보기</button></header>{rows.slice(0,4).map((p,i)=><button key={p.id} onClick={()=>setSelected(p)}><b>{i+1}</b><span>{p.title}</span><small>{p.comments}</small></button>)}</section>
        <section><header><span>01</span><h2>콘텐츠 덕질</h2></header>{["아이돌·음악","애니·만화","영화·드라마","공연·배우"].map((x,i)=><button key={x} onClick={()=>openBoard(x)}><span>{x}</span><small>{["새 글 42","새 글 38","새 글 21","새 글 14"][i]}</small></button>)}</section>
        <section><header><span>02</span><h2>창작·라이프</h2></header>{["독서·글쓰기","그림·사진","만들기·공예","여행·야외"].map((x,i)=><button key={x} onClick={()=>openBoard(x)}><span>{x}</span><small>{["새 글 17","새 글 29","새 글 11","새 글 8"][i]}</small></button>)}</section>
        <section><header><span>03</span><h2>게임·스포츠</h2></header>{["PC·콘솔 게임","모바일·보드게임","운동·스포츠","기술·탐구"].map((x,i)=><button key={x} onClick={()=>openBoard(x)}><span>{x}</span><small>{["새 글 33","새 글 19","새 글 25","새 글 12"][i]}</small></button>)}</section>
        <section className="fanwork-section"><header><span>2차</span><h2>2차창작</h2><small>팬의 상상과 창작을 존중하는 별도 코너</small></header>{["팬아트","팬픽·글","코스프레","커버·리믹스"].map((x,i)=><button key={x} onClick={()=>openBoard(`2차창작 · ${x}`)}><span>{x}</span><small>{["새 글 31","새 글 18","새 글 9","새 글 12"][i]}</small></button>)}</section>
        <section><header><span>04</span><h2>기타</h2></header>{["기타 자유게시판","소소한 취미","취미 추천","새 게시판 제안"].map((x,i)=><button key={x} onClick={()=>openBoard(x)}><span>{x}</span><small>{["새 글 23","새 글 16","새 글 10","새 글 4"][i]}</small></button>)}</section>
      </div>
      <div className="board-list-title"><h2>전체 새글</h2><span>관심 취미와 가입 게시판의 최신 글</span></div>
      <div className="board-notice"><b>공지</b><button onClick={()=>toast("커뮤니티 이용 규칙을 확인했어요")}>서로의 취향을 존중하는 취향사이 이용 규칙</button><span>운영팀</span></div>
      <div className="board-toolbar"><div className="segmented">{["최신","인기","이미지"].map(x=><button className={feed===x||feed==="추천"&&x==="최신"?"active":""} key={x} onClick={()=>setFeed(x)}>{x}</button>)}</div><label><Search/><input placeholder="게시글 검색"/></label></div>
      <div className="board-list" role="table" aria-label="취향 게시글 목록">
        <div className="board-cols" role="row"><span>말머리</span><span>제목</span><span>작성자</span><span>댓글</span><span>좋아요</span></div>
        {rows.map((p,i)=><button className="board-row" role="row" key={p.id} onClick={()=>setSelected(p)}><span className={`board-kind k${i%4}`}>{p.kind}</span><span className="board-title"><b>{p.title}</b><small>{p.community} · {p.time} 전 {p.image&&"· 사진"}</small></span><span className="board-author"><Avatar text={p.avatar} size="sm"/>{p.author}</span><span>{p.comments}</span><span>{p.likes}</span></button>)}
      </div>
      <div className="board-footer"><button disabled>이전</button><b>1</b><button>2</button><button>3</button><button>다음</button></div>
    </section>
    <aside className="board-right"><section><h3>지금 인기 있는 취미</h3>{["#이번분기애니","#오늘의독서","#블루아워","#인디게임"].map((x,i)=><button key={x}><b>{i+1}</b><span>{x}</span></button>)}</section><section><h3>오늘의 활동</h3><b>좋아하는 장면 30분 드로잉</b><p>금요일 오후 9:00 · 온라인</p><button className="outline" onClick={()=>setView("activities")}>자세히 보기</button></section><p className="demo-note">프로필과 게시글은 개발용 예시 데이터입니다.</p></aside>
    <Dialog open={!!selected} onOpenChange={v=>!v&&setSelected(null)}><DialogContent className="board-detail">{selected&&<><DialogHeader><DialogTitle>{selected.title}</DialogTitle></DialogHeader><div className="detail-meta"><Avatar text={selected.avatar}/><span><b>{selected.author}</b><small>{selected.community} · {selected.time} 전</small></span></div><p>{selected.body}</p>{selected.image&&<img src={selected.image} alt="게시글 첨부 이미지"/>}<div className="detail-actions"><button onClick={()=>togglePost(selected.id,"liked")}><Heart/> 좋아요 {selected.likes}</button><button><MessageCircle/> 댓글 {selected.comments}</button><button onClick={()=>togglePost(selected.id,"saved")}><Bookmark/> 저장</button></div><div className="comment-box"><Input placeholder="댓글을 입력하세요"/><Button onClick={()=>requireLogin(()=>toast.success("댓글을 남겼어요"))}>등록</Button></div></>}</DialogContent></Dialog>
  </div>;
}

function PostCard({post,togglePost,requireLogin}:{post:Post;togglePost:(id:string,k:"liked"|"saved")=>void;requireLogin:(f:()=>void)=>void}) {
  const [showComment,setShowComment]=useState(false); const [comment,setComment]=useState("");
  return <article className="post-card"><header><Avatar text={post.avatar}/><div><button className="author">{post.author}</button><span>{post.handle} {post.handle&&"·"} {post.time}</span></div><button className="community-pill">{post.community}</button><button aria-label="게시글 메뉴" className="ghost"><MoreHorizontal/></button></header><div className="post-body"><span className="kind">{post.kind}</span><h3>{post.title}</h3><p>{post.body}</p><div className="tags">{post.tags.map(t=><button key={t}>{t}</button>)}</div></div>{post.image&&<img className="post-image" src={post.image} alt="취미 기록 이미지"/>}<footer><button className={post.liked?"liked":""} onClick={()=>togglePost(post.id,"liked")}><Heart fill={post.liked?"currentColor":"none"}/><span>{post.likes}</span></button><button onClick={()=>setShowComment(!showComment)}><MessageCircle/><span>{post.comments}</span></button><button onClick={()=>togglePost(post.id,"saved")} className={post.saved?"saved":""}><Bookmark fill={post.saved?"currentColor":"none"}/><span>저장</span></button><button onClick={()=>toast("신고 사유를 선택하는 관리 화면으로 연결돼요")}><Flag/><span>신고</span></button></footer>{showComment&&<div className="comment-box"><Input value={comment} onChange={e=>setComment(e.target.value)} placeholder="따뜻한 댓글을 남겨보세요"/><Button onClick={()=>requireLogin(()=>{if(!comment.trim())return;toast.success("댓글을 남겼어요");setComment("");})}>등록</Button></div>}</article>;
}

function DiscoverView({search,setSearch,communities:items,joined,join,openBoard}:{search:string;setSearch:(x:string)=>void;communities:readonly (typeof communities)[number][];joined:string[];join:(n:string)=>void;openBoard:(name:string)=>void}) { const works=[{field:"애니·만화",name:"장송의 프리렌",type:"애니메이션",desc:"여정 이후의 시간과 기억을 따라가는 판타지",followers:"24.8K",room:"프리렌 회차 감상방"},{field:"영화·드라마",name:"듄",type:"영화·소설",desc:"아라키스의 정치와 예언, 인물을 함께 파고들어요",followers:"18.2K",room:"듄 원작·영화 비교방"},{field:"게임",name:"원신",type:"게임",desc:"티바트의 인물과 지역, 세계관을 기록해요",followers:"31.6K",room:"원신 세계관 정리방"},{field:"소설·독서",name:"데미안",type:"소설",desc:"문장과 인물, 성장의 의미를 다시 읽어요",followers:"9.4K",room:"데미안 문장 수집방"},{field:"아이돌·음악",name:"LUMEN",type:"아이돌 그룹",desc:"컴백 무대와 멤버별 활동을 같이 달려요",followers:"14.7K",room:"LUMEN 컴백 같이 달리는 방"},{field:"배우·성우",name:"하야미 사오리",type:"성우",desc:"출연작과 연기, 라디오 활동을 함께 기록해요",followers:"7.1K",room:"출연작 같이 듣는 방"}]; const q=search.trim().toLowerCase(); const shownWorks=works.filter(w=>!q||q==="2차창작"||(w.field+w.name+w.type+w.desc).toLowerCase().includes(q)); const shownRooms=items.filter(c=>!q||q==="2차창작"||(c.name+c.cat+c.desc).toLowerCase().includes(q)||shownWorks.some(w=>w.room===c.name)); return <div className="single-page discover-page"><header className="page-title"><h1>작품과 최애를 찾아보세요</h1><p>분야를 고르고 작품·인물을 찾은 뒤, 분위기가 맞는 커뮤니티에 들어가세요.</p></header><div className="discover-search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} aria-label="작품과 커뮤니티 검색" placeholder="작품, 아이돌, 배우, 성우, 캐릭터, 게임, 작가 검색"/></div><div className="discovery-step"><span>1</span><div><h2>분야 선택</h2><p>덕질하고 싶은 콘텐츠 분야부터 골라보세요.</p></div></div>{search&&<button className="outline" onClick={()=>setSearch("")}>전체 분야 보기</button>}<div className="category-grid fandom-fields">{categories.map(([name,desc,Icon,bg])=><button key={name} aria-pressed={search===name} className={search===name?"active":""} onClick={()=>setSearch(search===name?"":name)}><span style={{background:bg}}><Icon/></span><b>{name}</b><small>{desc}</small></button>)}</div><div className="discovery-step featured-step"><span>2</span><div><h2>{search?`‘${search}’ 관련 작품·인물`:"지금 많이 이야기하는 작품·인물"}</h2><p>작품의 커뮤니티를 둘러보고 가입하면 홈에 새 기록이 모여요.</p></div></div>{shownWorks.length?<div className="work-list featured-work-list">{shownWorks.map(w=><article key={w.name}><span className="work-monogram">{w.name[0]}</span><div><small>{w.field} · {w.type}</small><h3>{w.name}</h3><p>{w.desc}</p></div>{items.some(c=>c.name===w.room)?<button className="outline" onClick={()=>openBoard(w.room)}>커뮤니티 보기</button>:<small>커뮤니티 준비 중</small>}</article>)}</div>:<Empty title="찾는 작품이나 인물이 없어요" text="작품명, 캐릭터 또는 인물 이름으로 다시 검색해 보세요."/>}<div className="discovery-step"><span>3</span><div><h2>관련 커뮤니티</h2><p>같은 작품을 좋아해도 목적과 분위기가 다른 방이 있어요.</p></div></div>{shownRooms.length?<div className="room-list">{shownRooms.map(c=><article key={c.name}><div><small>{c.cat}</small><h3>{c.name}</h3><p>{c.desc}</p><span>멤버 {c.members}명 · 오늘 새 글 {c.today}개</span></div><button className={joined.includes(c.name)?"joined":"outline"} onClick={()=>joined.includes(c.name)?openBoard(c.name):join(c.name)}>{joined.includes(c.name)?"들어가기":"가입하기"}</button></article>)}</div>:<Empty title="관련 커뮤니티가 아직 없어요" text="다른 작품을 찾아보거나 관심 분야를 바꿔 보세요."/>}</div>; }

function CommunityView({boardName,joined,join,requireLogin,posts,openComposer}:{boardName:string;joined:string[];join:(n:string)=>void;requireLogin:(f:()=>void)=>void;posts:Post[];openComposer:()=>void}) { const fanwork=boardName.startsWith("2차창작"); const joinedHere=joined.includes(boardName); const write=()=>{if(!joinedHere){toast("먼저 이 커뮤니티에 가입해 주세요");return;}requireLogin(openComposer)}; return <div className="single-page"><section className={`community-hero ${fanwork?"fanwork-hero":""}`}><div className="hero-art"><Sparkles/></div><div><span>{fanwork?"2차창작 코너":"취향 커뮤니티"}</span><h1>{boardName}</h1><p>{fanwork?"원작과 창작자를 존중하며 팬아트, 팬픽, 코스프레와 커버 작품을 나누는 별도 공간이에요.":"같은 취향의 사람들과 기록과 정보, 짧은 생각을 자유롭게 나누는 작은 커뮤니티예요."}</p><div className="hero-stats"><b>{fanwork?"3,218":"12,428"}</b> 멤버 <b>{fanwork?"74":"386"}</b> 오늘의 글</div></div><div className="board-actions"><button className="joined" onClick={()=>join(boardName)}>{joinedHere?<><Check/> 가입됨</>:<><Plus/> 가입하기</>}</button></div></section><Tabs defaultValue="home" className="community-tabs"><TabsList><TabsTrigger value="home">홈</TabsTrigger><TabsTrigger value="posts">게시글</TabsTrigger><TabsTrigger value="gallery">작품·사진</TabsTrigger><TabsTrigger value="members">멤버</TabsTrigger><TabsTrigger value="activity">활동</TabsTrigger><TabsTrigger value="chat">단체 대화</TabsTrigger></TabsList><TabsContent value="home"><div className="community-content"><div><div className="notice"><b>📌 공지</b><span>{fanwork?"작품명과 원작 표기, 민감한 내용의 주의 문구를 지켜주세요.":"커뮤니티 주제와 말머리를 확인하고 서로의 취향을 존중해 주세요."}</span></div>{posts.slice(0,2).map(p=><PostCard key={p.id} post={p} togglePost={()=>{}} requireLogin={requireLogin}/>)}</div><aside className="rail-card"><h3>커뮤니티 정보</h3><p className="community-mood">차분하게 기록하고 다정하게 대화해요.</p><ol><li>취향과 창작을 존중해요.</li><li>스포일러와 민감한 내용은 표기해요.</li><li>반복 홍보와 도배는 금지예요.</li></ol><small>운영자 · 파란귤</small><button className="outline" onClick={()=>toast("운영자 전용 관리 화면입니다")}>운영 정보 보기</button></aside></div></TabsContent><TabsContent value="posts"><div className="inside-board-head"><h2>{boardName} 게시글</h2><button className="primary" onClick={write}><Plus/> 글쓰기</button></div><div className="inside-board-list"><div className="inside-cols"><span>말머리</span><span>제목</span><span>작성자</span><span>시간</span><span>조회</span><span>댓글</span><span>좋아요</span></div><div className="inside-notice"><b>공지</b><span>{boardName} 이용 규칙과 말머리 안내</span><span>운영자</span></div>{posts.concat(posts.slice(0,2)).map((p,i)=><button key={`${p.id}-${i}`}><span className="kind">{p.kind}</span><b>{p.title}</b><span>{i===3?"익명":p.author}</span><time>{p.time}</time><span>{328-i*31}</span><span>{p.comments}</span><span>{p.likes}</span></button>)}</div></TabsContent><TabsContent value="gallery"><div className="gallery"><img src="/hobby-desk.png" alt="회원 작품 예시"/><img src="/hobby-desk.png" alt="회원 취미 기록 예시"/><img src="/hobby-desk.png" alt="회원 사진 예시"/></div></TabsContent><TabsContent value="members"><MemberList/></TabsContent><TabsContent value="activity"><ActivitiesView requireLogin={requireLogin} openComposer={openComposer}/></TabsContent><TabsContent value="chat"><MessagesView user={null} requireLogin={requireLogin}/></TabsContent></Tabs></div>; }

function ActivitiesView({requireLogin,openComposer}:{requireLogin:(f:()=>void)=>void;openComposer:()=>void}) { const [filter,setFilter]=useState("전체"); const acts: {id:string;type:string;title:string;time:string;count:string;author:string;desc:string}[]=[]; return <div className="single-page activities-page"><header className="page-title"><h1>함께하는 덕질</h1><p>모임을 만들고, 같은 취향을 가진 사람들과 함께해요.</p><button className="primary" onClick={()=>requireLogin(openComposer)}><Plus/> 모임 제안 글쓰기</button></header><div className="safety-note"><Shield/><span><b>오프라인 안전 안내</b> 첫 만남은 공개된 장소를 이용하고, 상세 장소는 참가 승인 후 확인하세요.</span></div><div className="filter-row">{["전체","온라인","오프라인","참여 중"].map(name=><button key={name} aria-pressed={filter===name} className={filter===name?"active":""} onClick={()=>setFilter(name)}>{name}</button>)}</div><Empty title="아직 등록된 모임이 없어요" text="첫 모임을 제안해 함께할 사람을 찾아보세요."/></div>; }

function MarketplaceView({requireLogin,setView,openProfile}:{requireLogin:(f:()=>void)=>void;setView:(v:View)=>void;openProfile:(name:string)=>void}) {
  const [hobby,setHobby]=useState("전체 분야"); const [query,setQuery]=useState(""); const [wish,setWish]=useState<string[]>([]); const [writeOpen,setWriteOpen]=useState(false);
  const goods=[
    {id:"g1",type:"판매",cat:"아이돌·음악",work:"LUMEN · 유진",title:"투어 한정 포토카드 3종 세트",price:"18,000원",seller:"파란귤",time:"10분 전",status:"판매 중",image:"/hobby-desk.png"},
    {id:"g2",type:"판매",cat:"애니·만화",work:"장송의 프리렌 · 페른",title:"캐릭터 아크릴 스탠드 미개봉",price:"24,000원",seller:"모카별",time:"34분 전",status:"판매 중",image:"/hobby-desk.png"},
    {id:"g3",type:"구해요",cat:"영화·드라마",work:"듄 · 폴 아트레이데스",title:"공식 아트북 초판 구해요",price:"가격 제안",seller:"고래구름",time:"1시간 전",status:"구하는 중",image:"/hobby-desk.png"},
    {id:"g4",type:"판매",cat:"게임",work:"원신 · 푸리나",title:"게임 OST 바이닐 한정판",price:"42,000원",seller:"밤산책",time:"2시간 전",status:"예약 중",image:"/hobby-desk.png"},
    {id:"g5",type:"나눔",cat:"소설·독서",work:"데미안",title:"북커버와 책갈피 세트 나눔",price:"무료 나눔",seller:"책갈피",time:"3시간 전",status:"나눔 중",image:"/hobby-desk.png"},
    {id:"g6",type:"교환",cat:"아이돌·음악",work:"LUMEN · 하준",title:"앨범 특전 포카 교환 원해요",price:"교환",seller:"윤슬",time:"어제",status:"교환 중",image:"/hobby-desk.png"},
  ];
  const hobbySections=["전체 분야","영화·드라마","애니·만화","아이돌·음악","게임","소설·독서","배우·성우","기타"];
  const shown: typeof goods=[];
  const groups=(hobby==="전체 분야"?hobbySections.slice(1):[hobby]).map(cat=>({cat,items:shown.filter(g=>g.cat===cat)})).filter(group=>group.items.length);
  return <div className="single-page market-page"><header className="market-head"><div><h1>굿즈 거래소</h1><p>작품과 최애를 기준으로 굿즈를 판매하고, 구하고, 교환해요.</p></div><button className="primary" onClick={()=>requireLogin(()=>setWriteOpen(true))}><Plus/> 거래글 올리기</button></header>
    <div className="safe-banner"><Shield/><div><b>거래 전 꼭 확인하세요</b><span>취향사이는 결제를 중개하지 않아요. 개인정보를 먼저 보내지 말고, 의심스러운 외부 링크와 선입금 요구를 주의하세요.</span></div><button onClick={()=>toast("안전 거래 수칙을 확인했어요")}>안전수칙</button></div>
    <section className="market-hobbies" aria-label="분야별 굿즈"><h2>분야 선택</h2><div>{hobbySections.map(x=><button aria-pressed={hobby===x} className={hobby===x?"active":""} key={x} onClick={()=>setHobby(x)}>{x}</button>)}</div></section>
    <div className="market-tools"><label><Search/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label="굿즈 검색" placeholder="작품, 캐릭터, 멤버, 굿즈 검색"/></label></div>
    <div className="market-sections">{groups.map(group=><section key={group.cat}><header><h2>{group.cat}</h2><span>{group.items.length}개의 거래글</span></header><div className="market-grid">{group.items.map((g,i)=><article key={g.id}><div className={`goods-image tint${i}`}><img src={g.image} alt="굿즈 예시 이미지"/><span>{g.type}</span><button aria-label="찜하기" className={wish.includes(g.id)?"wished":""} onClick={()=>requireLogin(()=>setWish(v=>v.includes(g.id)?v.filter(x=>x!==g.id):[...v,g.id]))}><Heart fill={wish.includes(g.id)?"currentColor":"none"}/></button></div><div className="goods-copy"><small>{g.work} · {g.time}</small><h2>{g.title}</h2><strong>{g.price}</strong><div><button className="seller-profile-link" onClick={()=>openProfile(g.seller)}><Avatar text={g.seller} size="sm"/>{g.seller} · 활동 기록 18개</button><i>{g.status}</i></div><button className="outline" onClick={()=>requireLogin(()=>{toast.success(`${g.seller}님과 대화를 시작했어요`);setView("messages")})}><MessageCircle/> 판매자와 대화</button></div></article>)}</div></section>)}</div>{!shown.length&&<Empty title="찾는 굿즈가 없어요" text="다른 작품이나 검색어를 선택해 보세요."/>}
    <Dialog open={writeOpen} onOpenChange={setWriteOpen}><DialogContent className="trade-form"><DialogHeader><DialogTitle>거래글 올리기</DialogTitle></DialogHeader><div className="trade-type">{["판매","구해요","교환","나눔"].map(x=><button key={x}>{x}</button>)}</div><Input placeholder="굿즈 이름"/><Input placeholder="가격 또는 교환 조건"/><Textarea placeholder="상품 상태와 거래 방법을 자세히 적어주세요"/><p>상세 주소와 계좌번호는 게시글에 작성하지 마세요.</p><Button onClick={()=>{setWriteOpen(false);toast.success("거래글을 등록했어요")}}>등록하기</Button></DialogContent></Dialog>
  </div>;
}

function MessagesView({user,requireLogin,initialCommunityName=null,joined=[]}:{user:Viewer;requireLogin:(f:()=>void)=>void;initialCommunityName?:string|null;joined?:string[]}) {
  const friendChats: {name:string;last:string;time:string;unread:number;sub:string}[]=[];

  const communityChats=communities.filter(c=>joined.includes(c.name)).map(c=>({name:c.name,last:`${c.work} 이야기를 나눠요`,time:"",unread:0,sub:"커뮤니티 단체 대화"}));

  const [chatType,setChatType]=useState<"friends"|"community">(initialCommunityName?"community":"friends");
  const [selected,setSelected]=useState(()=>Math.max(0,communityChats.findIndex(chat=>chat.name===initialCommunityName)));
  const [text,setText]=useState("");
  const [query,setQuery]=useState("");
  const [showList,setShowList]=useState(!initialCommunityName);
  const [messages,setMessages]=useState<Record<string,{body:string;mine:boolean}[]>>({});
  const chats=chatType==="friends"?friendChats:communityChats;
  const current=chats[selected];
  const chatKey=`${chatType}:${current?.name}`;
  const currentMessages=messages[chatKey]|| (current?[{body:current.last,mine:false}]:[]);

  const changeType=(type:"friends"|"community")=>{
    setChatType(type);
    setSelected(0);
    setQuery("");setText("");setShowList(true);
  };

  const send=()=>requireLogin(()=>{
    if(!text.trim()||!current)return;
    setMessages(v=>({...v,[chatKey]:[...currentMessages,{body:text.trim(),mine:true}]}));
    setText("");
  });

  return <div className={`message-layout ${showList?"show-chat-list":"show-chat-panel"}`}>
    <aside>
      <header>
        <h1>대화</h1>

      </header>

      <div className="message-type-tabs">
        <button
          aria-pressed={chatType==="friends"} className={chatType==="friends"?"active":""}
          onClick={()=>changeType("friends")}
        >
          친구 대화
        </button>
        <button
          aria-pressed={chatType==="community"} className={chatType==="community"?"active":""}
          onClick={()=>changeType("community")}
        >
          커뮤니티 톡방
        </button>
      </div>

      <label>
        <Search/>
        <input aria-label="대화 검색" value={query} onChange={e=>setQuery(e.target.value)} placeholder={chatType==="friends"?"친구와 대화 검색":"커뮤니티 톡방 검색"}/>
      </label>

      {chats.map((c,i)=> c.name.includes(query)&&
        <button
          className={selected===i?"active":""}
          key={c.name}
          onClick={()=>{setSelected(i);setText("");setShowList(false)}}
        >
          <Avatar text={c.name}/>
          <span>
            <b>{c.name}</b>
            <small>{c.last}</small>
          </span>
          <time>{c.time}</time>
          {c.unread>0&&<i>{c.unread}</i>}
        </button>
      )}
      {!chats.some(c=>c.name.includes(query))&&<p className="chat-empty">{chatType==="community"&&!chats.length?"가입한 커뮤니티가 없어요. 탐색에서 마음에 드는 방을 찾아보세요.":"검색한 대화가 없어요."}</p>}
    </aside>

    {current?<section className="chat-panel">
      <header>
        <button className="chat-list-back outline" onClick={()=>setShowList(true)}>← 목록</button><Avatar text={current.name}/>
        <div>
          <b>{current.name}</b>
          <span>{current.sub}</span>
        </div>

      </header>

      <div className="messages">
        <div className="day">오늘</div>
        {currentMessages.map((m,i)=>
          <div key={i} className={m.mine?"bubble mine":"bubble"}>
            {m.body}
          </div>
        )}
      </div>

      <div className="message-input">

        <input
          aria-label="메시지 입력"
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.nativeEvent.isComposing&&send()}
          placeholder={user?"메시지를 입력하세요":"로그인 후 대화할 수 있어요"}
        />
        <button className="send" onClick={send} disabled={!text.trim()} aria-label="메시지 보내기"><Send/></button>
      </div>
    </section>:<div className="empty-state">커뮤니티에 가입하면 단체 대화에 참여할 수 있어요.</div>}
  </div>;
}

function NotificationsView({read,markRead}:{read:boolean;markRead:()=>void}) { return <div className="single-page narrow"><header className="page-title row"><div><span className="eyebrow">NOTIFICATIONS</span><h1>알림</h1></div><button className="outline" onClick={markRead} disabled={read}>{read?"모두 읽었어요":"모두 읽음"}</button></header><div className="notification-list"><p className="record-empty">아직 받은 알림이 없어요.</p></div></div>; }

function PublicProfileView({name,posts,requireLogin,setView}:{name:string;posts:Post[];requireLogin:(f:()=>void)=>void;setView:(v:View)=>void}) { const [requested,setRequested]=useState(false); const visible=posts.filter(p=>p.author===name||p.id==="p1").slice(0,3); return <div className="single-page person-page"><button className="profile-back" onClick={()=>setView("home")}>← 홈으로</button><section className="public-profile-head"><Avatar text={name} size="lg"/><div><small>@{name==="파란귤"?"blue_tangerine":"mocca_star"}</small><h1>{name}</h1><p>좋아하는 장면과 문장을 오래 기록하고 싶어요. 취향이 맞는 사람과 천천히 친해지는 중입니다.</p><div className="interest-tags"><span>독서</span><span>애니메이션</span><span>사진</span></div></div><div className="profile-actions"><button className={requested?"joined":"primary"} onClick={()=>requireLogin(()=>{setRequested(true);toast.success("친구 요청을 보냈어요")})}>{requested?<><Check/> 요청 보냄</>:<><Users/> 친구 요청</>}</button><button className="outline" onClick={()=>requireLogin(()=>setView("messages"))}><MessageCircle/> 대화 시작</button><button className="icon-only" aria-label="사용자 차단" onClick={()=>toast("차단 여부를 확인하는 화면으로 연결돼요")}><Shield/></button></div></section><div className="relationship-summary"><div><b>2개</b><span>공통 취미</span></div><div><b>1개</b><span>함께 가입한 커뮤니티</span></div><div><b>18개</b><span>공개 덕질 기록</span></div></div><section className="public-records"><div className="zone-title"><div><h2>{name}님의 덕질 기록</h2><span>커뮤니티에 남긴 공개 기록</span></div></div>{visible.map(p=><article key={p.id}><span className="kind">{p.kind}</span><div><small>{p.community} · {p.time} 전</small><h3>{p.title}</h3><p>{p.body}</p></div><span>♥ {p.likes}</span></article>)}</section><button className="block-link" onClick={()=>toast("사용자 신고·차단 관리 화면입니다")}><Flag/> 신고 또는 차단</button></div>; }

function ProfileView({user,signInPath,signOutPath,setView}:{user:Viewer;signInPath:string;signOutPath:string;setView:(v:View)=>void}) { if(!user)return <div className="single-page"><Empty title="나만의 취향 공간을 만들어보세요" text="로그인하면 관심 취미, 커뮤니티, 북마크와 대화를 한곳에서 관리할 수 있어요." action={<a className="primary" href={signInPath} target="_top">로그인 / 회원가입</a>}/></div>; return <div className="profile-page single-page"><section className="profile-hero"><Avatar text={user.name} size="lg"/><div><span>@taste_friend</span><h1>{user.name}</h1><p>좋아하는 것을 오래 좋아하고 싶어요. 애니메이션, 독서, 사진을 함께 즐겨요.</p><div className="interest-tags"><span>애니메이션</span><span>독서</span><span>사진</span></div></div><button className="outline"><Settings/> 프로필 편집</button></section><button className="big-chat" onClick={()=>setView("messages")}><span><MessageCircle/><b>대화로 바로 가기</b></span><span>읽지 않은 대화 3개 <ChevronRight/></span></button><div className="profile-grid"><section><h2>내 활동</h2>{[[Users,"가입한 커뮤니티","2개"],[BookOpen,"작성한 게시글","8개"],[Bookmark,"북마크","24개"],[CalendarDays,"참여 중인 활동","2개"]].map(([Icon,label,count])=><button key={String(label)}><Icon/><span>{String(label)}</span><b>{String(count)}</b><ChevronRight/></button>)}</section><section><h2>친구와 요청</h2><div className="friend-preview"><Avatar text="모"/><span><b>모카별</b><small>친구 요청을 보냈어요</small></span><button className="primary">수락</button></div><div className="friend-preview"><Avatar text="윤"/><span><b>윤슬</b><small>3개의 공통 취미</small></span><button className="outline">대화</button></div></section><section><h2>설정</h2><button><Bell/><span>알림 설정</span><ChevronRight/></button><button><Shield/><span>차단·신고 관리</span><ChevronRight/></button><a className="logout" href={signOutPath} target="_top"><LogOut/> 로그아웃</a></section></div></div>; }

function MemberList(){return <div className="members">{["파란귤","모카별","윤슬","고래구름"].map((m,i)=><div key={m}><Avatar text={m}/><span><b>{m}</b><small>{i===0?"운영자 · 애니메이션":"멤버 · 공통 취미 2개"}</small></span>{i===0?<span className="manager">운영자</span>:<button className="outline" onClick={()=>toast("친구 요청을 보냈어요")}>친구 추가</button>}</div>)}</div>}
function Empty({title,text,action}:{title:string;text:string;action?:React.ReactNode}){return <div className="empty-state"><span><Search/></span><h2>{title}</h2><p>{text}</p>{action}</div>}

function Composer({boardName,open,setOpen,user,loading,setLoading,error,setError,onAdd}:{boardName:string;open:boolean;setOpen:(x:boolean)=>void;user:Viewer;loading:boolean;setLoading:(x:boolean)=>void;error:string;setError:(x:string)=>void;onAdd:(p:Post)=>void}) { const [title,setTitle]=useState(""); const [body,setBody]=useState(""); const [anonymous,setAnonymous]=useState(false); const [sourceTitle,setSourceTitle]=useState(""); const [target,setTarget]=useState(""); const [spoiler,setSpoiler]=useState(false); const [kind,setKind]=useState("덕질 기록"); const [images,setImages]=useState<string[]>([]); const fileRef=useRef<HTMLInputElement>(null); const pick=(files:FileList|null)=>{if(!files)return;setError("");const list=Array.from(files).slice(0,4);if(list.some(f=>f.size>5_000_000)){setError("이미지는 한 장당 5MB 이하로 올려주세요.");return;}Promise.all(list.map(f=>new Promise<string>(resolve=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.readAsDataURL(f)}))).then(setImages)}; const submit=async()=>{if(!title.trim()){setError("제목을 입력해 주세요.");return;}if(!body.trim()&&!images.length){setError("내용이나 이미지 중 하나는 꼭 넣어주세요.");return;}setLoading(true);setError("");try{const response=await fetch("/api/posts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:title.trim(),body:body.trim(),community:boardName,kind,images:[],tags:["#취향기록"],anonymous,sourceTitle,target,spoiler})});if(!response.ok)throw new Error("save failed");onAdd({id:crypto.randomUUID(),title:title.trim(),author:anonymous?"익명":user?.name||"나",handle:anonymous?"":"@me",avatar:anonymous?"익":user?.name||"나",community:boardName,kind,body:body.trim(),time:"방금",image:images[0],likes:0,comments:0,tags:["#취향기록"],mine:true});setTitle("");setBody("");setImages([]);setAnonymous(false)}catch{setError("업로드하지 못했어요. 잠시 후 다시 시도해 주세요.")}finally{setLoading(false)}}; return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="composer"><DialogHeader><DialogTitle>{boardName}에 글쓰기</DialogTitle></DialogHeader><p className="composer-board">게시판 · <b>{boardName}</b></p><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="제목을 입력하세요" aria-label="게시글 제목"/><div className="anonymous-toggle"><span><b>익명으로 작성</b><small>게시판에는 닉네임 대신 익명으로 표시돼요.</small></span><Switch checked={anonymous} onCheckedChange={setAnonymous} aria-label="익명 작성"/></div>{boardName.startsWith("2차창작")&&<div className="fanwork-fields"><Input value={sourceTitle} onChange={e=>setSourceTitle(e.target.value)} placeholder="원작명 (선택)"/><Input value={target} onChange={e=>setTarget(e.target.value)} placeholder="캐릭터 또는 대상 (선택)"/><label><span><b>스포일러 포함</b><small>목록과 상세 화면에 주의 문구가 표시돼요.</small></span><Switch checked={spoiler} onCheckedChange={setSpoiler}/></label></div>}<div className="composer-user"><Avatar text={user?.name||"나"}/><div><b>{user?.name}</b><select value={kind} onChange={e=>setKind(e.target.value)}><option>덕질 기록</option><option>질문</option><option>정보 공유</option><option>작품 공유</option><option>후기</option><option>잡담</option></select></div></div><Textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="좋아하는 마음을 자유롭게 남겨보세요…" aria-label="게시글 내용"/><div className="preview-strip">{images.map((src,i)=><span key={src}><img src={src} alt={`첨부 이미지 ${i+1}`}/><button onClick={()=>setImages(v=>v.filter((_,n)=>n!==i))} aria-label="이미지 삭제"><X/></button></span>)}</div>{error&&<p className="form-error">{error}</p>}<div className="composer-bottom"><input ref={fileRef} hidden type="file" multiple accept="image/*" onChange={e=>pick(e.target.files)}/><button className="attach" onClick={()=>fileRef.current?.click()}><ImagePlus/> 사진 <small>{images.length}/4</small></button><Button onClick={submit} disabled={loading}>{loading?"올리는 중…":"게시하기"}</Button></div></DialogContent></Dialog>; }
