"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Frame } from "./types";

export const SPEEDS = [0.5, 1, 1.5, 2, 4] as const;
const BASE_MS = 1100;

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
}

export interface Playback {
  index: number;
  frame: Frame;
  total: number;
  playing: boolean;
  speed: number;
  atEnd: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  restart: () => void;
  seek: (i: number) => void;
  setSpeed: (s: number) => void;
}

/** Drives a list of frames: play/pause/step/scrub/speed. Autoplay never starts on its own. */
export function usePlayback(frames: Frame[]): Playback {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const total = frames.length;
  const [prevFrames, setPrevFrames] = useState(frames);

  // New input or approach → rewind (state adjusted during render, not in an effect).
  if (prevFrames !== frames) {
    setPrevFrames(frames);
    setIndex(0);
    setPlaying(false);
  }

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!playing) return;
    if (index >= total - 1) {
      timer.current = setTimeout(() => setPlaying(false), 0);
      return () => { if (timer.current) clearTimeout(timer.current); };
    }
    timer.current = setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), BASE_MS / speed);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [playing, index, total, speed]);

  const play = useCallback(() => {
    setIndex((i) => (i >= total - 1 ? 0 : i));
    setPlaying(true);
  }, [total]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);
  const next = useCallback(() => { setPlaying(false); setIndex((i) => Math.min(i + 1, total - 1)); }, [total]);
  const prev = useCallback(() => { setPlaying(false); setIndex((i) => Math.max(i - 1, 0)); }, []);
  const restart = useCallback(() => { setPlaying(false); setIndex(0); }, []);
  const seek = useCallback((i: number) => { setPlaying(false); setIndex(Math.max(0, Math.min(total - 1, i))); }, [total]);

  const safe = Math.min(index, Math.max(0, total - 1));
  return { index: safe, frame: frames[safe], total, playing, speed, atEnd: safe >= total - 1, play, pause, toggle, next, prev, restart, seek, setSpeed };
}
