import React, { useEffect, useMemo, useState } from "react";
import { Player } from "@remotion/player";
import { starterProject, type EditableElement, type StudioProject } from "./data/project";
import { VideoComposition } from "./remotion/VideoComposition";

const STORAGE_KEY = "ai-motion-studio-project-v1";
const loadProject = (): StudioProject => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as StudioProject;
  } catch { /* use starter project if saved data is invalid */ }
  return starterProject;
};

export default function App() {
  const [project, setProject] = useState<StudioProject>(loadProject);
  const [selectedId, setSelectedId] = useState("title-1");
  const [activeTool, setActiveTool] = useState("AI Tools");
  const [script, setScript] = useState("");
  const [notice, setNotice] = useState("");
  const selected = project.elements.find((item) => item.id === selectedId) ?? project.elements[0];
  const duration = project.durationInFrames / project.fps;
  const updateElement = (patch: Partial<EditableElement>) => {
    if (!selected) return;
    setProject((old) => ({ ...old, elements: old.elements.map((item) => item.id === selected.id ? { ...item, ...patch } : item) }));
  };
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); }, [project]);
  const timelineItems = useMemo(() => project.elements, [project.elements]);
  const addScene = () => {
    const n = project.scenes.length + 1;
    const start = project.scenes.reduce((max, s) => Math.max(max, s.startFrame + s.durationInFrames), 0);
    const scene = { id: `scene-${Date.now()}`, name: `Scene ${n}`, startFrame: start, durationInFrames: 135, elementIds: [] };
    setProject((p) => ({ ...p, scenes: [...p.scenes, scene], durationInFrames: Math.max(p.durationInFrames, start + 135) }));
    setNotice("New scene added");
  };
  const addText = () => {
    const id = `text-${Date.now()}`;
    const item: EditableElement = { id, kind: "text", name: "New title", text: "Edit this title", startFrame: 15, durationInFrames: 100, trackId: "track-text", fontSize: 64, color: "#ffffff", x: 960, y: 480, animation: "fade" };
    setProject((p) => ({ ...p, elements: [...p.elements, item] }));
    setSelectedId(id); setNotice("Text element added");
  };
  const exportProject = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "ai-motion-studio-project.json"; a.click(); URL.revokeObjectURL(url);
    setNotice("Editable project JSON downloaded");
  };
  const saveProject = () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); setNotice("Project saved in this browser"); };
  const importProject = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as StudioProject;
        if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.elements) || !Array.isArray(parsed.scenes)) throw new Error("Invalid project");
        setProject(parsed); setSelectedId(parsed.elements[0]?.id ?? ""); setNotice("Project loaded");
      } catch { setNotice("Could not load this project file"); }
    };
    reader.readAsText(file);
  };
  const tools = ["AI Tools", "Media", "Audio", "Text", "Effects"];
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✦</span> AI Motion Studio <span className="beta">BETA</span></div>
      <div className="project-title">{project.title} <span>⌄</span></div>
      <div className="top-actions"><button className="soft" onClick={saveProject}>Save</button><label className="soft file-button">Open<input type="file" accept=".json,application/json" onChange={(e) => importProject(e.target.files?.[0])} /></label><button className="export" onClick={exportProject}>Export project</button></div>
    </header>
    <main className="workspace">
      <aside className="left-panel">
        <nav className="tool-tabs">{tools.map((tool, i) => <button key={tool} className={activeTool === tool ? "tool-tab active" : "tool-tab"} onClick={() => setActiveTool(tool)}><span>{["✧","▧","♫","T","◈"][i]}</span><small>{tool}</small></button>)}</nav>
        <section className="tool-content"><div className="section-heading">{activeTool}</div>
          {activeTool === "AI Tools" ? <><div className="feature-card"><b>✦ AI Video Assistant</b><p>Prepare an editable storyboard from your idea.</p></div><label className="field-label">Script or idea</label><textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder="Paste your script or describe your video..." /><button className="gold full" onClick={() => setNotice(script.trim() ? "Script saved as a brief. AI generation is not connected yet." : "Write an idea first.")}>Prepare storyboard →</button><button className="dark full" onClick={addScene}>＋ Add scene</button></> :
          <><div className="feature-card"><b>{activeTool} library</b><p>{activeTool === "Media" ? "Uploaded videos and images will be listed here." : activeTool === "Audio" ? "Voiceover, music and sound effects will be managed here." : activeTool === "Text" ? "Add editable titles and captions." : "Transitions and motion presets will appear here."}</p></div><button className="dark full" onClick={activeTool === "Text" ? addText : () => setNotice(`${activeTool} import is planned for the next build.`)}>＋ {activeTool === "Text" ? "Add text" : `Add ${activeTool.toLowerCase()}`}</button></>}
          <p className="small-note">Keep each project element independently editable.</p>
        </section>
      </aside>
      <section className="center-panel">
        <div className="preview-header"><b>Preview</b><span>16:9 · {project.fps} FPS</span></div>
        <div className="preview-wrap"><div className="player-frame"><Player component={VideoComposition} inputProps={{ project }} durationInFrames={project.durationInFrames} compositionWidth={project.width} compositionHeight={project.height} fps={project.fps} style={{ width: "100%" }} controls /></div></div>
        <div className="preview-footer"><span>Live composition preview</span><span>{project.width} × {project.height}</span></div>
      </section>
      <aside className="right-panel">
        <div className="section-heading">Properties</div>
        <div className="selected-row"><i />{selected?.name ?? "No element selected"}</div>
        {selected ? <div className="property-content">
          <div className="group-title">Content</div><label className="field-label">Element name</label><input value={selected.name} onChange={(e) => updateElement({ name: e.target.value })} />
          {(selected.kind === "text" || selected.kind === "caption") && <><label className="field-label">Text</label><textarea value={selected.text ?? ""} onChange={(e) => updateElement({ text: e.target.value })} /><div className="two-col"><div><label className="field-label">Font size</label><input type="number" min="12" max="160" value={selected.fontSize ?? 48} onChange={(e) => updateElement({ fontSize: Number(e.target.value) })} /></div><div><label className="field-label">Color</label><input className="color-input" type="color" value={selected.color ?? "#ffffff"} onChange={(e) => updateElement({ color: e.target.value })} /></div></div></>}
          <div className="group-title separated">Timing</div><div className="two-col"><div><label className="field-label">Start frame</label><input type="number" value={selected.startFrame} onChange={(e) => updateElement({ startFrame: Math.max(0, Number(e.target.value)) })} /></div><div><label className="field-label">Duration</label><input type="number" value={selected.durationInFrames} onChange={(e) => updateElement({ durationInFrames: Math.max(1, Number(e.target.value)) })} /></div></div>
          <div className="group-title separated">Animation</div><label className="field-label">Entrance</label><select value={selected.animation ?? "none"} onChange={(e) => updateElement({ animation: e.target.value as EditableElement["animation"] })}><option value="fade">Fade in</option><option value="slide-up">Slide up</option><option value="zoom">Zoom in</option><option value="none">None</option></select>
          <button className="dark full delete" onClick={() => { setProject((p) => ({ ...p, elements: p.elements.filter((el) => el.id !== selected.id) })); setSelectedId(""); }}>Delete element</button>
        </div> : <p className="small-note">Select a timeline item to edit its properties.</p>}
      </aside>
    </main>
    <section className="timeline-panel">
      <div className="timeline-top"><div><b>Timeline</b><span> · {duration.toFixed(1)} sec</span></div><div className="timeline-buttons"><button className="dark" onClick={addText}>＋ Text</button><button className="dark" onClick={addScene}>＋ Scene</button></div></div>
      <div className="ruler"><span>00:00</span><span>00:03</span><span>00:06</span><span>00:09</span><span>00:12</span><span>00:15</span><span>00:18</span></div>
      {project.tracks.map((track) => <div className="track-row" key={track.id}><div className="track-label">{track.name}</div><div className="track-lane">{timelineItems.filter((item) => item.trackId === track.id).map((item) => <button key={item.id} className={`clip ${item.kind} ${selectedId === item.id ? "selected" : ""}`} style={{ left: `${(item.startFrame / project.durationInFrames) * 100}%`, width: `${Math.max(7, (item.durationInFrames / project.durationInFrames) * 100)}%` }} onClick={() => setSelectedId(item.id)}>{item.name}</button>)}</div></div>)}
      <div className="timeline-bottom"><span>Tip: Select any clip to edit it in Properties.</span><span>Auto-save enabled</span></div>
    </section>
    {notice && <button className="notice" onClick={() => setNotice("")}>{notice}　×</button>}
  </div>;
}