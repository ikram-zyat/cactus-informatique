# Cactus Informatique — gestion des utilisateurs et des trajets

Application web (React + Vite) de gestion des **utilisateurs** et de leurs **trajets** : les utilisateurs sont des employés qui utilisent des véhicules et déplacent de la marchandise.

> Version de démonstration en React d'une application développée avec **Laravel 9** pendant un stage professionnel (Cactus Informatique, avril 2023). GitHub Pages ne peut pas exécuter Laravel : cette version fonctionne entièrement dans le navigateur.

**Site en ligne :** https://VOTRE-NOM.github.io/cactus-informatique/

## Fonctionnalités
- Connexion avec e-mail et mot de passe, option « Se souvenir de moi », déconnexion avec confirmation
- **Administrateur** : tableau de bord, gestion des utilisateurs (ajout, modification, suppression, recherche, pagination, rôle et statut), gestion de tous les trajets
- **Utilisateur** : ses propres trajets (véhicule, immatriculation, départ, destination, marchandise, poids, statut) et son profil
- Un compte inactif ne peut pas se connecter
- Affichage adapté au téléphone

## Technologies
React 18, Vite 5, CSS, GitHub Actions et GitHub Pages.

## Lancer en local
```bash
npm install
npm run make-admin   # crée le compte administrateur (une seule fois)
npm run dev
```

## Compte administrateur
`npm run make-admin` demande un nom, un e-mail et un mot de passe (12 caractères minimum), puis écrit une empreinte du mot de passe dans `src/admin.config.js`. Publiez ce fichier avec Git. Personne ne peut créer de compte administrateur depuis le site : seul l'administrateur connecté peut ajouter des utilisateurs.

## Note
Le site est statique : il n'y a ni serveur ni base de données. Les utilisateurs et les trajets sont enregistrés **dans le navigateur** de chaque visiteur. Les mots de passe des utilisateurs sont hachés, mais ce n'est pas une vraie sécurité. Pour un usage réel, il faudrait un backend (par exemple Laravel).
