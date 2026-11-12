"use client";
import { CHATS, person, type Msg } from "@/lib/data";
import { useLayoutEffect, useRef } from "react";
import { Scene } from "../art";
import {
  CameraIcon, ChevronLeft, GalleryIcon, MicIcon, PhoneIcon, PlusCircle, ReplyIcon, SmileyIcon, ThumbUpFilled, VideoIcon,
} from "../icons";
import { useNav } from "../nav";
import { Avatar, ComposerPlusMenuSlot, GroupAvatar, PinnedCardSlot, Tap } from "../ui";

const R = 18; // bubble radius
const r = 4; // grouped (inner) corner radius
// Messages made only of 1-3 emoji render large, without a bubble.
const isBigEmoji = (t: string) => /^(\p{Extended_Pictographic}|\p{Emoji_Modifier}|‍|️){1,8}$/u.test(t) && [...new Intl.Segmenter().segment(t)].length <= 3;

export function MessengerThread({ chatId }: { chatId: string }) {
  const nav = useNav();
  const chat = CHATS.find((c) => c.id === chatId)!;
  const isGroup = chat.kind === "group";
  const dmPerson = person(chat.members[0]);
  const anyActive = chat.members.some((m) => person(m).active);
  const scroller = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const msgs = chat.messages;
  const same = (a?: Msg, b?: Msg) => !!a && !!b && a.from === b.from && !b.sep;

  return (
    <div className="absolute inset-0 bg-white">
      {/* Messages */}
      <div ref={scroller} className="no-scrollbar h-full overflow-y-auto pb-[100px] pt-[104px]">
        {msgs.map((m, i) => {
          const prev = msgs[i - 1];
          const next = msgs[i + 1];
          const joinPrev = same(prev, m) && !m.replyLabel;
          const joinNext = same(m, next) && !next?.replyLabel;
          const mine = m.from === "me";
          const radius = mine
            ? `${R}px ${joinPrev ? r : R}px ${joinNext ? r : R}px ${R}px`
            : `${joinPrev ? r : R}px ${R}px ${R}px ${joinNext ? r : R}px`;
          const showName = isGroup && !mine && !joinPrev;
          const showAvatar = !mine && !joinNext;
          const hasReacts = !!m.reacts?.length;

          return (
            <div key={m.id}>
              {m.sep && (
                <div className="pb-[10px] pt-[18px] text-center text-[12px] font-medium leading-[16px] text-fb-secondary">{m.sep}</div>
              )}
              {m.replyLabel && (
                <div className={`flex items-center gap-[4px] pb-[4px] pt-[8px] text-[12px] text-fb-secondary ${mine ? "justify-end pr-[14px]" : "pl-[58px]"}`}>
                  <ReplyIcon size={12} /> {m.replyLabel}
                </div>
              )}
              {showName && !m.replyLabel && (
                <div className="pb-[3px] pl-[64px] pt-[6px] text-[12px] leading-[15px] text-fb-secondary">{person(m.from).first}</div>
              )}
              <div
                className={`flex items-end ${mine ? "justify-end pr-[10px]" : "pl-[12px]"}`}
                style={{ marginTop: joinPrev ? 2 : m.sep || showName || m.replyLabel ? 0 : 8, marginBottom: hasReacts ? 16 : 0 }}
              >
                {!mine && (
                  <div className="mr-[8px] w-[28px] shrink-0">
                    {showAvatar && <Avatar id={m.from} size={28} />}
                  </div>
                )}
                <Tap variant="soft" className="relative max-w-[264px] text-left">
                  {m.text && isBigEmoji(m.text) ? (
                    <span className="block px-[2px] text-[40px] leading-[48px]">{m.text}</span>
                  ) : m.image ? (
                    <span className="block overflow-hidden" style={{ width: m.image.w, height: m.image.h, borderRadius: radius }}>
                      <Scene seed={m.image.seed} />
                    </span>
                  ) : (
                    <span
                      className={`block px-[12px] py-[8px] text-[17px] leading-[22px] ${mine ? "bg-msgr-out text-white" : "bg-msgr-in text-black"}`}
                      style={{ borderRadius: radius }}
                    >
                      {m.text}
                    </span>
                  )}
                  {hasReacts && (
                    <span className="absolute -bottom-[16px] right-[6px] flex h-[22px] items-center rounded-full bg-white px-[4px] text-[13px] shadow-[0_0_0_1.5px_#fff,0_1px_3px_rgba(0,0,0,0.2)]">
                      {m.reacts!.map((e, k) => <span key={k} className="leading-none">{e}</span>)}
                      {m.reactCount && m.reactCount > 1 && <span className="ml-[3px] mr-[1px] text-[12px] text-fb-secondary">{m.reactCount}</span>}
                    </span>
                  )}
                </Tap>
              </div>
            </div>
          );
        })}
        {/* Read receipts sit under the latest message the readers have seen (here: the last one). */}
        {chat.seenBy && (
          <div className="flex justify-end gap-[2px] pr-[10px] pt-[4px]">
            {chat.seenBy.map((id) => <Avatar key={id} id={id} size={14} />)}
          </div>
        )}
        {chat.typing && (
          <div className="mt-[10px] flex items-end pl-[12px]">
            <Avatar id={chat.typing} size={28} className="mr-[8px]" />
            <span className="flex h-[36px] items-center gap-[4px] rounded-[18px] bg-msgr-in px-[14px]">
              {[0, 1, 2].map((d) => <span key={d} className="typing-dot h-[7px] w-[7px] rounded-full bg-[#64686C]" style={{ animationDelay: `${d * 160}ms` }} />)}
            </span>
          </div>
        )}
      </div>

      {/* Header (translucent; content scrolls beneath) */}
      <div className="absolute inset-x-0 top-0 z-20 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
        <header className="flex h-[52px] items-center pl-[6px] pr-[12px] pt-[54px] box-content">
          <Tap label="Back" onPress={nav.pop} className="grid h-[44px] w-[36px] place-items-center text-msgr-icon">
            <ChevronLeft size={26} />
          </Tap>
          <Tap variant="soft" className="flex min-w-0 flex-1 items-center text-left">
            {isGroup ? <GroupAvatar ids={chat.members} size={36} /> : <Avatar id={dmPerson.id} size={36} active={anyActive} />}
            <span className="ml-[10px] min-w-0">
              <span className="block truncate text-[17px] font-semibold leading-[21px] text-black">{chat.name}</span>
              {!isGroup && dmPerson.activeLabel && (
                <span className="block text-[13px] leading-[16px] text-fb-secondary">{dmPerson.activeLabel}</span>
              )}
            </span>
          </Tap>
          <div className="ml-[8px] flex items-center gap-[22px] text-msgr-icon">
            <Tap label="Audio call"><PhoneIcon size={25} /></Tap>
            <Tap label="Video call"><VideoIcon size={27} /></Tap>
          </div>
        </header>
        <PinnedCardSlot chatId={chat.id} />
      </div>

      {/* Composer */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-white/90 pb-[34px] backdrop-blur-xl">
        <ComposerPlusMenuSlot chatId={chat.id} />
        <div className="flex h-[52px] items-center pl-[14px] pr-[13px] text-msgr-icon">
          <div className="flex items-center gap-[20px]">
            <Tap label="More actions"><PlusCircle size={24} /></Tap>
            <Tap label="Camera"><CameraIcon size={24} /></Tap>
            <Tap label="Gallery"><GalleryIcon size={24} /></Tap>
            <Tap label="Voice clip"><MicIcon size={24} /></Tap>
          </div>
          <Tap
            variant="soft"
            className="ml-[12px] flex h-[36px] flex-1 items-center rounded-full bg-msgr-fill pl-[12px] pr-[6px] text-left"
          >
            <span className="flex-1 text-[17px] text-fb-secondary">Aa</span>
            <span className="text-msgr-icon"><SmileyIcon size={24} /></span>
          </Tap>
          <Tap label="Send a like" className="ml-[12px]"><ThumbUpFilled size={26} /></Tap>
        </div>
      </div>
    </div>
  );
}
