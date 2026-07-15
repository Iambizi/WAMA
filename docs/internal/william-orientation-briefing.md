Objet : La plate-forme WAMA est prête ! (Infos sur les nouveautés et la sécurité des données)

Salut William,

J'espère que tu vas bien. Je te confirme que la plate-forme WAMA est maintenant 100 % opérationnelle et prête à l'emploi. Suite à notre dernière discussion, j'ai intégré tous tes retours concernant le suivi des deals, les checklists de documents et les nouveaux critères pour qualifier les acheteurs.

Je sais que c'est toujours un peu délicat d'entrer des données clients sensibles au début, donc je voulais t'expliquer simplement comment la plate-forme est structurée pour protéger tes dossiers et garantir une confidentialité absolue. Tu vas voir, c'est vraiment blindé.

Voici un petit résumé des nouveautés actives et des mesures de sécurité en place.

---

### 1. Les nouveautés actives sur la plate-forme

*   **Suivi de préparation du deal (Deal Readiness) :** Tu peux maintenant suivre l'avancement d'un mandat à travers ses étapes clés :
    *   *Rencontre découverte $\rightarrow$ NDA signé $\rightarrow$ Documents reçus $\rightarrow$ Analyse préliminaire faite $\rightarrow$ Proposition de mandat envoyée $\rightarrow$ Mandat signé $\rightarrow$ Documentation prête (Teaser, CIM et Data room).*
*   **Checklists de documents détaillées :** J'ai mis à jour les indicateurs de préparation à la vente. Tu peux cocher la réception de documents précis (états financiers signés par un CPA pour les 5 dernières années, états financiers intérimaires de l'année en cours, listes détaillées des comptes clients/fournisseurs, organigramme des employés et détails des salaires). La plate-forme calcule automatiquement le score de préparation en fonction de ces éléments.
*   **Paramètres de deal personnalisables :** Quand tu ouvres une fiche de correspondance acheteur/vendeur, tu peux ajouter et modifier en direct la **valeur projetée du deal ($)** et la **date de clôture visée**, juste au-dessus de tes notes de suivi.
*   **Nouveaux critères acheteurs :** Pour mieux qualifier les acheteurs, tu peux maintenant saisir leur mise de fond (mise de fond disponible, provenance des fonds), la taille d'entreprise recherchée, l'EBITDA minimum souhaité, le nombre d'employés minimum, le temps d'existence de l'entreprise recherché et leur tolérance face à la concentration de clients.
*   **Options de financement enrichies :** Le menu déroulant intègre maintenant les structures comme la Balance de prix de vente (BPV / Vendor Take-Back), la dette mezzanine et les partenaires financiers/investisseurs privés.

---

### 2. Comment les données de tes clients sont protégées

Nous avons conçu WAMA avec une architecture ultra-sécurisée pour que tes dossiers et tes relations clients restent strictement confidentiels.

#### A. Hébergement et stockage sécurisés
Toutes les informations que tu saisis sont stockées dans une base de données cloud privée gérée par Convex.
*   **Chiffrement au repos :** Toutes les tables de la base de données sont chiffrées selon la norme AES-256.
*   **Chiffrement en transit :** Tous les échanges entre ton navigateur et la base de données passent par une connexion sécurisée TLS 1.3 (impossible d'intercepter les données).
*   **Accès réservé à l'administrateur :** L'accès à ton panneau de contrôle est strictement réservé à ton compte vérifié via le système d'authentification sécurisé Clerk. Les acheteurs et vendeurs externes qui se connectent n'ont accès qu'à leur propre profil d'onboarding, ils ne peuvent jamais fouiller dans tes dossiers ou voir d'autres entreprises.

#### B. Anonymisation stricte pour l'IA (Pas de données personnelles partagées)
WAMA utilise l'intelligence artificielle (Claude) pour analyser les critères et te suggérer des correspondances. Cependant, **les informations nominatives de tes clients ne sont jamais envoyées à l'IA.**
*   **Nettoyage automatique :** Avant d'exécuter une recherche de correspondance, le système retire de la requête les vrais noms, les adresses courriel, les numéros de téléphone, les noms d'entreprises exacts et tes notes confidentielles.
*   **Identifiants anonymes :** L'IA voit uniquement des codes de référence générés aléatoirement (par exemple, *Projet Boulangerie* devient *Projet Confidentiel Réf : b7d3d0*).
*   **Analyse de critères purs :** L'IA compare uniquement des chiffres et des tags : secteurs d'activité, régions larges (ex. Montérégie), tranches de revenus/EBITDA, nombre d'employés et la description du deal (que tu rédiges de manière anonyme).
*   **Zéro conservation des données :** Nous utilisons des API professionnelles sécurisées. Les fournisseurs d'IA n'ont légalement pas le droit de stocker tes requêtes ou de s'en servir pour entraîner leurs modèles.

#### C. Tableau récapitulatif des accès aux données

| Type de donnée | Visible par toi | Envoyé à l'IA pour matching | Visible par les acheteurs/vendeurs |
| :--- | :---: | :---: | :---: |
| **Noms et contacts clients** | **Oui** | **Non (Filtré)** | **Non** |
| **Nom réel de l'entreprise** | **Oui** | **Non (Filtré)** | **Non (Affiche "Projet Confidentiel")** |
| **Tes notes confidentielles** | **Oui** | **Non** | **Non** |
| **Fourchettes financières** | **Oui** | **Oui** (Par tranches) | **Oui** (Seulement si tu valides le match) |
| **Statut des checklists** | **Oui** | **Oui** (Pour calculer le score de fit) | **Oui** (Uniquement leur propre checklist) |
| **Valeur du deal / Date visée**| **Oui** | **Non** | **Non** |

---

La plate-forme est maintenant prête et sécurisée pour que tu puisses y entrer tes premiers dossiers clients et lancer tes recherches de matchings.

Fais-moi signe si tu veux qu'on se fasse un appel rapide pour que je te montre les nouveaux écrans, ou si tu as des questions sur le volet sécurité !

À bientôt,
