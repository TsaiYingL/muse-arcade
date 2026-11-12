"use client";
import { ME, POSTS, STORIES, person } from "@/lib/data";
import { AvatarArt, Scene } from "../art";
import {
  BellIcon, CloseIcon, CommentOutline, CreateIcon, FriendsIcon, GlobeIcon, HomeIcon, LikeOutline, MarketplaceIcon,
  MenuIcon, MessengerGlyph, MoreIcon, PhotoIcon, ReactLike, ReactLove, ReactWow, ReelsIcon, SearchIcon, ShareOutline,
} from "../icons";
import { useNav } from "../nav";
import { Avatar, Tap } from "../ui";
import { useLive } from "@/lib/live";
import { FeedGameCard, visiblePubs } from "../live/GamePost";

export function FacebookHome() {
  const nav = useNav();
  const state = useLive();
  return (
    <div className="absolute inset-0 bg-white">
      <div className="no-scrollbar h-full overflow-y-auto pb-[84px] pt-[54px]">
        {/* Header */}
        <header className="flex h-[40px] items-center pl-[14px] pr-[16px] text-fb-text">
          <Tap label="Menu" className="mr-[9px]"><MenuIcon size={25} /></Tap>
          <span className="wordmark text-[31px] text-fb-blue" style={{ letterSpacing: "-1.3px" }}>facebook</span>
          <div className="ml-auto flex items-center gap-[19px]">
            <Tap label="Create"><CreateIcon size={25} /></Tap>
            <Tap label="Search"><SearchIcon size={25} /></Tap>
            <Tap label="Messenger" onPress={() => nav.push({ screen: "inbox" })}>
              <MessengerGlyph size={26} />
            </Tap>
          </div>
        </header>

        {/* Composer */}
        <div className="flex items-center gap-[10px] px-4 pb-[12px] pt-[16px]">
          <Tap><Avatar id="me" size={40} /></Tap>
          <Tap variant="soft" className="flex-1 text-left text-[17px] text-fb-secondary">What&apos;s on your mind?</Tap>
          <Tap label="Photo" className="text-[#5B5E63]"><PhotoIcon size={26} /></Tap>
        </div>

        {/* Stories */}
        <div className="no-scrollbar flex gap-[8px] overflow-x-auto px-[12px] pb-[12px] pt-[4px]">
          <Tap variant="soft" className="relative h-[184px] w-[104px] shrink-0 overflow-hidden rounded-[12px] bg-[#F0F2F5] ring-1 ring-[#E4E6EB]">
            <div className="h-[118px] w-full overflow-hidden">
              <div className="-ml-[7px] h-[118px] w-[118px]"><AvatarArt seed={ME.seed} /></div>
            </div>
            <span className="absolute left-1/2 top-[118px] grid h-[36px] w-[36px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-fb-blue shadow-[0_0_0_3px_#F0F2F5]">
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" /></svg>
            </span>
            <span className="absolute inset-x-0 bottom-[10px] text-center text-[13px] font-semibold leading-[16px] text-fb-text">
              Create a<br />story
            </span>
          </Tap>
          {STORIES.map((s) => (
            <Tap key={s.id} variant="soft" className="relative h-[184px] w-[104px] shrink-0 overflow-hidden rounded-[12px]">
              <Scene seed={s.scene} />
              <span className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />
              <span className="absolute left-[8px] top-[8px] rounded-full bg-white p-[2px] ring-[3px] ring-fb-blue">
                <Avatar id={s.id} size={30} />
              </span>
              <span className="absolute inset-x-[8px] bottom-[8px] text-left text-[13px] font-semibold leading-[16px] text-white">
                {person(s.id).name.split(" ").map((w, i) => <span key={i} className="block">{w}</span>)}
              </span>
            </Tap>
          ))}
        </div>
        <div className="h-[4px] bg-fb-band" />

        {/* Games published by group chats, filtered by each post's audience */}
        {state && visiblePubs(state).map((x) => <FeedGameCard key={x.pub.id} {...x} />)}

        {/* Posts */}
        {POSTS.map((p) => {
          const a = person(p.author);
          return (
            <article key={p.id} className="pb-[2px]">
              <div className="flex items-center gap-[10px] px-4 pt-[12px]">
                <Tap><Avatar id={p.author} size={40} active={a.active} /></Tap>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold leading-[20px] text-fb-text">{a.name}</div>
                  <div className="flex items-center gap-[3px] text-[13px] leading-[17px] text-fb-secondary">
                    {p.meta} · <GlobeIcon size={11} />
                  </div>
                </div>
                <Tap label="More" className="text-fb-secondary"><MoreIcon size={20} /></Tap>
                <Tap label="Hide" className="ml-[14px] text-fb-secondary"><CloseIcon size={20} /></Tap>
              </div>
              <p className="px-4 pb-[10px] pt-[8px] text-[15px] leading-[20px] text-fb-text">{p.text}</p>
              <Tap variant="soft" className="block h-[240px] w-full"><Scene seed={p.scene} /></Tap>
              <div className="flex items-center px-4 py-[11px] text-[15px] text-fb-secondary">
                <Tap className="mr-[22px] flex items-center gap-[6px]"><LikeOutline size={21} />{p.likes}</Tap>
                <Tap className="mr-[22px] flex items-center gap-[6px]"><CommentOutline size={21} />{p.comments}</Tap>
                <Tap className="flex items-center gap-[6px]"><ShareOutline size={21} />{p.shares}</Tap>
                <Tap className="ml-auto flex">
                  {[ReactLike, ReactWow, ReactLove].map((R, i) => (
                    <span key={i} className="-ml-[4px] rounded-full ring-2 ring-white first:ml-0" style={{ zIndex: 3 - i }}><R size={18} /></span>
                  ))}
                </Tap>
              </div>
              <div className="h-[4px] bg-fb-band" />
            </article>
          );
        })}
      </div>

      {/* Tab bar (Dec 2025 layout: Home · Friends · Reels · Marketplace · Notifications · Profile) */}
      <nav className="absolute inset-x-0 bottom-0 z-10 h-[84px] border-t-[0.5px] border-[#DADDE1] bg-white">
        <div className="grid grid-cols-6">
          {[
            { label: "Home", icon: <HomeIcon filled size={26} />, sel: true },
            { label: "Friends", icon: <FriendsIcon size={26} /> },
            { label: "Reels", icon: <ReelsIcon size={26} /> },
            { label: "Marketplace", icon: <MarketplaceIcon size={26} /> },
            { label: "Notifications", icon: <BellIcon size={26} />, badge: "5" },
            { label: "Profile", icon: <Avatar id={ME.id} size={27} /> },
          ].map((t) => (
            <Tap
              key={t.label}
              variant="soft"
              className={`relative flex h-[60px] flex-col items-center justify-end pb-[2px] ${t.sel ? "text-fb-blue" : "text-fb-text"}`}
            >
              {t.sel && <span className="absolute inset-x-[6px] top-[-0.5px] h-[2px] rounded-b bg-fb-blue" />}
              <span className="relative grid h-[28px] place-items-center">
                {t.icon}
                {t.badge && (
                  <span className="absolute -right-[9px] -top-[3px] grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#E41E3F] px-[5px] text-[11px] font-bold text-white ring-2 ring-white">
                    {t.badge}
                  </span>
                )}
              </span>
              <span className={`mt-[3px] whitespace-nowrap text-[10.5px] leading-[13px] tracking-[-0.1px] ${t.sel ? "text-fb-blue" : "text-fb-secondary"}`}>
                {t.label}
              </span>
            </Tap>
          ))}
        </div>
      </nav>
    </div>
  );
}
