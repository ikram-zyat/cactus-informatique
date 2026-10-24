import { useEffect, useRef } from "react";

export const Cactus = ({ h = 40 }) => (
  <svg width={h * 0.8} height={h} viewBox="0 0 40 50" fill="#1fa971" aria-hidden="true">
    <rect x="15" y="2" width="10" height="46" rx="5" />
    <rect x="4" y="14" width="7" height="18" rx="3.5" /><rect x="6" y="26" width="13" height="6" rx="3" />
    <rect x="29" y="10" width="7" height="20" rx="3.5" /><rect x="21" y="24" width="13" height="6" rx="3" />
  </svg>
);

const P = {
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h5v-6h4v6h5V10" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.6 3-6 7-6s7 2.4 7 6" /><circle cx="17.5" cy="9" r="2.5" /><path d="M17 14.5c3 0 5 1.8 5 4.5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></>,
  out: <><path d="M9 4H5v16h4" /><path d="M16 8l4 4-4 4M20 12H9" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeoff: <><path d="M3 3l18 18" /><path d="M10.6 6.1A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6A17 17 0 0 0 2 12s4 7 10 7a9.7 9.7 0 0 0 4.2-1" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  truck: <><path d="M2 6h12v10H2zM14 10h4l4 4v2h-8" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  chev: <path d="M6 9l6 6 6-6" />,
  left: <path d="M15 6l-6 6 6 6" />,
  right: <path d="M9 6l6 6-6 6" />,
};
export const Icon = ({ n, s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[n]}</svg>
);

const TONES = { Administrateur: "admin", Utilisateur: "user", Actif: "ok", Inactif: "bad", "Planifié": "user", "En cours": "warn", "Terminé": "ok" };
export const Badge = ({ v }) => <span className={`badge badge--${TONES[v] || "user"}`}>{v}</span>;

export const Avatar = ({ s = 36 }) => (
  <span className="avatar" style={{ width: s, height: s }}><Icon n="user" s={s * 0.6} /></span>
);

export function Pager({ page, pages, set }) {
  return (
    <div className="pager">
      <button className="pg" disabled={page <= 1} onClick={() => set(page - 1)} aria-label="Page précédente"><Icon n="left" s={14} /></button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button key={n} className={`pg ${n === page ? "pg--on" : ""}`} onClick={() => set(n)}>{n}</button>
      ))}
      <button className="pg" disabled={page >= pages} onClick={() => set(page + 1)} aria-label="Page suivante"><Icon n="right" s={14} /></button>
    </div>
  );
}

// Fenêtre de confirmation (déconnexion, suppression).
export function Confirm({ title, text, ok = "Confirmer", danger, onOk, onCancel }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} className="dlg" onCancel={(e) => { e.preventDefault(); onCancel(); }} onClick={(e) => e.target === ref.current && onCancel()}>
      <div className="dlg__box">
        <Cactus h={38} />
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="dlg__act">
          <button className="btn btn--soft" onClick={onCancel}>Annuler</button>
          <button className={`btn ${danger ? "btn--danger" : ""}`} onClick={onOk}>{ok}</button>
        </div>
      </div>
    </dialog>
  );
}
