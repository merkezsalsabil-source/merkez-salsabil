# Merkez Salsabil

Site vitrine multipage statique du Merkez Salsabil, en HTML, CSS et JavaScript. Chaque onglet principal ouvre maintenant sa propre page.

## Lancer le site dans VS Code

1. Ouvrir ce dossier dans VS Code.
2. Démarrer **Live Server** depuis `index.html` : cette page est l’accueil, puis les liens du menu ouvrent les autres pages.
3. Une connexion Internet permet de charger les polices Poppins, Caveat et Noto Naskh Arabic. Des polices système prennent le relais hors ligne.

## Fichiers

- `index.html` — page d’accueil et aperçu de l’approche du Merkez.
- `le-merkez.html` — présentation de l’institut, fondements, méthodologie, textes cités et savants de référence.
- `enseignements.html` — disciplines et matières enseignées.
- `programmes.html` — galerie de flyers séparée entre Hommes et Femmes.
- `tarifs.html` — grilles tarifaires, annonce de réduction fratrie et sessions intensives.
- `soutenir.html` — choix du moyen de don avec les logos PayPal et Revolut, consigne PayPal pour les dons personnels et projet mensuel de mushafs et de jilbebs pour les élèves qui en ont besoin.
- `lecture-ramadan.html` — programme de lecture du Coran sur 30 jours, avec suivi mémorisé dans le navigateur.
- `faq.html` — questions fréquentes.
- `contact.html` — contacts dédiés aux secrétariats Hommes et Femmes, Telegram et WhatsApp.
- `styles.css` — mise en page responsive, palette ivoire et or, détail rose pour l’espace femmes, pied de page à trois colonnes, témoignages et animations.
- `script.js` — menu mobile, choix du moyen de don, filtres de flyers, carrousel Hommes/Femmes automatique (un flyer toutes les 5 secondes) avec commandes, apparitions au défilement et agrandissement des affiches.
- `assets/affiches/` — affiches, grilles tarifaires, couvertures de livres et logos fournis.

Aucune compilation ni installation de dépendances n’est nécessaire. Les animations respectent le réglage système de réduction des mouvements.

## Effets modernes (novembre 2026)

Les effets sont regroupés à la fin de `styles.css` et de `script.js`, dans un bloc intitulé « Effets modernes — couche additive ». On peut retirer ces deux blocs sans toucher au reste du site.

- Transitions fluides entre les pages et envol de l’affiche vers la visionneuse (View Transitions).
- Titres qui apparaissent lettre par lettre, entrées en cascade, paragraphes éclairés mot à mot au défilement.
- Trame « MERKEZ SALSABIL » révélée par le curseur, affiche du carrousel inclinée en 3D, halo sur les cartes, boutons aimantés.
- En-tête qui s’efface en descendant, soulignement animé du menu, bouton de retour en haut avec anneau de progression.
- Affiches converties en WebP (les PNG d’origine restent dans `assets/affiches/` mais ne sont plus chargés), favicon et balises de partage.

## Corrections responsive (novembre 2026)

Bloc « Corrections responsive » à la fin de `styles.css` : le titre d’accueil se cale sur la largeur de sa colonne, l’accueil s’empile sous 620 px (titre puis affiche), les affiches de la page Programmes passent sur deux colonnes sur téléphone, les liens et boutons tactiles font au moins 40 px et les petits textes au moins 10 à 11 px.

## Menu regroupé et inscription (novembre 2026)

- Menu : Accueil, Le Merkez, **Cours** (Enseignements, Programmes, Tarifs), **Ressources** (Lecture Ramadan, Questions fréquentes, Règlement intérieur), Contact, Soutenir, et le bouton **S’inscrire**. Sur mobile, les deux groupes sont des accordéons.
- `inscription.html` : les quatre formulaires Google Forms (distanciel ou présentiel, en classe ou en individuel/duo/trio) et le rappel sur l’engagement. Pour changer un lien de formulaire, modifier le `href` de la carte correspondante dans cette page.
- Le pied de page contient aussi YouTube et TikTok, et un lien « Inscription ».
