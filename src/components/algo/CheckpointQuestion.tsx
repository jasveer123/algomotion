"use client";
import { useState } from "react";
import { Button, Card } from "@/components/neo";
import { cx } from "@/components/neo/cx";
import { IconCheck } from "@/components/icons";
import type { Checkpoint } from "@/lib/types";

export function CheckpointQuestion({ cp, index, onCorrect, solved }: { cp: Checkpoint; index: number; onCorrect: () => void; solved: boolean }) {
  const [picked, setPicked] = useState<number | null>(null);
  const right = picked === cp.answer;
  const qid = `cp-${index}-q`;
  return (
    <Card as="section" aria-labelledby={qid} className="am-stack" style={{ gap: 16 }}>
      <div className="am-row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 id={qid} style={{ textTransform: "none", fontSize: "1.05rem" }}>
          <span className="am-eyebrow" style={{ display: "block", marginBottom: 4 }}>quick check {index + 1}</span>
          {cp.q}
        </h3>
        {solved ? <span className="nb-tag nb-tone-green nb-tag-flat" aria-label="answered correctly before"><IconCheck width={12} height={12} /> got it</span> : null}
      </div>
      <div className="am-options" role="group" aria-labelledby={qid}>
        {cp.options.map((o, i) => (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            aria-pressed={picked === i}
            className={cx("am-option", picked === i && (i === cp.answer ? "is-right" : "is-wrong"))}
            onClick={() => {
              setPicked(i);
              if (i === cp.answer) onCorrect();
            }}
          >
            {picked === i && i === cp.answer ? <IconCheck /> : null}
            {o}
          </Button>
        ))}
      </div>
      <p className={cx("am-feedback", picked !== null && (right ? "is-right" : "is-wrong"))} role="status" aria-live="polite" style={{ minHeight: "1.3em" }}>
        {picked === null ? "" : right ? cp.right : `${cp.wrong} try another option.`}
      </p>
    </Card>
  );
}
