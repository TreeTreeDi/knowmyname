import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SEED_BOTTLES } from '../lib/bottles/seed';
import { MAX_FROM, MAX_TEXT, type Bottle } from '../lib/bottles/types';

/**
 * Message-in-a-bottle guestbook. Talks to /api/bottles; if the API is unreachable
 * (pure static hosting), falls back to localStorage + the seed bottles so the page still plays.
 */

const API = '/api/bottles';
const MINE = 'seaside-my-bottles';
const LOCAL = 'seaside-local-bottles';

const readJSON = <T,>(k: string, d: T): T => {
  try {
    return JSON.parse(localStorage.getItem(k) ?? '') as T;
  } catch {
    return d;
  }
};

async function fish(exclude?: string): Promise<{ bottle: Bottle | null; count: number; offline?: boolean }> {
  try {
    const r = await fetch(`${API}${exclude ? `?exclude=${encodeURIComponent(exclude)}` : ''}`);
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch {
    const pool = [...SEED_BOTTLES, ...readJSON<Bottle[]>(LOCAL, [])].filter((b) => b.id !== exclude);
    return { bottle: pool[Math.floor(Math.random() * pool.length)] ?? null, count: pool.length, offline: true };
  }
}

async function toss(text: string, from?: string): Promise<Bottle> {
  try {
    const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, from }) });
    const data = await r.json();
    if (!r.ok) throw Object.assign(new Error(data.error ?? '扔不出去'), { user: true });
    return data.bottle;
  } catch (e) {
    if ((e as { user?: boolean }).user) throw e;
    const b: Bottle = { id: `local-${Date.now()}`, text, from, createdAt: new Date().toISOString() };
    localStorage.setItem(LOCAL, JSON.stringify([...readJSON<Bottle[]>(LOCAL, []), b]));
    return b;
  }
}

const fmt = (iso: string) =>
  new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso));

function BottleGlyph({ bob = true }: { bob?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      className="bottle-glyph"
      viewBox="0 0 220 90"
      aria-hidden="true"
      animate={reduce || !bob ? undefined : { y: [0, -6, 0, 4, 0], rotate: [-4, 2, -4] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path d="M18 30c0-11 8-18 20-18h96c10 0 16 5 22 10h22c4 0 6 3 6 6v24c0 3-2 6-6 6h-22c-6 5-12 10-22 10H38c-12 0-20-7-20-18V30Z" fill="var(--glass, rgba(255,255,255,.18))" stroke="currentColor" strokeWidth="2" />
      <rect x="184" y="25" width="22" height="30" rx="4" fill="#b98a5a" stroke="currentColor" strokeWidth="2" />
      <path d="M44 34h86c6 0 6 22 0 22H44c-6 0-6-22 0-22Z" fill="#f2e6cf" stroke="currentColor" strokeWidth="1.4" />
      <path d="M54 41h62M54 47h48" stroke="currentColor" strokeWidth="1" opacity=".45" />
      <path d="M30 24c8-4 20-5 34-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".55" fill="none" />
    </motion.svg>
  );
}

export default function BottleGuestbook({ compact = false }: { compact?: boolean }) {
  const [found, setFound] = useState<Bottle | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [fishing, setFishing] = useState(false);
  const [text, setText] = useState('');
  const [from, setFrom] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const reduce = useReducedMotion();

  const pick = async () => {
    setFishing(true);
    const mine = readJSON<string[]>(MINE, []);
    let res = await fish(found?.id);
    // Don't hand people their own bottle if we can avoid it.
    for (let i = 0; i < 3 && res.bottle && mine.includes(res.bottle.id); i++) res = await fish(res.bottle.id);
    await new Promise((r) => setTimeout(r, reduce ? 0 : 650));
    setFound(res.bottle);
    setCount(res.count);
    setOffline(!!res.offline);
    setFishing(false);
  };

  useEffect(() => {
    fish().then((r) => {
      setCount(r.count);
      setOffline(!!r.offline);
    });
  }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!text.trim()) return setError('写点什么再扔吧');
    setState('sending');
    try {
      const b = await toss(text.trim(), from.trim() || undefined);
      localStorage.setItem(MINE, JSON.stringify([...readJSON<string[]>(MINE, []), b.id]));
      await new Promise((r) => setTimeout(r, reduce ? 0 : 900));
      setState('sent');
      setText('');
      setCount((c) => (c ?? 0) + 1);
    } catch (err) {
      setError((err as Error).message);
      setState('idle');
    }
  };

  const len = [...text].length;

  return (
    <div className={`bottles ${compact ? 'is-compact' : ''}`}>
      <section className="bottles-fish" aria-labelledby="fish-h">
        <p className="bottles-kicker">捡 · Find</p>
        <h3 id="fish-h">从海里捞一只</h3>
        <p className="bottles-note">
          {count === null ? '正在数海里的瓶子……' : `海里现在漂着 ${count} 只瓶子。`}
          {offline && <span className="bottles-offline">（离线模式：瓶子只存在这台设备上）</span>}
        </p>
        <div className="bottles-stage">
          <AnimatePresence mode="wait">
            {found && !fishing ? (
              <motion.figure
                key={found.id}
                className="note-paper"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scaleY: 0.1, rotate: -6, y: 30 }}
                animate={{ opacity: 1, scaleY: 1, rotate: -1.2, y: 0 }}
                exit={{ opacity: 0, y: -20, rotate: 4 }}
                transition={{ type: 'spring', stiffness: 160, damping: 18 }}
              >
                <blockquote>{found.text}</blockquote>
                <figcaption>
                  —— {found.from ?? '一个没留名字的人'} · {fmt(found.createdAt)}
                </figcaption>
              </motion.figure>
            ) : (
              <motion.div key="bottle" className="bottles-floating" exit={{ opacity: 0, y: 30 }}>
                <BottleGlyph />
                {fishing && <span className="bottles-status">捞起来了，正在拔木塞……</span>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button className="btn" type="button" onClick={pick} disabled={fishing}>
          {found ? '放回去，再捞一只' : '捞一只'}
        </button>
      </section>

      <section className="bottles-toss" aria-labelledby="toss-h">
        <p className="bottles-kicker">扔 · Send</p>
        <h3 id="toss-h">写一句话，扔进海里</h3>
        <p className="bottles-note">下一个来到海边的人，可能会捡到它。</p>
        <AnimatePresence mode="wait">
          {state === 'sent' ? (
            <motion.div key="sent" className="bottles-sent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="bottles-splash">扑通。</p>
              <p>你的瓶子漂走了。也许明天，也许明年，会有人捡到它。</p>
              <button className="btn btn-ghost" type="button" onClick={() => setState('idle')}>
                再写一封
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={send}
              className="note-form"
              animate={state === 'sending' && !reduce ? { x: 260, y: -40, rotate: 28, opacity: 0, scale: 0.4 } : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
              transition={{ duration: state === 'sending' ? 0.9 : 0.3, ease: [0.3, 0.1, 0.2, 1] }}
            >
              <label className="sr-only" htmlFor="bottle-text">留言</label>
              <textarea
                id="bottle-text"
                value={text}
                maxLength={MAX_TEXT * 2}
                rows={compact ? 3 : 4}
                placeholder="比如：今天的海是什么颜色？"
                onChange={(e) => setText(e.target.value)}
              />
              <div className="note-form-row">
                <label className="sr-only" htmlFor="bottle-from">署名</label>
                <input id="bottle-from" value={from} maxLength={MAX_FROM} placeholder="署名（可不填）" onChange={(e) => setFrom(e.target.value)} />
                <span className={`note-count ${len > MAX_TEXT ? 'is-over' : ''}`}>
                  {len}/{MAX_TEXT}
                </span>
              </div>
              {error && <p className="note-error" role="alert">{error}</p>}
              <button className="btn" type="submit" disabled={state === 'sending' || len > MAX_TEXT}>
                {state === 'sending' ? '扔出去了……' : '塞进瓶子，扔出去'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
