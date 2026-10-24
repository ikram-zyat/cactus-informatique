import { useState } from "react";
import { hash } from "./auth.js";
import { Icon, Badge, Pager, Avatar } from "./ui.jsx";

const fr = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "—");
const today = () => new Date().toISOString().slice(0, 10);
const F = ({ label, children }) => <label className="fl"><span>{label}</span>{children}</label>;
const match = (row, q) => Object.values(row).join(" ").toLowerCase().includes(q.toLowerCase());
const Head = ({ title, sub, children }) => (
  <div className="head"><div><h1>{title}</h1><p className="sub">{sub}</p></div>{children}</div>
);

/* ---------- Tableau de bord ---------- */
export function Dashboard({ all, trips }) {
  const actifs = all.filter((u) => u.statut === "Actif").length;
  const stats = [
    ["Total utilisateurs", all.length, "users", "blue"],
    ["Utilisateurs actifs", actifs, "user", "green"],
    ["Utilisateurs inactifs", all.length - actifs, "user", "gray"],
    ["Rôles", new Set(all.map((u) => u.role)).size, "users", "purple"],
  ];
  const name = (id) => all.find((u) => u.id === id)?.nom || "—";
  const lastTrips = [...trips].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 4);
  return (
    <>
      <Head title="Tableau de bord" sub="Bienvenue sur votre espace de gestion" />
      <div className="stats">
        {stats.map(([l, v, i, c]) => (
          <div className="stat" key={l}><span className={`ico ico--${c}`}><Icon n={i} s={22} /></span><p>{l}</p><b>{v}</b></div>
        ))}
      </div>
      <section className="panel"><h2>Derniers utilisateurs</h2>
        <div className="tw"><table>
          <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Inscription</th></tr></thead>
          <tbody>{[...all].reverse().slice(0, 4).map((u) => (
            <tr key={u.id}><td>{u.nom}</td><td>{u.email}</td><td><Badge v={u.role} /></td><td><Badge v={u.statut} /></td><td>{fr(u.createdAt)}</td></tr>
          ))}</tbody>
        </table></div>
      </section>
      <section className="panel"><h2>Derniers trajets</h2>
        {lastTrips.length === 0 ? <p className="empty">Aucun trajet enregistré pour le moment.</p> : (
          <div className="tw"><table>
            <thead><tr><th>Employé</th><th>Véhicule</th><th>Trajet</th><th>Date</th><th>Statut</th></tr></thead>
            <tbody>{lastTrips.map((t) => (
              <tr key={t.id}><td>{name(t.userId)}</td><td>{t.vehicule}</td><td>{t.depart} → {t.destination}</td><td>{fr(t.date)}</td><td><Badge v={t.statut} /></td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </>
  );
}

/* ---------- Utilisateurs ---------- */
export function Users({ all, users, setUsers, trips, setTrips, ask }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const rows = all.filter((u) => match({ n: u.nom, e: u.email, r: u.role, s: u.statut }, q));
  const per = 5, pages = Math.max(1, Math.ceil(rows.length / per)), p = Math.min(page, pages);
  const shown = rows.slice((p - 1) * per, p * per);

  const del = (u) => ask({
    title: "Supprimer cet utilisateur ?", text: `${u.nom} et ses trajets seront supprimés.`, ok: "Supprimer", danger: true,
    onOk: () => { setUsers(users.filter((x) => x.id !== u.id)); setTrips(trips.filter((t) => t.userId !== u.id)); },
  });

  if (form) return <UserForm start={form} all={all} users={users} setUsers={setUsers} close={() => setForm(null)} />;
  return (
    <>
      <Head title="Gestion des utilisateurs" sub="Liste des utilisateurs enregistrés dans l'application.">
        <button className="btn" onClick={() => setForm({ id: null, nom: "", email: "", pw: "", role: "", statut: "Actif" })}><Icon n="plus" s={16} />Ajouter un utilisateur</button>
      </Head>
      <section className="panel">
        <div className="search"><Icon n="search" s={16} /><input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Rechercher un utilisateur..." aria-label="Rechercher" /></div>
        <div className="tw"><table>
          <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>{shown.map((u) => (
            <tr key={u.id}>
              <td>{all.indexOf(u) + 1}</td><td>{u.nom}</td><td>{u.email}</td><td><Badge v={u.role} /></td><td><Badge v={u.statut} /></td>
              <td className="acts">
                <button className="ib" disabled={u.builtin} title={u.builtin ? "Compte principal : non modifiable ici" : "Modifier"} aria-label={`Modifier ${u.nom}`} onClick={() => setForm({ ...u, pw: "" })}><Icon n="edit" s={16} /></button>
                <button className="ib ib--red" disabled={u.builtin} title={u.builtin ? "Compte principal : non supprimable" : "Supprimer"} aria-label={`Supprimer ${u.nom}`} onClick={() => del(u)}><Icon n="trash" s={16} /></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {rows.length === 0 && <p className="empty">Aucun utilisateur trouvé.</p>}</div>
        <div className="foot2"><span>Affichage de {rows.length ? (p - 1) * per + 1 : 0} à {Math.min(p * per, rows.length)} sur {rows.length} utilisateurs</span><Pager page={p} pages={pages} set={setPage} /></div>
      </section>
    </>
  );
}

function UserForm({ start, all, users, setUsers, close }) {
  const [f, setF] = useState(start);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const isNew = f.id === null;

  const save = async (e) => {
    e.preventDefault();
    const email = f.email.trim().toLowerCase(), nom = f.nom.trim();
    if (all.some((u) => u.email === email && u.id !== f.id)) return setError("Un utilisateur existe déjà avec cet email.");
    if (isNew && f.pw.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères.");
    if (f.pw && f.pw.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères.");
    if (!isNew && email !== start.email && !f.pw) return setError("Pour changer l'email, saisissez aussi un nouveau mot de passe.");
    const h = f.pw ? await hash(email, f.pw) : start.hash;
    if (isNew) setUsers([...users, { id: Date.now(), nom, email, hash: h, role: f.role, statut: f.statut, createdAt: today() }]);
    else setUsers(users.map((u) => (u.id === f.id ? { ...u, nom, email, hash: h, role: f.role, statut: f.statut } : u)));
    close();
  };

  return (
    <>
      <Head title={isNew ? "Ajouter un utilisateur" : "Modifier l'utilisateur"} sub={isNew ? "Remplissez les informations pour créer un nouvel utilisateur." : "Modifiez les informations de l'utilisateur."} />
      <form className="panel form" onSubmit={save}>
        <div className="grid2">
          <F label="Nom"><input value={f.nom} onChange={set("nom")} placeholder="Nom complet" required /></F>
          <F label="Email"><input type="email" value={f.email} onChange={set("email")} placeholder="exemple@domaine.com" required /></F>
          <F label="Mot de passe">
            <div className="pw"><input type={show ? "text" : "password"} value={f.pw} onChange={set("pw")} placeholder={isNew ? "Minimum 6 caractères" : "Laisser vide pour ne pas changer"} autoComplete="new-password" />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Masquer" : "Afficher"}><Icon n={show ? "eyeoff" : "eye"} s={16} /></button></div>
          </F>
          <F label="Rôle"><select value={f.role} onChange={set("role")} required><option value="" disabled>Sélectionner un rôle</option><option>Administrateur</option><option>Utilisateur</option></select></F>
          <F label="Statut"><select value={f.statut} onChange={set("statut")}><option>Actif</option><option>Inactif</option></select></F>
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <div className="act"><button type="button" className="btn btn--soft" onClick={close}>Annuler</button><button className="btn" type="submit">Enregistrer</button></div>
      </form>
    </>
  );
}

/* ---------- Trajets ---------- */
export function Trips({ me, all, trips, setTrips, ask }) {
  const isAdmin = me.role === "Administrateur";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const name = (id) => all.find((u) => u.id === id)?.nom || "—";
  const mine = isAdmin ? trips : trips.filter((t) => t.userId === me.id);
  const rows = mine.filter((t) => match({ ...t, n: name(t.userId) }, q));
  const per = 6, pages = Math.max(1, Math.ceil(rows.length / per)), p = Math.min(page, pages);
  const shown = rows.slice((p - 1) * per, p * per);

  const del = (t) => ask({ title: "Supprimer ce trajet ?", text: `${t.depart} → ${t.destination}`, ok: "Supprimer", danger: true, onOk: () => setTrips(trips.filter((x) => x.id !== t.id)) });

  if (form) return <TripForm start={form} me={me} all={all} isAdmin={isAdmin} trips={trips} setTrips={setTrips} close={() => setForm(null)} />;
  return (
    <>
      <Head title={isAdmin ? "Trajets" : "Mes trajets"} sub="Déplacements des employés : véhicule utilisé et marchandise transportée.">
        <button className="btn" onClick={() => setForm({ id: null, userId: me.id, vehicule: "", immat: "", depart: "", destination: "", date: today(), marchandise: "", poids: "", statut: "Planifié" })}><Icon n="plus" s={16} />Ajouter un trajet</button>
      </Head>
      <section className="panel">
        <div className="search"><Icon n="search" s={16} /><input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Rechercher un trajet..." aria-label="Rechercher" /></div>
        <div className="tw"><table>
          <thead><tr>{isAdmin && <th>Employé</th>}<th>Véhicule</th><th>Trajet</th><th>Date</th><th>Marchandise</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>{shown.map((t) => (
            <tr key={t.id}>
              {isAdmin && <td>{name(t.userId)}</td>}
              <td>{t.vehicule}<br /><span className="mute">{t.immat}</span></td>
              <td>{t.depart} → {t.destination}</td><td>{fr(t.date)}</td>
              <td>{t.marchandise || "—"}{t.poids ? <><br /><span className="mute">{t.poids} kg</span></> : null}</td>
              <td><Badge v={t.statut} /></td>
              <td className="acts">
                <button className="ib" aria-label="Modifier" onClick={() => setForm(t)}><Icon n="edit" s={16} /></button>
                <button className="ib ib--red" aria-label="Supprimer" onClick={() => del(t)}><Icon n="trash" s={16} /></button>
              </td>
            </tr>
          ))}</tbody>
        </table>
        {rows.length === 0 && <p className="empty">{mine.length ? "Aucun résultat." : "Aucun trajet. Cliquez sur « Ajouter un trajet » pour commencer."}</p>}</div>
        <div className="foot2"><span>{rows.length} trajet{rows.length > 1 ? "s" : ""}</span><Pager page={p} pages={pages} set={setPage} /></div>
      </section>
    </>
  );
}

function TripForm({ start, me, all, isAdmin, trips, setTrips, close }) {
  const [f, setF] = useState(start);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = (e) => {
    e.preventDefault();
    const t = { ...f, vehicule: f.vehicule.trim(), immat: f.immat.trim(), depart: f.depart.trim(), destination: f.destination.trim(), marchandise: f.marchandise.trim() };
    if (t.id === null) setTrips([{ ...t, id: Date.now() }, ...trips]);
    else setTrips(trips.map((x) => (x.id === t.id ? t : x)));
    close();
  };
  return (
    <>
      <Head title={f.id === null ? "Ajouter un trajet" : "Modifier le trajet"} sub="Renseignez le véhicule utilisé et la marchandise transportée." />
      <form className="panel form" onSubmit={save}>
        <div className="grid2">
          {isAdmin ? (
            <F label="Employé"><select value={String(f.userId)} onChange={(e) => setF({ ...f, userId: all.find((u) => String(u.id) === e.target.value).id })}>{all.map((u) => <option key={u.id} value={String(u.id)}>{u.nom}</option>)}</select></F>
          ) : <F label="Employé"><input value={me.nom} disabled /></F>}
          <F label="Date"><input type="date" value={f.date} onChange={set("date")} required /></F>
          <F label="Véhicule"><input value={f.vehicule} onChange={set("vehicule")} placeholder="Dacia Logan" required /></F>
          <F label="Immatriculation"><input value={f.immat} onChange={set("immat")} placeholder="12345-A-6" /></F>
          <F label="Départ"><input value={f.depart} onChange={set("depart")} placeholder="Casablanca" required /></F>
          <F label="Destination"><input value={f.destination} onChange={set("destination")} placeholder="Rabat" required /></F>
          <F label="Marchandise transportée"><input value={f.marchandise} onChange={set("marchandise")} placeholder="Ordinateurs, imprimantes…" /></F>
          <F label="Poids (kg)"><input type="number" min="0" value={f.poids} onChange={set("poids")} placeholder="120" /></F>
          <F label="Statut"><select value={f.statut} onChange={set("statut")}><option>Planifié</option><option>En cours</option><option>Terminé</option></select></F>
        </div>
        <div className="act"><button type="button" className="btn btn--soft" onClick={close}>Annuler</button><button className="btn" type="submit">Enregistrer</button></div>
      </form>
    </>
  );
}

/* ---------- Profil ---------- */
export function Profile({ me, users, setUsers }) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ nom: me.nom, pw: "" });
  const [error, setError] = useState("");
  const save = async (e) => {
    e.preventDefault();
    if (f.pw && f.pw.length < 6) return setError("Le mot de passe doit contenir au moins 6 caractères.");
    const h = f.pw ? await hash(me.email, f.pw) : me.hash;
    setUsers(users.map((u) => (u.id === me.id ? { ...u, nom: f.nom.trim(), hash: h } : u)));
    setEdit(false); setError(""); setF({ ...f, pw: "" });
  };
  return (
    <>
      <Head title="Mon profil" sub="Informations de votre compte." />
      <section className="panel">
        <div className="prof">
          <Avatar s={72} />
          <div className="prof__id"><h2>{me.nom}</h2><p className="mute">{me.email}</p><Badge v={me.role} /></div>
          {!me.builtin && !edit && <button className="btn btn--ghost" onClick={() => { setF({ nom: me.nom, pw: "" }); setEdit(true); }}><Icon n="edit" s={15} />Modifier</button>}
        </div>
        {edit ? (
          <form className="form" onSubmit={save}>
            <div className="grid2">
              <F label="Nom complet"><input value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} required /></F>
              <F label="Nouveau mot de passe"><input type="password" value={f.pw} onChange={(e) => setF({ ...f, pw: e.target.value })} placeholder="Laisser vide pour ne pas changer" autoComplete="new-password" /></F>
            </div>
            {error && <p className="err" role="alert">{error}</p>}
            <div className="act"><button type="button" className="btn btn--soft" onClick={() => setEdit(false)}>Annuler</button><button className="btn" type="submit">Enregistrer</button></div>
          </form>
        ) : (
          <div className="info"><h3>Informations personnelles</h3>
            <div className="grid2">
              <div><span>Nom complet</span>{me.nom}</div><div><span>Rôle</span>{me.role}</div>
              <div><span>Email</span>{me.email}</div><div><span>Membre depuis</span>{fr(me.createdAt)}</div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
