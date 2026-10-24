import { useEffect, useState } from "react";
import { useStore } from "./store.js";
import { hash, hashAdmin } from "./auth.js";
import { ADMIN } from "./admin.config.js";
import { Cactus, Icon, Avatar, Confirm } from "./ui.jsx";
import { Dashboard, Users, Trips, Profile } from "./pages.jsx";

const KEY = "cx-session";
const readSession = () => { try { return JSON.parse(localStorage.getItem(KEY) || sessionStorage.getItem(KEY)); } catch { return null; } };

export default function App() {
  const [route, setRoute] = useState(location.hash || "#/");
  const [sess, setSess] = useState(readSession);
  const [users, setUsers] = useStore("cx-users", []);
  const [trips, setTrips] = useStore("cx-trips", []);
  const [dlg, setDlg] = useState(null);
  const [menu, setMenu] = useState(() => window.innerWidth > 900);
  const [msg, setMsg] = useState(null);
  const [show, setShow] = useState(false);

  // Le compte administrateur vient du fichier de configuration : il n'est pas modifiable depuis le site.
  const adminUser = ADMIN && { id: "admin", nom: ADMIN.nom, email: ADMIN.email, role: "Administrateur", statut: "Actif", createdAt: ADMIN.createdAt, builtin: true };
  const all = [adminUser, ...users].filter(Boolean);
  const me = sess && all.find((u) => u.id === sess.id && u.statut === "Actif");

  useEffect(() => {
    const onHash = () => { setRoute(location.hash || "#/"); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const start = (id, remember) => {
    const s = JSON.stringify({ id });
    try { (remember ? localStorage : sessionStorage).setItem(KEY, s); } catch {}
    setSess({ id }); setMsg(null); location.hash = "#/";
  };
  const logout = () => {
    try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch {}
    setSess(null); setMsg(null); location.hash = "#/";
  };
  const ask = (cfg) => setDlg(cfg);

  const login = async (e) => {
    e.preventDefault();
    const d = new FormData(e.target);
    const email = d.get("email").trim().toLowerCase(), pw = d.get("pw"), remember = d.get("remember") === "on";
    if (ADMIN && ADMIN.email === email && ADMIN.hash === (await hashAdmin(email, pw, ADMIN.salt))) return start("admin", remember);
    const u = users.find((x) => x.email === email);
    if (u && u.hash === (await hash(email, pw))) {
      if (u.statut !== "Actif") return setMsg({ t: "err", text: "Ce compte est inactif. Contactez l'administrateur." });
      return start(u.id, remember);
    }
    setMsg({ t: "err", text: "Email ou mot de passe incorrect." });
  };

  if (!me) {
    return (
      <div className="login">
        <aside className="login__brand">
          <Cactus h={84} />
          <h1>Cactus</h1><p className="inf">Informatique</p>
          <p className="tag">Une application simple et efficace<br />pour gérer vos utilisateurs.</p>
        </aside>
        <main className="login__main">
          <form onSubmit={login}>
            <h2>Connexion</h2>
            <p className="sub">Accédez à votre espace de gestion</p>
            <div className="fld"><Icon n="mail" /><input name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="username" required /></div>
            <div className="fld"><Icon n="lock" /><input name="pw" type={show ? "text" : "password"} placeholder="Mot de passe" aria-label="Mot de passe" autoComplete="current-password" required />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}><Icon n={show ? "eyeoff" : "eye"} /></button></div>
            <label className="chk"><input type="checkbox" name="remember" /> Se souvenir de moi</label>
            {msg && <p className={msg.t === "err" ? "err" : "note"} role="alert">{msg.text}</p>}
            {!ADMIN && import.meta.env.DEV && <p className="note">Aucun compte administrateur configuré : lancez « npm run make-admin ».</p>}
            <button className="btn btn--full" type="submit">Se connecter</button>
            <button type="button" className="lnk" onClick={() => setMsg({ t: "info", text: "Contactez votre administrateur pour réinitialiser votre mot de passe." })}>Mot de passe oublié ?</button>
          </form>
        </main>
      </div>
    );
  }

  const isAdmin = me.role === "Administrateur";
  const r = route.replace(/^#/, "");
  let current, page;
  if (r === "/profil") { current = "/profil"; page = <Profile key={me.id} me={me} users={users} setUsers={setUsers} />; }
  else if (isAdmin && r === "/utilisateurs") { current = r; page = <Users all={all} users={users} setUsers={setUsers} trips={trips} setTrips={setTrips} ask={ask} />; }
  else if (r === "/trajets" || !isAdmin) { current = "/trajets"; page = <Trips me={me} all={all} trips={trips} setTrips={setTrips} ask={ask} />; }
  else { current = "/"; page = <Dashboard all={all} trips={trips} />; }

  const nav = isAdmin
    ? [["/", "Tableau de bord", "home"], ["/utilisateurs", "Utilisateurs", "users"], ["/trajets", "Trajets", "truck"], ["/profil", "Profil", "user"]]
    : [["/trajets", "Mes trajets", "truck"], ["/profil", "Profil", "user"]];

  return (
    <div className={`app ${menu ? "" : "app--closed"}`}>
      <aside className="side">
        <div className="brand"><Cactus h={34} /><div><b>Cactus</b><span>Informatique</span></div></div>
        <nav>
          {nav.map(([p, t, i]) => (
            <a key={p} href={"#" + p} className={current === p ? "on" : ""} onClick={() => window.innerWidth <= 900 && setMenu(false)}><Icon n={i} />{t}</a>
          ))}
          <button type="button" onClick={() => ask({ title: "Se déconnecter ?", text: "Êtes-vous sûr de vouloir vous déconnecter de votre compte ?", ok: "Se déconnecter", onOk: logout })}><Icon n="out" />Déconnexion</button>
        </nav>
      </aside>
      <div className="main">
        <header className="top">
          <button className="burger" onClick={() => setMenu(!menu)} aria-label="Afficher ou masquer le menu"><Icon n="menu" s={20} /></button>
          <div className="who"><Avatar s={34} /><div><b>{me.nom}</b><span>{me.role}</span></div><Icon n="chev" s={14} /></div>
        </header>
        <div className="content">{page}</div>
      </div>
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
      {dlg && <Confirm {...dlg} onOk={() => { dlg.onOk(); setDlg(null); }} onCancel={() => setDlg(null)} />}
    </div>
  );
}
