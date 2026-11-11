"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Icon from "../components/Icon";
import InstallApp from "../components/InstallApp";
import AddPlace from "../components/AddPlace";
import { demoPlaces, labels, Place } from "../lib/places";
const Map = dynamic(() => import("../components/Map"), { ssr: false });
export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]),
    [demo, setDemo] = useState(false),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState(""),
    [view, setView] = useState("map"),
    [selected, setSelected] = useState<number | null>(null),
    [status, setStatus] = useState("Məkanlar yüklənir…"),
    [saved, setSaved] = useState<number[]>([]),
    [modal, setModal] = useState(""),
    [zoom, setZoom] = useState(1),
    [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    setDemo(new URLSearchParams(window.location.search).get("demo") === "1");
    void load();
  }, []);
  useEffect(() => {
    if (modal) {
      dialog.current?.showModal();
      try {
        const draft = JSON.parse(
          localStorage.getItem(`achiq-draft-${modal}`) || "{}",
        );
        dialog.current
          ?.querySelectorAll<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >("[name]")
          .forEach((field) => {
            if (typeof draft[field.name] === "string")
              field.value = draft[field.name];
          });
      } catch {}
    } else dialog.current?.close();
  }, [modal]);
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(`achiq-saved-${demo ? "demo" : "live"}`) || "[]",
      );
      setSaved(
        Array.isArray(stored)
          ? stored.filter((id) => typeof id === "number")
          : [],
      );
    } catch {
      setSaved([]);
    }
  }, [demo]);
  async function load() {
    setStatus("Məkanlar yüklənir…");
    try {
      const r = await fetch("/api/locations?size=100");
      if (!r.ok) throw Error();
      setPlaces(await r.json());
      setStatus("");
    } catch {
      setStatus(
        "Serverə qoşulmaq mümkün olmadı. Görünüşü yoxlamaq üçün dizayn demosunu aç.",
      );
    }
  }
  function toggleDemo() {
    setDemo(!demo);
    setSelected(null);
    const url = new URL(window.location.href);
    if (!demo) url.searchParams.set("demo", "1");
    else url.searchParams.delete("demo");
    window.history.replaceState({}, "", url);
  }
  const all = demo ? demoPlaces : places;
  const visible = all.filter(
    (p) =>
      (!filter || p.color === filter) &&
      p.name.toLocaleLowerCase("az").includes(query.toLocaleLowerCase("az")) &&
      (view !== "saved" || saved.includes(p.id)),
  );
  const place = visible.find((p) => p.id === selected) || visible[0];
  function save(p: Place) {
    const next = saved.includes(p.id)
      ? saved.filter((id) => id !== p.id)
      : [...saved, p.id];
    setSaved(next);
    try {
      localStorage.setItem(
        `achiq-saved-${demo ? "demo" : "live"}`,
        JSON.stringify(next),
      );
    } catch {
      setMessage("Brauzer yaddaşına yazmaq mümkün olmadı.");
    }
  }
  function open(type: string) {
    setMessage("");
    setModal(type);
  }
  function speak() {
    if (!("speechSynthesis" in window)) {
      setMessage("Brauzer səsli oxumanı dəstəkləmir.");
      return;
    }
    window.speechSynthesis.cancel();
    const s = new SpeechSynthesisUtterance(
      visible
        .map(
          (p) =>
            `${p.name}. ${p.assessmentSource === "AI" ? "AI · İlkin vizual qiymət" : labels[p.color]}`,
        )
        .join(". ") || "Məkan tapılmadı",
    );
    s.lang = "az-AZ";
    window.speechSynthesis.speak(s);
  }
  function art(p: Place) {
    return (
      <div className={`place-art ${p.color}`}>
        <Icon name={p.color === "GREEN" ? "access" : "map"} />
        <span className="badge">
          <span className="dot" />
          {p.assessmentSource === "AI"
            ? "AI · İlkin vizual qiymət"
            : labels[p.color]}
        </span>
      </div>
    );
  }
  function card(p: Place) {
    return (
      <article className={`place-card ${p.color}`} key={p.id}>
        {art(p)}
        <div className="card-body">
          <div>
            <p className="eyebrow">
              {demo ? "DİZAYN NÜMUNƏSİ" : "BAKI · MƏKAN"}
            </p>
            <h2>{p.name}</h2>
          </div>
          <div className="rating">
            <Icon name="star" />
            <strong>{p.rating?.toFixed(1) ?? "—"}</strong>
            <span className="muted">({p.reviewCount} rəy)</span>
          </div>
          {p.assessmentSource === "AI" && (
            <span className="ai-label">
              <Icon name="sparkles" />
              İlkin AI qiymətləndirməsi · audit deyil
            </span>
          )}
          <p className="muted text-sm">{p.description}</p>
          {p.assessmentSource === "AI" && (
            <p className="muted text-sm">{p.aiSummary}</p>
          )}
          <button
            className="primary wide"
            onClick={() => {
              setSelected(p.id);
              setView("detail");
            }}
          >
            Məkanın detallarına bax <Icon name="arrow" />
          </button>
        </div>
      </article>
    );
  }
  const search = (
    <>
      <Icon name="search" />
      <span className="sr-only">Məkan axtar</span>
      <input
        type="search"
        placeholder="Məkan, aptek, kafe axtarın…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </>
  );
  return (
    <>
      <a href="#main-content" className="skip">
        Əsas məzmuna keç
      </a>
      <header className="app-header">
        <div className="header-inner">
          <a className="brand" href="/">
            <img
              className="brand-logo"
              src="/brand/logo.svg"
              alt=""
              width="52"
              height="52"
            />
            <span>
              <strong>AçıqYol</strong>
              <small>Hər kəs üçün açıq yol</small>
            </span>
          </a>
          <label className="search header-search">{search}</label>
          <div className="install-wrap">
            <InstallApp />
          </div>
          <button
            className="primary header-add"
            onClick={() => open("add")}
            aria-label="Məkan əlavə et"
          >
            <Icon name="plus" />
            <span>Məkan əlavə et</span>
          </button>
          <button
            className="icon-button avatar"
            aria-label="Profil"
            onClick={() => open("profile")}
          >
            <Icon name="user" />
          </button>
        </div>
      </header>
      <main id="main-content" className="workspace">
        <div className="intro">
          <div>
            <p className="eyebrow">BAKI · ƏLÇATANLIQ XƏRİTƏSİ</p>
            <h1>Açıq yollar. Sərbəst həyat.</h1>
            <p className="muted">
              Bir şəkil paylaş, görünən maneələri anlamağa kömək et. Şəhəri
              birlikdə daha əlçatan edək.
            </p>
          </div>
          <button
            className="secondary"
            aria-pressed={demo}
            onClick={toggleDemo}
          >
            {demo ? "Canlı məlumatlara keç" : "Dizayn demosu"}
          </button>
        </div>
        {demo ? (
          <div className="notice">
            <span>
              <strong>Dizayn demosu.</strong> Məkanlar, rəylər və sxematik
              xəritə nümunədir; real əlçatanlığı təsdiqləmir.
            </span>
          </div>
        ) : (
          status && (
            <div className="notice" role="status">
              <span>{status}</span>
              <button onClick={load}>Yenilə</button>
            </div>
          )
        )}
        <label className="search mobile-search">{search}</label>
        <div className="chips" role="group" aria-label="Əlçatanlıq filtrləri">
          {[["", "Bütün statuslar"], ...Object.entries(labels)].map(
            ([key, label]) => (
              <button
                key={key}
                className={`chip ${key} ${filter === key ? "active" : ""}`}
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
              >
                {key ? <span className="dot" /> : <Icon name="filter" />}
                {label} ({all.filter((p) => !key || p.color === key).length})
              </button>
            ),
          )}
        </div>
        {view === "map" ? (
          <div className="map-layout">
            <section className="map-stage" aria-label="Məkan xəritəsi">
              {demo ? (
                <>
                  <div className="demo-map">
                    <img
                      className="demo-map-bg"
                      src="/design/tactile-map.svg"
                      alt=""
                      style={{ transform: `scale(${zoom})` }}
                    />
                    {visible.map((p) => {
                      const coords = [
                        [28, 36],
                        [64, 22],
                        [78, 58],
                        [25, 75],
                      ][p.id - 1];
                      return (
                        <button
                          key={p.id}
                          className={`pin ${p.color} ${place?.id === p.id ? "selected" : ""}`}
                          style={{
                            left: `${50 + (coords[0] - 50) * zoom}%`,
                            top: `${50 + (coords[1] - 50) * zoom}%`,
                          }}
                          onClick={() => setSelected(p.id)}
                          aria-label={`${p.name}, ${p.assessmentSource === "AI" ? "AI · İlkin vizual qiymət" : labels[p.color]}`}
                          aria-pressed={place?.id === p.id}
                        >
                          <span className="pin-bubble">
                            <Icon
                              name={
                                p.color === "GREEN"
                                  ? "access"
                                  : p.color === "RED"
                                    ? "flag"
                                    : "pin"
                              }
                            />
                          </span>
                          <span className="pin-tip" />
                          <span className="pin-title">{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="map-controls">
                    <button
                      className="icon-button"
                      aria-label="Xəritəni böyüt"
                      onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                    >
                      <Icon name="plus" />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Xəritəni kiçilt"
                      onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}
                    >
                      <Icon name="minus" />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Xəritəni mərkəzlə"
                      onClick={() => setZoom(1)}
                    >
                      <Icon name="locate" />
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Məkanları səslə oxu"
                      onClick={speak}
                    >
                      <Icon name="audio" />
                    </button>
                  </div>
                </>
              ) : (
                <Map
                  places={visible}
                  onSelect={setSelected}
                  selected={selected}
                />
              )}
              <div className="map-label">
                <span className="dot GREEN" />
                {demo ? "Taktil xəritə · demo" : "Bakı · icma rəyləri"}
              </div>
              <div className="map-legend">
                <span className="GREEN">
                  <i className="dot" />
                  Əlçatan
                </span>
                <span className="YELLOW">
                  <i className="dot" />
                  Qismən
                </span>
                <span className="RED">
                  <i className="dot" />
                  Maneələr
                </span>
                <span className="GREY">
                  <i className="dot" />
                  Naməlum
                </span>
              </div>
            </section>
            <aside className="side-panel" aria-label="Seçilmiş məkan">
              {place ? (
                card(place)
              ) : (
                <div className="empty">
                  Məkan tapılmadı. Axtarışı və filtrləri dəyiş.
                </div>
              )}
              <div className="note">
                <strong>Birlikdə daha əlçatan şəhər.</strong>
                <p>
                  Getməzdən əvvəl ehtiyaclarına uyğunluğu məkanla dəqiqləşdir.
                </p>
              </div>
            </aside>
          </div>
        ) : view === "detail" && place ? (
          <section className="detail-page">
            <button className="secondary" onClick={() => setView("map")}>
              ← Xəritəyə qayıt
            </button>
            <article className={`place-card ${place.color}`}>
              {art(place)}
              <div className="card-body">
                <p className="eyebrow">MƏKAN DETALLARI</p>
                <h1>{place.name}</h1>
                <div className="rating">
                  <Icon name="star" />
                  {place.rating?.toFixed(1) ?? "Rəy yoxdur"} ·{" "}
                  {place.reviewCount} rəy
                </div>
                <p className="muted">{place.description}</p>
                {place.aiSummary && (
                  <div className="note">
                    <strong>İlkin AI qeydləri · audit deyil</strong>
                    <p>{place.aiSummary}</p>
                  </div>
                )}
                <div className="actions">
                  <button
                    className="secondary"
                    onClick={() => save(place)}
                    aria-pressed={saved.includes(place.id)}
                  >
                    <Icon name="bookmark" />
                    {saved.includes(place.id)
                      ? "Yadda saxlanılıb"
                      : "Yadda saxla"}
                  </button>
                  <button className="secondary" onClick={() => open("report")}>
                    <Icon name="flag" />
                    Maneə bildir
                  </button>
                </div>
              </div>
            </article>
            <div className="note">
              <h3>Əlçatanlıq məlumatları</h3>
              <p>
                Pandus, qapı eni, lift və sanitar qovşaq barədə təsdiqlənmiş
                audit məlumatı hələ yoxdur. Rəng icma reytinqinə və ya ayrıca
                işarələnmiş ilkin AI qiymətləndirməsinə əsaslanır.
              </p>
            </div>
            <button className="primary wide" onClick={() => open("route")}>
              <Icon name="route" />
              Ən rahat yolu tap
            </button>
          </section>
        ) : (
          <section>
            <div className="list-heading">
              <h2>
                {view === "saved" ? "Yadda saxlananlar" : "Əlçatan məkanlar"}
              </h2>
              <span className="muted">{visible.length} məkan</span>
            </div>
            <div className="list-grid">{visible.map(card)}</div>
            {!visible.length && (
              <p className="empty">Bu siyahıda hələ məkan yoxdur.</p>
            )}
          </section>
        )}
        {message && !modal && (
          <p className="note" role="status">
            {message}
          </p>
        )}
        <p className="muted mt-5 text-xs">
          {demo
            ? "Stitch dizaynına əsaslanan interaktiv önbaxış."
            : "İlk 100 məkan göstərilir. Reytinqlər icma rəylərinə əsaslanır."}
        </p>
      </main>
      <nav className="bottom-nav" aria-label="Əsas naviqasiya">
        {[
          ["map", "map", "Xəritə"],
          ["list", "list", "Məkanlar"],
          ["saved", "bookmark", "Yaddaş"],
        ].map(([key, icon, title]) => (
          <button
            className={`nav-item ${view === key ? "active" : ""}`}
            key={key}
            aria-current={view === key ? "page" : undefined}
            onClick={() => setView(key)}
          >
            <Icon name={icon} />
            {title}
          </button>
        ))}
        <button className="nav-item" onClick={() => open("profile")}>
          <Icon name="user" />
          Profil
        </button>
      </nav>
      <dialog
        className="dialog"
        ref={dialog}
        onCancel={() => setModal("")}
        onClose={() => setModal("")}
        aria-labelledby="dialog-title"
      >
        <div className="dialog-head">
          <h2 id="dialog-title">
            {modal === "add"
              ? "Şəkildən xəritəyə"
              : modal === "experience"
                ? "Təcrübəni bölüş"
                : modal === "report"
                  ? "Maneə bildir"
                  : modal === "route"
                    ? "Ən rahat yol"
                    : "Sənin profilin"}
          </h2>
          <button
            className="icon-button"
            aria-label="Bağla"
            onClick={() => setModal("")}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="dialog-content">
          {modal === "add" ? (
            <AddPlace
              onAdded={(p) => {
                setPlaces((current) => [
                  p,
                  ...current.filter((item) => item.id !== p.id),
                ]);
                setDemo(false);
                setFilter("");
                setQuery("");
                setSelected(p.id);
                setView("map");
                setStatus("");
                setModal("");
                setMessage(
                  "Məkan ilkin AI qiymətləndirməsi ilə xəritəyə əlavə edildi.",
                );
                const url = new URL(window.location.href);
                url.searchParams.delete("demo");
                window.history.replaceState({}, "", url);
              }}
            />
          ) : modal === "experience" || modal === "report" ? (
            <form
              key={modal}
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  localStorage.setItem(
                    `achiq-draft-${modal}`,
                    JSON.stringify(
                      Object.fromEntries(new FormData(e.currentTarget)),
                    ),
                  );
                  setMessage(
                    "Qaralama bu brauzerdə saxlanıldı. Serverə göndərilməyib.",
                  );
                } catch {
                  setMessage("Qaralamanı saxlamaq mümkün olmadı.");
                }
              }}
            >
              <p className="note">
                Bu forma lokal qaralama üçündür. Göndərmə xidməti hələ
                qoşulmayıb.
              </p>
              <label className="field">
                Məkanın adı
                <input
                  name="place"
                  required
                  maxLength={120}
                  defaultValue={place?.name || ""}
                />
              </label>
              {modal === "experience" ? (
                <label className="field">
                  Əlçatanlıq qiyməti
                  <select name="rating">
                    <option value="5">5 — Çox yaxşı</option>
                    <option value="4">4 — Yaxşı</option>
                    <option value="3">3 — Qismən əlçatan</option>
                    <option value="2">2 — Çətindir</option>
                    <option value="1">1 — Əlçatan deyil</option>
                  </select>
                </label>
              ) : (
                <label className="field">
                  Maneənin növü
                  <select name="obstacle">
                    <option>Pandus bağlıdır</option>
                    <option>Lift işləmir</option>
                    <option>Girişdə pilləkən var</option>
                    <option>Digər maneə</option>
                  </select>
                </label>
              )}
              <label className="field">
                Təsvir
                <textarea
                  name="description"
                  required
                  maxLength={2000}
                  placeholder="Başqalarının bilməsi faydalı olan detalları yaz…"
                />
              </label>
              <button className="primary wide" type="submit">
                Qaralamanı bu cihazda saxla
              </button>
            </form>
          ) : modal === "route" ? (
            <>
              <div className="note">
                <Icon name="route" />
                <h3>{place?.name}</h3>
                <p>
                  Əlçatan marşrut hesablama xidməti hələ qoşulmayıb. Pilləkənsiz
                  və ya panduslu yol zəmanəti verilmir.
                </p>
              </div>
              {place && !demo && (
                <a
                  className="primary"
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=17/${place.latitude}/${place.longitude}`}
                >
                  Məkanı OpenStreetMap-də aç
                </a>
              )}
              <button
                className="secondary"
                onClick={() => {
                  setModal("");
                  setView("map");
                }}
              >
                Xəritəyə qayıt
              </button>
            </>
          ) : (
            <>
              <div className="note">
                <Icon name="user" />
                <h3>Qonaq kimi baxırsan</h3>
                <p>
                  Hesab qeydiyyatı hələ aktiv deyil. Məkanları bu brauzerin
                  yaddaşında saxlaya bilərsən.
                </p>
              </div>
              <InstallApp />
            </>
          )}
          {message && (
            <p className="note" role="status">
              {message}
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
