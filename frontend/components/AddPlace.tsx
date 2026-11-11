"use client";
import { useRef, useState } from "react";
import Icon from "./Icon";
import type { Place } from "../lib/places";
type Analysis = {
  color: string;
  confidence: string;
  summary: string;
  observations: string[];
  unknowns: string[];
};
const aiLabels: Record<string, string> = {
  GREEN: "Görünən giriş maneəsiz görünür",
  YELLOW: "Qismən maneələr görünür",
  RED: "Aydın maneə görünür",
  GREY: "Qiymətləndirmək mümkün deyil",
};
async function prepareImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw Error("JPEG, PNG və ya WebP seçin. HEIC şəklini JPEG-ə çevirin.");
  if (file.size > 10 * 1024 * 1024)
    throw Error("Şəkil 10 MB-dan kiçik olmalıdır.");
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw Error("Şəkil emal olunmadı.");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.8);
    if (data.length > 1400000)
      throw Error("Daha sadə və ya kiçik şəkil seçin.");
    return data;
  } finally {
    bitmap.close();
  }
}
export default function AddPlace({
  onAdded,
}: {
  onAdded: (place: Place) => void;
}) {
  const [image, setImage] = useState(""),
    [analysis, setAnalysis] = useState<Analysis | null>(null),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [user, setUser] = useState("admin"),
    [password, setPassword] = useState(""),
    [consent, setConsent] = useState(false),
    [lat, setLat] = useState(""),
    [lon, setLon] = useState("");
  const fileRef = useRef<HTMLInputElement>(null),
    cameraRef = useRef<HTMLInputElement>(null),
    generation = useRef(0);
  async function choose(file?: File) {
    if (!file) return;
    const version = ++generation.current;
    setError("");
    setAnalysis(null);
    setImage("");
    setBusy("Şəkil hazırlanır…");
    try {
      const data = await prepareImage(file);
      if (version === generation.current) setImage(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Şəkil açılmadı.");
    } finally {
      if (version === generation.current) setBusy("");
    }
  }
  function auth() {
    return "Basic " + btoa(unescape(encodeURIComponent(user + ":" + password)));
  }
  async function analyze() {
    setError("");
    setBusy("AI görünən maneələri yoxlayır…");
    setAnalysis(null);
    try {
      const r = await fetch("/api/accessibility", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: auth() },
        body: JSON.stringify({ image }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || "AI sorğusu alınmadı.");
      setAnalysis(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Şəbəkə xətası.");
    } finally {
      setBusy("");
    }
  }
  function locate() {
    if (!navigator.geolocation) {
      setError("Geolokasiya dəstəklənmir. Koordinatları yazın.");
      return;
    }
    setBusy("Mövqe alınır…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLat(p.coords.latitude.toFixed(6));
        setLon(p.coords.longitude.toFixed(6));
        setBusy("");
      },
      () => {
        setError("Mövqe alınmadı. İcazəni yoxlayın və ya koordinatları yazın.");
        setBusy("");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!analysis) return;
    setError("");
    setBusy("Məkan xəritəyə əlavə olunur…");
    const form = new FormData(e.currentTarget);
    const summary = [
      analysis.summary,
      "Görünənlər: " + analysis.observations.join("; "),
      "Yoxlanmalı: " + analysis.unknowns.join("; "),
    ]
      .join("\n")
      .slice(0, 2000);
    try {
      const r = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: auth() },
        body: JSON.stringify({
          name: form.get("name"),
          description: form.get("description") || "",
          latitude: Number(lat),
          longitude: Number(lon),
          aiColor: analysis.color,
          aiSummary: summary,
        }),
      });
      if (!r.ok)
        throw Error(
          r.status === 401
            ? "Admin girişi yanlışdır."
            : r.status === 403
              ? "Əlavə etmək üçün admin icazəsi lazımdır."
              : "Məkan saxlanılmadı. Backend bağlantısını yoxlayın.",
        );
      onAdded(await r.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Məkan saxlanılmadı.");
    } finally {
      setBusy("");
    }
  }
  return (
    <form className="add-place-form" onSubmit={submit}>
      <div className="flow-steps">
        <span className="done">01 · Şəkil</span>
        <span className={analysis ? "done" : ""}>02 · AI baxışı</span>
        <span>03 · Xəritə</span>
      </div>
      <div className="photo-drop">
        {image ? (
          <img src={image} alt="Əlavə ediləcək məkanın şəkli" />
        ) : (
          <>
            <div className="photo-icon">
              <Icon name="camera" />
            </div>
            <h3>Məkanı göstər, maneələri aydınlaşdıraq.</h3>
            <p>Giriş, pilləkən və ya pandus tam görünsün.</p>
          </>
        )}
        <div className="photo-actions">
          <button
            type="button"
            className="primary"
            disabled={!!busy}
            onClick={() => fileRef.current?.click()}
          >
            <Icon name="photo" />
            Şəkil seç
          </button>
          <button
            type="button"
            className="secondary"
            disabled={!!busy}
            onClick={() => cameraRef.current?.click()}
          >
            <Icon name="camera" />
            Şəkil çək
          </button>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        aria-label="Məkan şəkli"
        onChange={(e) => {
          void choose(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        aria-label="Kamera ilə şəkil"
        onChange={(e) => {
          void choose(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <p className="muted text-xs">
        JPEG, PNG, WebP · maksimum 10 MB. Şəkil kiçildilir, metadata silinir.
        Foto bazada saxlanmır; yalnız AI qeydləri saxlanır.
      </p>
      <div className="credentials">
        <label className="field">
          Admin adı
          <input
            autoComplete="username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
        </label>
        <label className="field">
          Admin şifrəsi
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      <label className="consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>
          Şəklin analiz üçün OpenAI xidmətinə göndərilməsinə razıyam. Üzləri və
          şəxsi məlumatları paylaşmadan əvvəl gizlətmişəm.
        </span>
      </label>
      <button
        className="ai-button"
        type="button"
        onClick={analyze}
        disabled={!image || !password || !user || !consent || !!busy}
      >
        <Icon name="sparkles" />
        {busy || "AI ilə əlçatanlığı yoxla"}
      </button>
      {analysis && (
        <section
          className={`analysis-result ${analysis.color}`}
          aria-label="AI nəticəsi"
        >
          <span className="badge">
            <Icon name="sparkles" />
            İlkin AI qiymətləndirməsi
          </span>
          <h3>{aiLabels[analysis.color]}</h3>
          <p>{analysis.summary}</p>
          <div className="analysis-columns">
            <div>
              <strong>Görünənlər</strong>
              <ul>
                {analysis.observations.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Yerində yoxlanmalı</strong>
              <ul>
                {analysis.unknowns.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs">
            Modelin əminliyi:{" "}
            {
              { low: "aşağı", medium: "orta", high: "yüksək" }[
                analysis.confidence
              ]
            }
            . Bu, audit və ya təhlükəsiz marşrut zəmanəti deyil.
          </p>
        </section>
      )}
      <label className="field">
        Məkanın adı
        <input
          name="name"
          placeholder="Məsələn: Sahil kafesi"
          required
          maxLength={120}
        />
      </label>
      <label className="field">
        Qısa qeyd
        <textarea
          name="description"
          maxLength={2000}
          placeholder="Girişlə bağlı əlavə məlumat…"
        />
      </label>
      <div className="credentials">
        <label className="field">
          Enlik
          <input
            type="number"
            step="any"
            min="-90"
            max="90"
            required
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="40.4093"
          />
        </label>
        <label className="field">
          Uzunluq
          <input
            type="number"
            step="any"
            min="-180"
            max="180"
            required
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="49.8671"
          />
        </label>
      </div>
      <button
        type="button"
        className="secondary"
        onClick={locate}
        disabled={!!busy}
      >
        <Icon name="locate" />
        Hazırkı koordinatlarımı götür
      </button>
      <p className="muted text-xs">
        Şəkil başqa yerdə çəkilibsə, həmin məkanın koordinatlarını yaz. Əlavə
        etməzdən əvvəl mövqeni yoxla.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {busy && <p role="status">{busy}</p>}
      <button
        className="primary wide"
        disabled={!analysis || !!busy || !consent}
        type="submit"
      >
        <Icon name="pin" />
        Təsdiqlə və xəritəyə əlavə et
      </button>
    </form>
  );
}
