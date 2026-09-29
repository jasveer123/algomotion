"use client";
import type { KeyboardEvent } from "react";
import { useId } from "react";
import { Button, Card } from "@/components/neo";
import { IconNext, IconPause, IconPlay, IconPrev, IconRestart } from "@/components/icons";
import { SPEEDS, type Playback } from "@/lib/usePlayback";

/** Play/pause/step/restart/speed/scrub. Keys (when focus is inside): space = play/pause, ←/→ = step. */
export function PlaybackControls({ pb, label = "animation" }: { pb: Playback; label?: string }) {
  const scrubId = useId();
  const speedId = useId();
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "SELECT") return;
    if (e.key === "ArrowRight") { e.preventDefault(); pb.next(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); pb.prev(); }
  };
  const pct = pb.total > 1 ? (pb.index / (pb.total - 1)) * 100 : 100;
  return (
    <Card flat className="am-playback" role="group" aria-label={`${label} playback`} onKeyDown={onKeyDown} style={{ padding: "12px 14px" }}>
      <Button variant="ghost" icon size="md" onClick={pb.restart} aria-label="restart" title="restart"><IconRestart /></Button>
      <Button variant="ghost" icon onClick={pb.prev} disabled={pb.index === 0} aria-label="previous step" title="previous step (←)"><IconPrev /></Button>
      <Button variant="primary" icon onClick={pb.toggle} aria-label={pb.playing ? "pause" : pb.atEnd ? "replay" : "play"} title={pb.playing ? "pause" : "play"}>
        {pb.playing ? <IconPause /> : <IconPlay />}
      </Button>
      <Button variant="ghost" icon onClick={pb.next} disabled={pb.atEnd} aria-label="next step" title="next step (→)"><IconNext /></Button>
      <div className="am-scrub">
        <label htmlFor={scrubId} className="am-small am-muted">step {pb.index + 1} of {pb.total}</label>
        <input
          id={scrubId}
          type="range"
          className="am-range"
          min={0}
          max={Math.max(0, pb.total - 1)}
          value={pb.index}
          onChange={(e) => pb.seek(Number(e.target.value))}
          style={{ ["--pct" as string]: `${pct}%` }}
          aria-valuetext={`step ${pb.index + 1} of ${pb.total}`}
        />
      </div>
      <div className="nb-field" style={{ minWidth: 84 }}>
        <label htmlFor={speedId} className="am-small am-muted">speed</label>
        <select id={speedId} className="nb-input am-speed" value={pb.speed} onChange={(e) => pb.setSpeed(Number(e.target.value))} style={{ minHeight: 36, padding: "4px 30px 4px 10px", fontSize: ".85rem" }}>
          {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
        </select>
      </div>
    </Card>
  );
}
