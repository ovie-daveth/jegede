"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Play,
  Download,
  FileText,
  Layers,
  MoveUpRight,
  Mail,
  MapPin,
  X,
  Box,
  Maximize2,
} from "lucide-react";
export type Asset = { id: string; name: string; mime: string; size: number };
export type Project = {
  id: string;
  title: string;
  year: string;
  tools: string;
  category: string;
  description: string;
  published: boolean;
  assets: Asset[];
};
export function Blueprint({ small = false }: { small?: boolean }) {
  return (
    <svg
      viewBox="0 0 600 400"
      aria-label="Illustrative engineering line drawing, not a project render"
      className={"blueprint " + (small ? "small" : "")}
    >
      <defs>
        <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path
            d="M25 0H0V25"
            fill="none"
            stroke="currentColor"
            strokeWidth=".4"
            opacity=".25"
          />
        </pattern>
      </defs>
      <rect width="600" height="400" fill="url(#grid)" />
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M95 270l230 80 190-110-230-80Z M95 270v-40l230 80 190-110v40 M325 310v40" />
        <path d="M145 244v-110c0-23 78-23 78 0v110 M145 134c0 25 78 25 78 0 M145 244c0 25 78 25 78 0 M161 130v-18l20-12 27 9v20 M183 100V73h100v49" />
        <path d="M270 280V160c0-22 70-22 70 0v120 M270 160c0 23 70 23 70 0 M270 280c0 23 70 23 70 0 M306 141v-28h102v90 M390 210v-36l55-31 31 10v37l-55 33Z M421 223v-37l55-33 M390 174l31 12 M230 214h25v33h15" />
        <path
          d="M80 310l230 80 M70 315l20-12 M300 397l20-12 M355 366l180-106 M349 358l12 17 M530 252l12 16"
          strokeDasharray="5 5"
        />
        <circle cx="184" cy="269" r="5" />
        <circle cx="305" cy="303" r="5" />
      </g>
      <g fill="currentColor" fontFamily="monospace" fontSize="10" opacity=".6">
        <text x="40" y="40">
          ENGINEERING / CONCEPT STUDY
        </text>
        <text x="40" y="370">
          ISOMETRIC VIEW
        </text>
        <text x="465" y="370">
          SCALE: NTS
        </text>
      </g>
    </svg>
  );
}
export function Media({ asset }: { asset: Asset }) {
  const src = "/api/media/" + asset.id;
  if (asset.mime.startsWith("video/"))
    return (
      <div className="media">
        <video controls playsInline preload="metadata" src={src} />
        <p className="mediahint">
          If this format does not play in your browser, download the original
          below. MP4 and WebM are recommended.
        </p>
      </div>
    );
  if (asset.mime.startsWith("image/"))
    return <img className="projectimage" src={src} alt={asset.name} />;
  if (asset.mime === "application/pdf")
    return <iframe title={asset.name} src={src} className="pdf" />;
  if (asset.mime.startsWith("audio/")) return <audio controls src={src} />;
  return (
    <div className="filepreview">
      <FileText size={40} />
      <h3>{asset.name}</h3>
      <p>Original engineering file. Download to view in compatible software.</p>
    </div>
  );
}
export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]),
    [filter, setFilter] = useState("All work"),
    [selected, setSelected] = useState<Project | null>(null),
    [active, setActive] = useState(0),
    [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/projects")
      .then(async (r) => {
        if (!r.ok) throw Error();
        const d: any = await r.json();
        setProjects(d.projects);
      })
      .catch(() =>
        setError(
          "The project gallery could not load. Please refresh to try again.",
        ),
      );
  }, []);
  useEffect(() => {
    if (!selected) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", listener);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", listener);
      document.body.style.overflow = old;
    };
  }, [selected]);
  const open = (p: Project) => {
    setActive(0);
    setSelected(p);
  };
  const visible = projects.filter(
    (p) => filter === "All work" || p.category === filter,
  );
  return (
    <>
      <header className="header">
        <a className="wordmark" href="#">
          <span className="monogram">
            MJ<span>·</span>
          </span>
          <span>
            MICHEAL JEGEDE<small>MECHANICAL ENGINEER</small>
          </span>
        </a>
        <nav>
          <a href="#work">Selected work</a>
          <a href="#about">About</a>
          <a href="#experience">Experience</a>
        </nav>
        <a href="https://www.linkedin.com/in/micheal-jegede-2119a9195" target="_blank" rel="noopener noreferrer" className="navcontact">
          Let’s connect <ArrowUpRight size={16} />
        </a>
      </header>
      <main>
        <section className="hero">
          <div className="herocopy">
            <p className="eyebrow">
              <span className="dot" /> MECHANICAL ENGINEER · LAGOS, NIGERIA
            </p>
            <h1>
              Precision in design.
              <br />
              <span>Purpose in every detail.</span>
            </h1>
            <p className="herodesc">
              I’m Micheal Oluwatobi Jegede. I bring mechanical engineering
              knowledge to CAD drafting, 3D modelling and practical project
              delivery.
            </p>
            <div className="heroactions">
              <a className="button" href="#work">
                Explore my work <ArrowRight size={18} />
              </a>
              <a className="textlink" href="mailto:michealjegede3@gmail.com">
                Get in touch <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="herobadges">
              <span>B.Eng Mechanical Engineering</span>
              <span>Graduate Member, NSE</span>
            </div>
          </div>
          <div className="herovisual">
            <div className="drawinglabel">
              <span>DESIGN THINKING, MADE VISIBLE</span>
              <Box size={18} />
            </div>
            <Blueprint />
            <div className="drawingfoot">
              <span>CAD / 2D + 3D</span>
              <span>ILLUSTRATIVE CONCEPT</span>
            </div>
          </div>
        </section>
        <div className="skillstrip">
          <span>
            AutoCAD <small>2D + 3D</small>
          </span>
          <span>SolidWorks</span>
          <span>Plant modelling</span>
          <span>Technical documentation</span>
        </div>
        <section id="work" className="section work">
          <div className="sectionhead">
            <div>
              <p className="eyebrow">01 / PORTFOLIO</p>
              <h2>Selected engineering work</h2>
            </div>
            <p>
              A closer look at the drawings, models
              <br />
              and thinking behind my work.
            </p>
          </div>
          <div className="filters">
            {[
              "All work",
              "3D modelling",
              "CAD drafting",
              "Plant design",
              "Engineering projects",
            ].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={filter === f ? "active" : ""}
              >
                {f}
              </button>
            ))}
          </div>
          {error && <p role="alert">{error}</p>}
          <div className="projectgrid">
            {visible.map((p, i) => {
              const cover = p.assets.find((a) => a.mime.startsWith("image/")),
                video = p.assets.find((a) => a.mime.startsWith("video/"));
              return (
                <button
                  className="projectcard"
                  key={p.id}
                  onClick={() => open(p)}
                >
                  <div className="cardvisual">
                    {cover ? (
                      <img src={"/api/media/" + cover.id} alt={p.title} />
                    ) : video ? (
                      <video
                        src={"/api/media/" + video.id}
                        preload="metadata"
                        muted
                        playsInline
                      />
                    ) : (
                      <Blueprint small />
                    )}
                    <span className="cardnumber">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="cardbadge">
                      {video ? (
                        <>
                          <Play size={12} /> VIDEO WALKTHROUGH
                        </>
                      ) : (
                        p.category
                      )}
                    </span>
                    <span className="cardarrow">
                      <ArrowUpRight size={22} />
                    </span>
                  </div>
                  <div className="cardbody">
                    <div className="cardmeta">
                      {p.category}
                      <span>{p.year}</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                    <span className="tooltag">{p.tools}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {projects.length === 0 && !error && (
            <div className="firstproject">
              <div className="firstdrawing">
                <Blueprint small />
                <span>Illustrative concept · project media to be added</span>
              </div>
              <div>
                <p className="eyebrow">PLANT MODELLING</p>
                <h3>AdBlue production plant</h3>
                <p>
                  I have modelled an AdBlue production plant. The design
                  walkthrough and supporting files will be added to this
                  portfolio.
                </p>
                <span className="subtle">
                  Project year and software details to be added.
                </span>
              </div>
            </div>
          )}
          {projects.length > 0 && visible.length === 0 && (
            <div className="empty">
              No published projects in this category yet. Explore another
              category.
            </div>
          )}
        </section>
        <section id="about" className="section about">
          <div>
            <p className="eyebrow">02 / ABOUT ME</p>
            <h2>
              Engineering knowledge.
              <br />
              <span>A practical perspective.</span>
            </h2>
            <p>
              I’m a mechanical engineering graduate of the University of Benin,
              with hands-on experience spanning CAD design, generator
              installation, commissioning and M&E project support.
            </p>
            <p>
              My approach combines careful technical documentation, analytical
              problem solving and a strong commitment to safety. I enjoy
              collaborating with teams to turn engineering ideas into clear,
              workable designs.
            </p>
            <a
              href="https://canva.link/vp88t6aap6t36z3"
              className="textlink"
              target="_blank"
              rel="noreferrer"
            >
              View my resume <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="capabilities">
            <h3>What I bring to a team</h3>
            {[
              [
                "01",
                "Drafting & modelling",
                "AutoCAD 2D and 3D, SolidWorks and plant modelling.",
              ],
              [
                "02",
                "Engineering delivery",
                "M&E coordination, generator installation and commissioning support.",
              ],
              [
                "03",
                "Technical clarity",
                "Single-line diagrams, BEME and progress and closeout reports.",
              ],
              [
                "04",
                "Safety-led thinking",
                "HSE Levels 1–3 and ISO 45001:2018 principles training.",
              ],
            ].map(([n, t, d]) => (
              <div className="capability" key={n}>
                <span>{n}</span>
                <div>
                  <h4>{t}</h4>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section id="experience" className="section">
          <div className="sectionhead">
            <div>
              <p className="eyebrow">03 / EXPERIENCE</p>
              <h2>Learning through real work.</h2>
            </div>
            <span className="subtle">Design. Collaborate. Deliver.</span>
          </div>
          <div className="timeline">
            {[
              [
                "August 2025",
                "Mechanical Engineer, Graduate Trainee",
                "ADVAD Limited · Ikeja, Lagos",
                "AutoCAD SLD design support for a hybrid solar power plant, 1,125 kVA MWM generator installation, load bank testing, energy audits and M&E project documentation.",
              ],
              [
                "2024 — 2025",
                "Physics Tutor · NYSC",
                "Ika Comprehensive Secondary School · Akwa Ibom",
                "Communicated technical concepts, supported laboratory experiments and maintained accurate assessment records.",
              ],
              [
                "2022 — 2023",
                "Centre Supervisor",
                "Project T-Max · Edo State",
                "Coordinated training operations, monitored programme delivery and prepared management reports.",
              ],
              [
                "2019",
                "Mechanical Engineering Intern",
                "Inward Technical Enterprise Limited · Sapele",
                "SolidWorks designs and models, dredging machine maintenance, annealing exposure and project reporting.",
              ],
            ].map(([date, title, org, desc]) => (
              <article key={title}>
                <span className="timedate">{date}</span>
                <div>
                  <h3>{title}</h3>
                  <p className="org">{org}</p>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="education">
            <div>
              <p className="eyebrow">EDUCATION</p>
              <h3>B.Eng, Mechanical Engineering</h3>
              <p>University of Benin · March 2023</p>
            </div>
            <div>
              <p className="eyebrow">TRAINING & MEMBERSHIP</p>
              <p>
                Piping Engineering Fundamentals · EPC LAND
                <br />
                Construction Management · University of Maryland
                <br />
                Graduate Member · Nigerian Society of Engineers
              </p>
            </div>
          </div>
        </section>
        <section id="contact" className="contactsection">
          <p className="eyebrow">04 / LET’S CONNECT</p>
          <h2>
            Have an engineering
            <br />
            opportunity in mind?
          </h2>
          <p>
            I’d love to discuss how my design and engineering skills can
            contribute to your team.
          </p>
          <a className="contactemail" href="mailto:michealjegede3@gmail.com">
            michealjegede3@gmail.com <ArrowUpRight />
          </a>
          <div className="contactdetails">
            <span>
              <MapPin size={16} /> Ikeja, Lagos State, Nigeria
            </span>
            <a href="tel:+2349034091789">09034091789</a>
            <a href="tel:+2349010844524">09010844524</a>
          </div>
        </section>
      </main>
      <footer>
        <span>© {new Date().getFullYear()} Micheal Oluwatobi Jegede</span>
        <span>Designed with precision.</span>
        <a href="/admin">
          Manage portfolio <ArrowUpRight size={12} />
        </a>
      </footer>
      {selected && (
        <div className="modalback" onClick={() => setSelected(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              autoFocus
              aria-label="Close project"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>
            <div className="modalmain">
              {selected.assets[active] ? (
                <Media
                  key={selected.assets[active].id}
                  asset={selected.assets[active]}
                />
              ) : (
                <Blueprint />
              )}
            </div>
            <div className="modalcopy">
              <p className="eyebrow">
                {selected.category} / {selected.year}
              </p>
              <h2>{selected.title}</h2>
              <span className="tooltag">{selected.tools}</span>
              <p className="description">{selected.description}</p>
              <h3>Project files</h3>
              {selected.assets.length === 0 ? (
                <p>Supporting files will be added soon.</p>
              ) : (
                selected.assets.map((a, i) => (
                  <div
                    className={"assetrow " + (active === i ? "selected" : "")}
                    key={a.id}
                  >
                    <button onClick={() => setActive(i)}>
                      <FileText size={16} />
                      <span>
                        {a.name}
                        <small>{(a.size / 1024 / 1024).toFixed(1)} MB</small>
                      </span>
                    </button>
                    <a
                      title={"Download " + a.name}
                      href={"/api/media/" + a.id + "?download=1"}
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
