import { useEffect, useMemo, useState } from "react";
import { getData, loadData } from "./content-store.js";
import "../scrapbook.css";

const filters = ["all", "social", "coding", "data", "writing"];
const symbols = ["◎", "✎", "⌁", "↗"];

function safeHref(value = "") {
  const href = String(value).trim();
  if (!href) return "#";
  return /^(https?:|mailto:|#|\/|data:image\/)/i.test(href) || /^[\w.-]+\.(png|jpe?g|webp|gif|svg)$/i.test(href) ? href : "#";
}

function externalProps(href = "") {
  return /^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function Art({ item }) {
  return <div className={`card-art card-art--${item.art || "warm"}`} aria-hidden="true">
    <span className="small-note">{item.type || "selected work"}</span>
    <span className="art-title">{item.artCopy || item.title}</span>
    <span className="art-scribble handwritten">made by farouk ↗</span>
  </div>;
}

function WorkCard({ item, index }) {
  const href = safeHref(item.link);
  return <article className={`work-card ${index % 3 === 0 ? "clipped" : "pin"}`} data-category={item.category}>
    {item.image ? <a className="image-link" href={href} {...externalProps(item.link)} aria-label={item.cta || "view work"}><img src={safeHref(item.image)} width="1200" height="675" alt={item.imageAlt || item.title} loading="lazy" /></a> : <Art item={item} />}
    <div className="card-content"><p className="handwritten category">{item.type}</p><h3>{item.title}</h3><p>{item.description}</p>
      {item.metrics?.length ? <div className="metric-pair">{item.metrics.map((metric) => { const [value, ...label] = String(metric).trim().split(/\s+/); return <div key={metric}><strong>{value}</strong><span>{label.join(" ")}</span></div>; })}</div> : null}
      {item.tags ? <p className="work-tags">{item.tags}</p> : null}{item.note ? <p className="source-note">{item.note}</p> : null}
      {item.link ? <a className="text-link" href={href} {...externalProps(item.link)}>{item.cta || "view work"} <span aria-hidden="true">↗</span></a> : null}
    </div>
  </article>;
}

function ExperienceItem({ item, index }) {
  const details = String(item.details || "").split("\n").filter(Boolean);
  return <article className="timeline-item"><span className="timeline-icon" aria-hidden="true">{symbols[index % symbols.length]}</span><div><h3>{item.role}</h3><p className="company">{item.company} <span>{item.period}</span></p><p>{item.summary}</p>{details.length ? <details><summary>more about the work</summary>{details.length > 1 ? <ul>{details.map((line) => <li key={line}>{line}</li>)}</ul> : <p>{details[0]}</p>}</details> : null}</div></article>;
}

function ProjectCard({ item }) {
  return <article className="side-card paper pin">{item.image ? <img src={safeHref(item.image)} width="1200" height="675" loading="lazy" alt={item.imageAlt || item.title} /> : <div className="project-placeholder handwritten" aria-hidden="true">{item.title}</div>}<div><h3>{item.title}</h3><p>{item.description}</p>{item.link ? <a className="text-link" href={safeHref(item.link)} {...externalProps(item.link)}>{item.cta || "view project"} ↗</a> : null}</div></article>;
}

export default function App() {
  const [data, setData] = useState(getData);
  const [filter, setFilter] = useState("all");
  const visibleWork = useMemo(() => filter === "all" ? data.work : data.work.filter((item) => item.category === filter), [data.work, filter]);

  useEffect(() => {
    loadData().then(setData);
    const refresh = () => setData(getData());
    window.addEventListener("storage", refresh);
    window.addEventListener("portfolio-content-updated", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("portfolio-content-updated", refresh); };
  }, []);

  return <>
    <a className="skip-link" href="#about">skip to content</a><div className="draft-lines" aria-hidden="true" />
    <nav className="nav-pill" aria-label="main navigation"><a href="#about" aria-current="location">about</a><a href="#work">work</a><a href="#experience">experience</a><a href="#projects" className="nav-extra">projects</a><a href="#connect" className="nav-contact">connect <span aria-hidden="true">↗</span></a></nav>
    <main className="board">
      <section id="about" className="intro"><figure className="portrait pin"><img src={safeHref(data.about.photo)} width="1189" height="1280" alt={data.about.photoAlt || data.about.name} /></figure><div className="intro-content">
        <div className="intro-top"><h1>{data.about.name}<span className="accent">.</span></h1><div className="socials"><a href="https://x.com/faroukobayanju" target="_blank" rel="noopener noreferrer" aria-label="farouk obayanju on x">𝕏</a><a href="https://t.me/faroukobayanju" target="_blank" rel="noopener noreferrer" aria-label="message farouk obayanju on telegram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 18-7-4 18-6-6-4 3 1-7 9-5-6 8z" /></svg></a><a href="mailto:obayanjuadeshina571@gmail.com" aria-label="email farouk obayanju"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 7 9-7" /></svg></a></div></div>
        <p className="handwritten role">{data.about.role}</p><div className="intro-note"><p>{data.about.intro} <strong>{data.about.introStrong}</strong></p><ul>{data.about.bullets.map((bullet, index) => <li key={`${index}-${bullet}`}>{bullet}</li>)}</ul><span className="note-signature handwritten">{data.about.signature}</span></div>
        <div className="bring paper taped"><p className="bring-heading">what i do <span className="handwritten">three lanes, plenty of crossovers</span></p><div className="bring-grid"><div><span className="mini-symbol" aria-hidden="true">⌘</span><strong>vibecoding</strong><p>ideas into working prototypes</p></div><div><span className="mini-symbol" aria-hidden="true">⌁</span><strong>data analysis</strong><p>the story under the chart</p></div><div><span className="mini-symbol" aria-hidden="true">✎</span><strong>social media</strong><p>voice, content, and community</p></div><div><span className="mini-symbol" aria-hidden="true">◎</span><strong>web3 research</strong><p>context before conclusions</p></div></div></div>
      </div></section>
      <section id="work" className="work-section"><div className="section-heading"><h2>selected work <span className="handwritten">from the browser tabs</span></h2><span className="round-stamp" aria-hidden="true">✎</span></div><p className="section-lede">things i’ve written, measured, and put into the world.</p><div className="filters" role="group" aria-label="filter selected work">{filters.map((name) => <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>{name === "coding" ? "vibecoding" : name === "all" ? "everything" : name}</button>)}</div><p className="sr-only" role="status">{visibleWork.length} work samples shown.</p><div className="work-grid" aria-live="polite">{visibleWork.map((item, index) => <WorkCard key={item.id} item={item} index={index} />)}</div></section>
      <section id="experience" className="experience paper taped"><div className="section-heading"><h2>experience <span className="handwritten">& the road so far</span></h2></div><div className="timeline">{data.experience.map((item, index) => <ExperienceItem key={item.id} item={item} index={index} />)}</div><div className="experience-bottom"><div><h3>education</h3><p><strong>b.tech in information systems</strong></p><p>federal university of technology, akure<br />2023 – present</p></div><div><h3>a little recognition</h3><p><strong>rova writing contest</strong></p><p>multiple-time winner</p><p className="handwritten award-note">a good story travels.</p></div></div></section>
      <section id="toolkit" className="toolkit"><div className="section-heading"><h2>behind the work <span className="handwritten">what ends up open on my laptop</span></h2></div><div className="toolkit-layout"><div className="toolkit-note"><p className="handwritten">make the thing.<br />check the numbers.<br />find the sentence.<br />repeat.</p><span aria-hidden="true">↗</span></div><div className="toolkit-list"><div><h3>build</h3><p>rapid prototyping · application development · api experiments · sei network</p></div><div><h3>analyse</h3><p>dune analytics · sql · excel · tableau · power bi · ecosystem mapping</p></div><div><h3>communicate</h3><p>social strategy · thread writing · ghostwriting · brand positioning · community engagement</p></div><div><h3>keep learning</h3><p>statistics · data science · product thinking · onchain research</p></div></div></div></section>
      <section id="projects" className="side-projects"><div className="section-heading"><h2>off the clock <span className="handwritten">still building things</span></h2></div><div className="side-grid">{data.projects.map((item) => <ProjectCard key={item.id} item={item} />)}</div></section>
      <footer id="connect" className="connect"><p className="handwritten">got a messy idea, a quiet brand, or a stubborn dataset?</p><h2>let’s make it useful.</h2><p>social media, data work, or a prototype that needs to exist.<br />tell me what you’re working on.</p><div className="contact-actions"><a className="contact-button" href="https://t.me/faroukobayanju" target="_blank" rel="noopener noreferrer">message on telegram ↗</a><a className="email-link" href="mailto:obayanjuadeshina571@gmail.com">send an email ↗</a></div></footer>
    </main>
  </>;
}
