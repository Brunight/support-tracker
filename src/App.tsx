import { useEffect, useState } from "react";
import { ALREADY_PLAYED, CHAMPIONS, FALLBACK_VERSION, fetchLatestVersion, iconUrl } from "./champions";

const STORAGE_KEY = "support-tracker:played";
const PICK_KEY = "support-tracker:pick";
const SEEDED_KEY = "support-tracker:seeded-v1";

function loadPlayed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const played = new Set(raw ? (JSON.parse(raw) as string[]) : []);
    // One-time: mark the champions played before the tracker as done.
    if (!localStorage.getItem(SEEDED_KEY)) {
      ALREADY_PLAYED.forEach((c) => played.add(c));
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...played]));
      localStorage.setItem(SEEDED_KEY, "1");
    }
    return played;
  } catch {
    return new Set();
  }
}

export default function App() {
  const [played, setPlayed] = useState<Set<string>>(loadPlayed);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [pick, setPick] = useState<string | null>(() => localStorage.getItem(PICK_KEY));
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (pick) localStorage.setItem(PICK_KEY, pick);
    else localStorage.removeItem(PICK_KEY);
  }, [pick]);

  // Once the picked champion is marked as played, clear the pick.
  useEffect(() => {
    if (pick && played.has(pick)) setPick(null);
  }, [pick, played]);

  useEffect(() => {
    fetchLatestVersion().then(setVersion);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...played]));
  }, [played]);

  const toggle = (name: string) =>
    setPlayed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const count = played.size;
  const total = CHAMPIONS.length;
  const pct = Math.round((count / total) * 100);
  const remaining = CHAMPIONS.filter((c) => !played.has(c.name));
  const nextUp = CHAMPIONS.find((c) => c.name === pick);

  const roll = () => {
    if (remaining.length === 0 || rolling) return;
    setRolling(true);
    // Quick shuffle animation before landing on the final pick.
    let ticks = 0;
    const interval = setInterval(() => {
      const choice = remaining[Math.floor(Math.random() * remaining.length)];
      setPick(choice.name);
      if (++ticks >= 12) {
        clearInterval(interval);
        setRolling(false);
      }
    }, 70);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center gap-4">
          {nextUp ? (
            <img
              src={iconUrl(version, nextUp.id)}
              alt={nextUp.name}
              className="size-16 rounded-lg ring-2 ring-amber-400"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-slate-700 text-2xl text-slate-600">
              ?
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">Support Challenge</h1>
            <p className="mt-1 text-slate-400">
              {remaining.length === 0 ? (
                "All done. GG!"
              ) : nextUp ? (
                <>
                  Next up: <span className="font-semibold text-amber-300">{nextUp.name}</span>
                </>
              ) : (
                "Roll for your next champion."
              )}
            </p>
          </div>
          {remaining.length > 0 && (
            <button
              type="button"
              onClick={roll}
              disabled={rolling}
              className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-70"
            >
              🎲 {nextUp ? "Reroll" : "Random"}
            </button>
          )}
        </header>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm text-slate-400">
            <span>
              {count} / {total} played
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {CHAMPIONS.map(({ name, id }) => {
            const done = played.has(name);
            const picked = name === pick;
            return (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => toggle(name)}
                  aria-pressed={done}
                  className={`group relative flex w-full flex-col items-center gap-2 rounded-xl border p-2 transition ${
                    done
                      ? "border-amber-400/60 bg-amber-400/10"
                      : picked
                        ? "border-sky-400 bg-sky-400/10 ring-2 ring-sky-400"
                        : "border-slate-800 bg-slate-900 hover:border-slate-500"
                  }`}
                >
                  <div className="relative w-full">
                    <img
                      src={iconUrl(version, id)}
                      alt={name}
                      loading="lazy"
                      className={`aspect-square w-full rounded-lg object-cover transition ${
                        done || picked ? "" : "opacity-60 grayscale group-hover:opacity-90 group-hover:grayscale-0"
                      }`}
                    />
                    {done && (
                      <span className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-950 shadow">
                        ✓
                      </span>
                    )}
                  </div>
                  <span
                    className={`truncate text-center text-xs font-medium ${
                      done ? "text-amber-200" : "text-slate-300"
                    }`}
                  >
                    {name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {count > 0 && (
          <button
            onClick={() => confirm("Reset all progress?") && (setPlayed(new Set()), setPick(null))}
            className="mt-8 text-sm text-slate-500 hover:text-red-400"
          >
            Reset progress
          </button>
        )}
      </div>
    </main>
  );
}
