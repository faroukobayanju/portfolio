import { useEffect, useRef, useState } from "react";
import { DEFAULT_DATA, getData, loadData, makeId, persistData } from "./content-store.js";
import "../admin.css";

const definitions = {
  work: {
    title: "selected work", description: "portfolio cards and filter categories.", newLabel: "new work item", saveLabel: "save work item",
    fields: [
      ["title", "title", "text", true], ["category", "category", "select", true, ["social", "coding", "data", "writing"]], ["type", "small label", "text", true], ["link", "link"],
      ["description", "description", "textarea", true, null, "span-all"], ["cta", "link text"], ["tags", "tags"], ["metrics", "metrics (comma separated)"], ["image", "image path or url"],
      ["imageFile", "choose a new image", "file", false, null, "span-all"], ["imageAlt", "image alt text"], ["art", "text-card style", "select", false, ["warm", "ink", "lined", "brand"]], ["artCopy", "text-card copy", "textarea", false, null, "span-all"], ["note", "small source note", "text", false, null, "span-all"]
    ]
  },
  experience: {
    title: "experience", description: "roles shown inside the paper timeline.", newLabel: "new role", saveLabel: "save experience",
    fields: [["role", "role", "text", true], ["company", "company or client", "text", true], ["period", "period", "text", true], ["summary", "summary", "textarea", true, null, "span-all"], ["details", "details — one point per line", "textarea", false, null, "span-all"]]
  }
};

function ArrowUpRight() {
  return <svg className="inline-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>;
}

async function imageToDataUrl(file) {
  if (!file) return "";
  if (!file.type.startsWith("image/")) throw new Error("choose an image file.");
  const source = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("the image could not be read.")); reader.readAsDataURL(file); });
  const image = await new Promise((resolve, reject) => { const element = new Image(); element.onload = () => resolve(element); element.onerror = () => reject(new Error("the image could not be decoded.")); element.src = source; });
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas"); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale); canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", .82);
}

function Field({ field, value }) {
  const [name, label, type = "text", required = false, options, className = ""] = field;
  return <label className={className}>{label}
    {type === "textarea" ? <textarea name={name} required={required} rows={name === "details" ? 6 : 4} defaultValue={value || ""} /> : type === "select" ? <select name={name} required={required} defaultValue={value || options[0]}>{options.map((option) => <option value={option} key={option}>{option === "coding" ? "vibecoding" : option}</option>)}</select> : <input name={name} type={type} required={required} accept={type === "file" ? "image/*" : undefined} defaultValue={type === "file" ? undefined : value || ""} />}
    {type === "file" ? <small>optional. large images are resized before saving.</small> : null}
  </label>;
}

function CrudPanel({ section, items, onSave, onRemove }) {
  const definition = definitions[section];
  const [editing, setEditing] = useState(null);
  const formRef = useRef(null);
  const name = (item) => section === "experience" ? item.role : item.title;
  const meta = (item) => section === "work" ? `${item.category || ""} · ${item.type || ""}` : section === "experience" ? `${item.company || ""} · ${item.period || ""}` : item.description;
  const clear = () => { setEditing(null); formRef.current?.reset(); };
  const edit = (item) => { setEditing(item); requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); };
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const file = form.elements.imageFile?.files[0]; delete values.imageFile;
    Object.keys(values).forEach((key) => { if (typeof values[key] === "string") values[key] = values[key].trim(); });
    if (section === "work") values.metrics = values.metrics ? values.metrics.split(",").map((item) => item.trim()).filter(Boolean) : [];
    if (file) values.image = await imageToDataUrl(file); else if (!values.image && editing?.image) values.image = editing.image;
    values.id = editing?.id || makeId(section);
    if (await onSave(section, values)) clear();
  };
  return <section className="admin-panel"><div className="panel-head"><div><h2>{definition.title}</h2><p>{definition.description}</p></div><button className="new-button" type="button" onClick={clear}>{definition.newLabel}</button></div><div className="admin-layout">
    <form ref={formRef} onSubmit={submit} key={editing?.id || "new"}><div className="form-grid">{definition.fields.map((field) => <Field key={field[0]} field={field} value={editing?.[field[0]] ? (Array.isArray(editing[field[0]]) ? editing[field[0]].join(", ") : editing[field[0]]) : ""} />)}</div><div className="form-actions"><button className="save-button" type="submit">{editing ? `update ${definition.title}` : definition.saveLabel}</button><button className="cancel-button" type="button" onClick={clear}>clear form</button></div></form>
    <div className="entry-list">{items.length ? items.map((item) => <article className="entry" key={item.id}><div><h3>{name(item)}</h3><p>{meta(item)}</p></div><div className="entry-actions"><button type="button" onClick={() => edit(item)}>edit</button><button type="button" className="remove" onClick={() => onRemove(section, item.id)}>remove</button></div></article>) : <p>nothing here yet. add the first item with the form.</p>}</div>
  </div></section>;
}

function AboutPanel({ about, onSave }) {
  const [draft, setDraft] = useState(about);
  const formRef = useRef(null);
  useEffect(() => setDraft(about), [about]);
  const change = (event) => setDraft((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    const file = event.currentTarget.elements.photoFile.files[0];
    const next = { ...draft, bullets: String(draft.bulletsText ?? draft.bullets.join("\n")).split("\n").map((line) => line.trim()).filter(Boolean) };
    delete next.bulletsText;
    if (file) next.photo = await imageToDataUrl(file);
    if (await onSave(next)) {
      setDraft(next);
      if (formRef.current?.elements.photoFile) formRef.current.elements.photoFile.value = "";
    }
  };
  const bulletsValue = draft.bulletsText ?? draft.bullets.join("\n");
  return <section className="admin-panel"><div className="panel-head"><div><h2>about</h2><p>the name, positioning, note, and portrait at the top of your portfolio.</p></div></div><div className="about-layout">
    <form ref={formRef} onSubmit={submit}><div className="form-grid"><label>name<input name="name" required value={draft.name} onChange={change} /></label><label>role line<input name="role" required value={draft.role} onChange={change} /></label><label className="span-all">opening phrase<input name="intro" value={draft.intro} onChange={change} /></label><label className="span-all">bold opening statement<textarea name="introStrong" rows="3" required value={draft.introStrong} onChange={change} /></label><label className="span-all">bullet points — one per line<textarea name="bulletsText" rows="8" required value={bulletsValue} onChange={change} /></label><label className="span-all">closing line<input name="signature" required value={draft.signature} onChange={change} /></label><label>portrait path or url<input name="photo" required value={draft.photo} onChange={change} /></label><label>portrait alt text<input name="photoAlt" required value={draft.photoAlt} onChange={change} /></label><label className="span-all">choose a new portrait<input name="photoFile" type="file" accept="image/*" /><small>optional. the image is resized and saved with the hosted content.</small></label></div><div className="form-actions"><button className="save-button" type="submit">save about page</button></div></form>
    <aside className="about-preview"><img src={draft.photo} alt="" /><p className="handwritten">portrait preview</p></aside>
  </div></section>;
}

export default function Admin() {
  const [data, setData] = useState(getData);
  const [tab, setTab] = useState("about");
  const [toast, setToast] = useState("");
  const [password, setPassword] = useState(() => sessionStorage.getItem("farouk-admin-password") || "");
  useEffect(() => { loadData().then(setData); }, []);
  useEffect(() => { if (password) sessionStorage.setItem("farouk-admin-password", password); else sessionStorage.removeItem("farouk-admin-password"); }, [password]);
  const flash = (message) => { setToast(message); window.setTimeout(() => setToast(""), 3500); };
  const commit = async (next, message) => {
    try { const saved = await persistData(next, password); setData(saved); flash(message); return true; }
    catch (error) { flash(error.message); return false; }
  };
  const saveAbout = (about) => commit({ ...data, about }, "about page published.");
  const saveItem = (section, item) => { const items = [...data[section]]; const index = items.findIndex((entry) => entry.id === item.id); if (index >= 0) items[index] = item; else items.push(item); return commit({ ...data, [section]: items }, `${section} published.`); };
  const removeItem = (section, id) => commit({ ...data, [section]: data[section].filter((item) => item.id !== id) }, "item removed from the public portfolio.");
  const exportJson = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "farouk-portfolio-content.json"; link.click(); URL.revokeObjectURL(url); flash("portfolio json exported."); };
  const loadJson = async (event) => { const file = event.target.files[0]; if (!file) return; try { await commit(JSON.parse(await file.text()), "portfolio data imported and published."); } catch (error) { flash(error.message); } event.target.value = ""; };
  const restore = () => commit(DEFAULT_DATA, "defaults restored and published.");
  return <><header className="admin-header"><div><p className="handwritten">the control room</p><h1>portfolio admin</h1><p>edit the public page without touching the code.</p></div><a className="preview-link" href="index.html">view portfolio <ArrowUpRight /></a></header><aside className="storage-note"><div><strong>changes publish to the live portfolio.</strong><span> enter the private admin password before saving, importing, removing, or restoring content.</span></div><label className="admin-password">admin password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="enter password" /></label></aside><main className="admin-main"><nav className="admin-tabs" aria-label="admin sections">{[["about", "about"], ["work", "selected work"], ["experience", "experience"]].map(([id, label]) => <button type="button" key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{label}</button>)}</nav>{tab === "about" ? <AboutPanel about={data.about} onSave={saveAbout} /> : <CrudPanel section={tab} items={data[tab]} onSave={saveItem} onRemove={removeItem} />}</main><footer className="admin-tools"><div><strong>backup & restore</strong><p>download your entries as json or bring a previous export back.</p></div><div className="tool-actions"><button type="button" onClick={exportJson}>export json</button><label className="import-label">import json<input type="file" accept="application/json" onChange={loadJson} /></label><button type="button" onClick={restore}>restore defaults</button></div></footer>{toast ? <div className="toast" role="status" aria-live="polite"><span>{toast}</span></div> : null}</>;
}
