"use client";
import { useState } from "react";
import { TabPanel, Tabs } from "@/components/algo/Tabs";
import { LabView } from "./LabView";
import { ListLab } from "./ListLab";

type Structure = "array" | "list";

/** Switches between the array lab and the linked-list lab. */
export function LabTabs() {
  const [tab, setTab] = useState<Structure>("array");
  return (
    <div className="am-stack" style={{ gap: "var(--space-md)" }}>
      <Tabs<Structure> label="data structure" idBase="lab" tabs={[{ id: "array", label: "array" }, { id: "list", label: "linked list" }]} value={tab} onChange={setTab} />
      <TabPanel idBase="lab" id="array" active={tab === "array"}><LabView /></TabPanel>
      <TabPanel idBase="lab" id="list" active={tab === "list"}><ListLab /></TabPanel>
    </div>
  );
}
