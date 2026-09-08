import { useEffect, useMemo, useState } from "react";
import { getData, loadData } from "./content-store.js";
import "../scrapbook.css";

const filters = ["all", "social", "coding", "data", "writing"];
function ArrowUpRight() {
  return <svg className="inline-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>;
}

function ArrowLeft() {
  return <svg className="inline-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6M9 12h10" /></svg>;
}

function safeHref(value = "") {
  const href = String(value).trim();
  if (!href) return "#";
  return /^(https?:|mailto:|#|\/|data:image\/)/i.test(href) || /^[\w./-]+\.html(?:#[\w-]+)?$/i.test(href) || /^[\w.-]+\.(png|jpe?g|webp|gif|svg)$/i.test(href) ? href : "#";
}

function externalProps(href = "") {
  return /^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function Art({ item }) {
  return <div className={`card-art card-art--${item.art || "warm"}`} aria-hidden="true">
    <span className="small-note">{item.type || "selected work"}</span>
    <span className="art-title">{item.artCopy || item.title}</span>
    <span className="art-scribble handwritten">made by farouk</span>
  </div>;
}

function WorkCard({ item, index, linkHomeHashes = false }) {
  const itemLink = linkHomeHashes && String(item.link || "").startsWith("#") ? `index.html${item.link}` : item.link;
  const href = safeHref(itemLink);
  return <article className={`work-card ${index % 3 === 0 ? "clipped" : "pin"}`} data-category={item.category}>
    {item.image ? <a className="image-link" href={href} {...externalProps(itemLink)} aria-label={item.cta || "view work"}><img src={safeHref(item.image)} width="1200" height="675" alt={item.imageAlt || item.title} loading="lazy" /></a> : <Art item={item} />}
    <div className="card-content"><p className="handwritten category">{item.type}</p><h3>{item.title}</h3><p>{item.description}</p>
      {item.metrics?.length ? <div className="metric-pair">{item.metrics.map((metric) => { const [value, ...label] = String(metric).trim().split(/\s+/); return <div key={metric}><strong>{value}</strong><span>{label.join(" ")}</span></div>; })}</div> : null}
      {item.tags ? <p className="work-tags">{item.tags}</p> : null}{item.note ? <p className="source-note">{item.note}</p> : null}
      {item.link ? <a className="text-link" href={href} {...externalProps(itemLink)}>{item.cta || "view work"} <ArrowUpRight /></a> : null}
    </div>
  </article>;
}

function RoleIcon({ role = "" }) {
  const name = role.toLowerCase();
  if (name.includes("social")) return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4M7 9v6l10 4V5L7 9ZM9 15l1 5h3l-1-4" /><path d="M19 9c1 1 1 5 0 6" /></svg>;
  if (name.includes("data") || name.includes("analyst")) return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16" /><path d="m7 15 4-4 3 2 5-6" /><circle cx="7" cy="15" r="1" /><circle cx="11" cy="11" r="1" /><circle cx="14" cy="13" r="1" /><circle cx="19" cy="7" r="1" /></svg>;
  if (name.includes("writer") || name.includes("writing")) return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /><path d="m13.5 8 3 3M5.5 16l3 3" /></svg>;
  if (name.includes("developer") || name.includes("engineer")) return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" /></svg>;
}

function ExperienceItem({ item }) {
  const details = String(item.details || "").split("\n").filter(Boolean);
  return <article className="timeline-item"><span className="timeline-icon"><RoleIcon role={item.role} /></span><div><h3>{item.role}</h3><p className="company">{item.company} <span>{item.period}</span></p><p>{item.summary}</p>{details.length ? <details><summary>more about the work</summary>{details.length > 1 ? <ul>{details.map((line) => <li key={line}>{line}</li>)}</ul> : <p>{details[0]}</p>}</details> : null}</div></article>;
}

function usePortfolioData() {
  const [data, setData] = useState(getData);
  useEffect(() => {
    loadData().then(setData);
    const refresh = () => setData(getData());
    window.addEventListener("storage", refresh);
    window.addEventListener("portfolio-content-updated", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("portfolio-content-updated", refresh); };
  }, []);
  return data;
}

function WorkArchive({ data }) {
  const [filter, setFilter] = useState("all");
  const visibleWork = useMemo(() => filter === "all" ? data.work : data.work.filter((item) => item.category === filter), [data.work, filter]);
  return <>
    <a className="skip-link" href="#all-work">skip to all work</a><div className="draft-lines" aria-hidden="true" />
    <nav className="nav-pill" aria-label="main navigation"><a href="index.html">home</a><a href="#all-work" aria-current="location">work</a><a href="index.html#experience">experience</a><a href="index.html#connect" className="nav-contact">connect <ArrowUpRight /></a></nav>
    <main className="board archive-board">
      <header className="archive-intro"><a className="archive-back" href="index.html"><ArrowLeft /> back home</a><p className="handwritten">the complete pinboard</p><h1>all the work<span className="accent">.</span></h1><p>social systems, writing, data investigations, and things i built because the idea would not leave me alone.</p></header>
      <section id="all-work" className="work-section archive-work"><div className="section-heading"><h2>browse the archive <span className="handwritten">pick a lane or see everything</span></h2><span className="round-stamp" aria-hidden="true">✎</span></div><div className="filters" role="group" aria-label="filter all work">{filters.map((name) => <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>{name === "coding" ? "vibecoding" : name === "all" ? "everything" : name}</button>)}</div><p className="sr-only" role="status">{visibleWork.length} work samples shown.</p><div className="work-grid" aria-live="polite">{visibleWork.map((item, index) => <WorkCard key={item.id} item={item} index={index} linkHomeHashes />)}</div></section>
      <footer className="archive-footer"><a href="index.html"><ArrowLeft /> return to the portfolio</a><a href="mailto:obayanjuadeshina571@gmail.com">talk about a project <ArrowUpRight /></a></footer>
    </main>
  </>;
}

export default function App() {
  const data = usePortfolioData();
  const [filter, setFilter] = useState("all");
  const filteredWork = useMemo(() => filter === "all" ? data.work : data.work.filter((item) => item.category === filter), [data.work, filter]);
  const visibleWork = filteredWork.slice(0, 6);

  if (window.location.pathname.endsWith("work.html")) return <WorkArchive data={data} />;

  return <>
    <a className="skip-link" href="#about">skip to content</a><div className="draft-lines" aria-hidden="true" />
    <nav className="nav-pill" aria-label="main navigation"><a href="#about" aria-current="location">about</a><a href="#work">work</a><a href="#experience">experience</a><a href="#connect" className="nav-contact">connect <ArrowUpRight /></a></nav>
    <main className="board">
      <section id="about" className="intro"><figure className="portrait pin"><img src={safeHref(data.about.photo)} width="1189" height="1280" alt={data.about.photoAlt || data.about.name} /></figure><div className="intro-content">
        <div className="intro-top"><h1>{data.about.name}<span className="accent">.</span></h1><div className="socials"><a href="https://x.com/faroukobayanju" target="_blank" rel="noopener noreferrer" aria-label="farouk obayanju on x">𝕏</a><a href="https://t.me/faroukobayanju" target="_blank" rel="noopener noreferrer" aria-label="message farouk obayanju on telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 18-7-4 18-6-6-4 3 1-7 9-5-6 8z" /></svg></a><a href="mailto:obayanjuadeshina571@gmail.com" aria-label="email farouk obayanju"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 7 9-7" /></svg></a></div></div>
        <p className="handwritten role">{data.about.role}</p><div className="intro-note"><p>{data.about.intro} <strong>{data.about.introStrong}</strong></p><ul>{data.about.bullets.map((bullet, index) => <li key={`${index}-${bullet}`}>{bullet}</li>)}</ul><span className="note-signature handwritten">{data.about.signature}</span></div>
        <div className="bring paper taped"><p className="bring-heading">what i do <span className="handwritten">different skills. same internet.</span></p><div className="bring-grid"><div><span className="mini-symbol"><RoleIcon role="social media" /></span><strong>social media</strong><p>content people actually want to read</p></div><div><span className="mini-symbol"><RoleIcon role="data & onchain analyst" /></span><strong>data & onchain analysis</strong><p>finding what the numbers are actually saying</p></div><div><span className="mini-symbol"><RoleIcon role="writer" /></span><strong>writing</strong><p>research, ideas, and clear words</p></div><div><span className="mini-symbol"><RoleIcon role="developer" /></span><strong>building</strong><p>turning random ideas into working things</p></div></div></div>
      </div></section>
      <section id="work" className="work-section"><div className="section-heading"><h2>selected work <span className="handwritten">from the browser tabs</span></h2><span className="round-stamp" aria-hidden="true">✎</span></div><p className="section-lede">things i’ve written, measured, and put into the world.</p><div className="filters" role="group" aria-label="filter selected work">{filters.map((name) => <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>{name === "coding" ? "vibecoding" : name === "all" ? "everything" : name}</button>)}</div><p className="sr-only" role="status">{visibleWork.length} of {filteredWork.length} work samples shown.</p><div className="work-grid" aria-live="polite">{visibleWork.map((item, index) => <WorkCard key={item.id} item={item} index={index} />)}</div>{data.work.length > 6 ? <div className="work-reveal"><a className="reveal-button" href="work.html">see more <ArrowUpRight /></a></div> : null}</section>
      <section id="experience" className="experience paper taped"><div className="section-heading"><h2>experience <span className="handwritten">& the road so far</span></h2></div><div className="timeline">{data.experience.map((item) => <ExperienceItem key={item.id} item={item} />)}</div><div className="experience-bottom"><div><h3>education</h3><p><strong>b.tech in information systems</strong></p><p>federal university of technology, akure<br />2023 – 2026</p></div><div><h3>a little recognition</h3><p><strong>rova writing contest</strong></p><p>multiple-time winner</p><p className="handwritten award-note">a good story travels.</p></div></div></section>
      <section id="toolkit" className="toolkit"><div className="section-heading"><h2>behind the work <span className="handwritten">the stuff i actually spend my time doing</span></h2></div><div className="toolkit-layout"><div className="toolkit-note"><p className="handwritten">read too much.<br />find something interesting.<br />make something from it.<br />put it on the internet.</p></div><div className="toolkit-list"><div><h3>manage</h3><p>social strategy · content · community · brand positioning</p></div><div><h3>analyse</h3><p>dune analytics · sql · excel · power bi · onchain data · ecosystem research</p></div><div><h3>write</h3><p>threads · articles · research-led content · founder content · storytelling</p></div><div><h3>build for fun</h3><p>rapid prototypes · web apps · apis · whatever idea is stuck in my head</p></div></div></div></section>
      <footer id="connect" className="connect"><p className="handwritten">got a messy idea, a quiet brand, or a stubborn dataset?</p><h2>let’s make it useful.</h2><p>social media, data work, or a prototype that needs to exist.<br />tell me what you’re working on.</p><div className="contact-actions"><a className="contact-button" href="https://t.me/faroukobayanju" target="_blank" rel="noopener noreferrer">message on telegram <ArrowUpRight /></a><a className="email-link" href="mailto:obayanjuadeshina571@gmail.com">send an email <ArrowUpRight /></a></div></footer>
    </main>
  </>;
}
