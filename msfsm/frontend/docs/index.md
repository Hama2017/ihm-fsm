---
layout: home

hero:
  name: "Smart Legal Contract"
  text: "Transformez vos contrats en smart contracts"
  tagline: "Une plateforme innovante qui révolutionne la transformation de contrats traditionnels en smart contracts juridiquement valides sur blockchain Ethereum"
  image:
    src: /logo-final.svg
    alt: SLC Logo
    class: hero-logo-pulse
  actions:
    - theme: brand
      text: 🚀 Démarrage rapide
      link: /getting-started
    - theme: alt
      text: 📖 Guide complet
      link: /guide/
    - theme: alt
      text: 🔗 GitHub
      link: https://github.com/Hama2017/ihm-fsm
      target: _blank

features:
  - icon: ⚡
    title: Interface intuitive
    details: Modélisez, gérez facilement vos contrats et exécutez leurs fonctions directement depuis une interface graphique moderne basée sur Vue 3 et Vue Flow

  - icon: 🔐
    title: Sécurité renforcée
    details: Système d'authentification sécurisé, gestion fine des rôles et interactions fiables avec les contrats déployés

  - icon: 📱
    title: Accessibilité 
    details: Interface responsive compatible mobile, multilingue et dotée d'un mode sombre pour une meilleure expérience utilisateur


---

<div class="home-content">

## Qu'est-ce que Smart Legal Contract ?

**SLC (Smart Legal Contract)** est une plateforme révolutionnaire qui permet de transformer des contrats légaux traditionnels en smart contracts déployables sur la blockchain Ethereum. Notre approche unique utilise des **automates à états finis multi-échelle (MSFSM)** pour modéliser la complexité juridique et automatiser le processus de transformation.

La plateforme favorise une interaction sécurisée entre les différentes parties prenantes en créant un pont entre le monde juridique traditionnel et l'écosystème blockchain décentralisé.

## Comment ça marche ?

<div class="process-steps">

<div class="step">
  <div class="step-number">1</div>
  <div class="step-content">
    <h3>📄 Contrat Traditionnel</h3>
    <p>Partez de votre contrat légal existant - bail, vente, prestation de service, etc. Analysez les clauses, conditions et événements déclencheurs.</p>
  </div>
</div>

<div class="step">
  <div class="step-number">2</div>
  <div class="step-content">
    <h3>🎨 Modélisation en Automates</h3>
    <p>Utilisez notre interface graphique basée sur Vue Flow pour créer des automates SLCA (Smart Legal Contract Automaton) représentant votre contrat sous forme d'états, transitions et conditions.</p>
  </div>
</div>

<div class="step">
  <div class="step-number">3</div>
  <div class="step-content">
    <h3>🚀 Déploiement Automatique</h3>
    <p>Grâce à l'API, qui s'appuie sur la bibliothèque MSFSM, le DAG (Directed Acyclic Graph) est utilisé pour générer le code Solidity, le compiler, puis le déployer automatiquement sur la blockchain Ethereum.</p>
  </div>
</div>

<div class="step">
  <div class="step-number">4</div>
  <div class="step-content">
    <h3>⚡ Interaction & Gestion</h3>
    <p>Interagissez avec votre smart legal contract déployé, visualisez son état en temps réel et gérez son cycle de vie complet.</p>
  </div>
</div>

</div>

## Architecture Générale

Le système repose sur une **architecture modulaire en trois couches principales** :

<div class="architecture-grid">

  <div class="arch-card frontend">
    <div class="arch-icon">
      🎨
    </div>
    <h3>Frontend (Vue 3)</h3>
    <p>
      Permet à l'utilisateur de modéliser ses contrats sous forme d'automates graphiques, de gérer l'ensemble du cycle de vie du contrat (création, édition, suppression, redéploiement), de consulter des statistiques, et de se connecter via une interface sécurisée. Il transforme les automates en DAG avant de les transmettre à l'API.
    </p>
  </div>

  <div class="arch-card backend">
    <div class="arch-icon">
      ⚙️
    </div>
    <h3>Backend (FastAPI)</h3>
    <p>
      Fournit une API RESTful complète pour la gestion des contrats intelligents, des utilisateurs, des profils, des clés API et des packages. Il permet de créer, compiler, déployer et exécuter des smart contracts à partir d'une spécification DAG, en s'appuyant sur la bibliothèque MSFSM. Il gère également toute l'authentification utilisateur, la gestion des profils.
    </p>
  </div>

  <div class="arch-card library">
    <div class="arch-icon">
      📚
    </div>
    <h3>Bibliothèque MSFSM (Python)</h3>
    <p>
      Composant interne dédié à la logique multi-échelle. Elle génère, compile, déploie et exécute les smart contracts Solidity à partir d'une spécification DAG (graphe orienté acyclique) fournie par le backend. Elle constitue le moteur technique central du système.
    </p>
  </div>

</div>

## Fonctionnalités

### Pour les Utilisateurs

<div class="features-grid">

<div class="feature-card">
  <div class="feature-icon">🧩</div>
  <h4>Gestion des SLCA (Smart Legal Contract Automaton)</h4>
  <p>Création, modification et suppression d'automates. Détection automatique d'erreurs, boucles infinies et états isolés. Transformation en SLC déployable.</p>
</div>

<div class="feature-card">
  <div class="feature-icon">📄</div>
  <h4>Gestion des SLC (Smart Legal Contracts)</h4>
  <p>Déploiement sécurisé sur blockchain, visualisation temps réel de l'état du contrat et interaction utilisateur avec l'ABI générée.</p>
</div>

<div class="feature-card">
  <div class="feature-icon">📁</div>
  <h4>Import / Export</h4>
  <p>Export SLCA au format .slc.json, import d'automates existants.</p>
</div>

<div class="feature-card">
  <div class="feature-icon">📊</div>
  <h4>Tableau de Bord</h4>
  <p>Vue d'ensemble des SLCA et SLC, statistiques personnelles, courbes d'évolution et suivi des interactions.</p>
</div>

<div class="feature-card">
  <div class="feature-icon">🔐</div>
  <h4>Authentification</h4>
  <p>Inscription et connexion sécurisées avec accès à un espace personnel dédié et gestion des sessions.</p>
</div>

<div class="feature-card">
  <div class="feature-icon">🌍</div>
  <h4>Multilingue & Thème</h4>
  <p>Interface disponible en français et anglais, mode sombre/clair avec sélecteur intégré.</p>
</div>

</div>

### Pour les Administrateurs

<div class="admin-features">

<div class="admin-card">
  <div class="admin-icon">📦</div>
  <h4>Gestion des Packages</h4>
  <p>Création de packages préconfigurés, modification et suppression, import/export.</p>
</div>

<div class="admin-card">
  <div class="admin-icon">📈</div>
  <h4>Supervision</h4>
  <p>Statistiques globales de la plateforme, suivi de l'activité générale et métriques d'usage.</p>
</div>

<div class="admin-card">
  <div class="admin-icon">🔑</div>
  <h4>Clés API</h4>
  <p>Génération et gestion des clés API, révocation, suivi des quotas.</p>
</div>

</div>

## Stack Technique

### Frontend

<div class="tech-grid">

<div class="tech-card">
  <div class="tech-icon">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" alt="Vue.js" width="32" height="32">
  </div>
  <h4>Vue 3</h4>
  <p>Framework JavaScript moderne avec Composition API pour une architecture réactive et maintenable</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" alt="Vite" width="32" height="32">
  </div>
  <h4>Vite</h4>
  <p>Outil de build ultra-rapide avec hot reload instantané pour le développement</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
  <h4>Pinia</h4>
  <p>Gestion d'état moderne et type-safe pour une architecture scalable</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
    <img src="https://www.google.com/s2/favicons?domain=vueflow.dev&sz=256" alt="Logo Vue Flow" width="32" height="32" />
  </div>
  <h4>Vue Flow</h4>
  <p>Éditeur d'automates interactif pour la modélisation visuelle des contrats</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Tailwind CSS" width="32" height="32">
  </div>
  <h4>Tailwind CSS</h4>
  <p>Framework CSS utility-first pour un design system cohérent et moderne</p>
</div>

</div>

### Backend

<div class="tech-grid">

<div class="tech-card">
  <div class="tech-icon">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" alt="FastAPI" width="32" height="32">
  </div>
  <h4>FastAPI</h4>
  <p>API RESTful rapide et typée avec documentation automatique Swagger/OpenAPI</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
    <img src="https://avatars.githubusercontent.com/u/110818415?s=200&v=4" alt="Python" width="32" height="32">
  </div>
  <h4>Pydantic</h4>
  <p>Validation des données et gestion des schémas avec typage strict Python</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
       <img src="https://i.postimg.cc/YC4L8FXK/icon-msfsm.png" alt="MSFSM" width="32" height="32">
  </div>
  <h4>MSFSM</h4>
  <p>Bibliothèque interne pour générer, compiler et déployer des contrats Solidity</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" width="32" height="32">
  </div>
  <h4>Hardhat</h4>
  <p>Environnement de développement pour compilation et déploiement Solidity</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 7l10 5 10-5-10-5zM3 17l10 5 10-5M3 12l10 5 10-5" stroke="#EF4444" stroke-width="2"/>
    </svg>
  </div>
  <h4>Poetry</h4>
  <p>Gestion moderne des dépendances Python et packaging</p>
</div>

</div>

### Infrastructure

<div class="tech-grid">

<div class="tech-card">
  <div class="tech-icon">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" alt="Docker" width="32" height="32">
  </div>
  <h4>Docker</h4>
  <p>Containerisation complète avec Docker Compose pour un déploiement simplifié</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg" alt="NGINX" width="32" height="32">
  </div>
  <h4>NGINX</h4>
  <p>Serveur web haute performance pour servir l'interface en production</p>
</div>

<div class="tech-card">
  <div class="tech-icon">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#10B981" stroke-width="2" fill="none"/>
      <polyline points="14,2 14,8 20,8" stroke="#10B981" stroke-width="2" fill="none"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="#10B981" stroke-width="2"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="#10B981" stroke-width="2"/>
    </svg>
  </div>
  <h4>Stockage JSON</h4>
  <p>Stockage de données via fichiers JSON pour simplicité et portabilité</p>
</div>

</div>

## 🎨 Design System

### Palette de Couleurs

<div class="color-palette">

<div class="color-section">
  <h4>Couleurs Principales</h4>
  <div class="color-row">
    <div class="color-item">
      <div class="color-swatch" style="background: #3B82F6;"></div>
      <span>Blue Primary</span>
      <code>#3B82F6</code>
    </div>
    <div class="color-item">
      <div class="color-swatch" style="background: #06B6D4;"></div>
      <span>Cyan Accent</span>
      <code>#06B6D4</code>
    </div>
    <div class="color-item">
      <div class="color-swatch" style="background: #8B5CF6;"></div>
      <span>Purple</span>
      <code>#8B5CF6</code>
    </div>
  </div>
</div>

<div class="color-section">
  <h4>Couleurs de Statut</h4>
  <div class="color-row">
    <div class="color-item">
      <div class="color-swatch" style="background: #10B981;"></div>
      <span>Success</span>
      <code>#10B981</code>
    </div>
    <div class="color-item">
      <div class="color-swatch" style="background: #F59E0B;"></div>
      <span>Warning</span>
      <code>#F59E0B</code>
    </div>
    <div class="color-item">
      <div class="color-swatch" style="background: #EF4444;"></div>
      <span>Error</span>
      <code>#EF4444</code>
    </div>
  </div>
</div>

</div>

### Typographie

<div class="typography">

<div class="type-sample">
  <h1 class="type-h1">Heading 1 - Bold 36px</h1>
  <code>font-size: 36px; font-weight: 700;</code>
</div>

<div class="type-sample">
  <h2 class="type-h2">Heading 2 - Semibold 24px</h2>
  <code>font-size: 24px; font-weight: 600;</code>
</div>

<div class="type-sample">
  <p class="type-body">Body Text - Regular 16px</p>
  <code>font-size: 16px; font-weight: 400;</code>
</div>

</div>

## 🎨 Philosophie du Logo

La création du logo SLC suit une approche progressive qui illustre parfaitement la transformation du juridique traditionnel vers l'innovation blockchain :

<div class="logo-philosophy">

<div class="logo-steps">

<div class="logo-step">
  <div class="step-indicator">
    <div class="step-dot active">1</div>
    <div class="step-line"></div>
  </div>
  <div class="logo-step-content">
    <div class="logo-visual">
      <svg width="80" height="96" viewBox="0 0 105 126" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M52.4167 3L102.833 33V93L52.4167 123L2 93V33L52.4167 3Z" stroke="#3B82F6" stroke-width="4"/>
      </svg>
    </div>
    <div class="logo-explanation">
      <h3>🔷 Structure Blockchain</h3>
      <p><strong>L'hexagone</strong> représente la solidité de l'architecture blockchain. Cette forme géométrique évoque la structure décentralisée, la sécurité cryptographique et la modularité technique qui caractérisent l'écosystème Ethereum.</p>
    </div>
  </div>
</div>

<div class="logo-step">
  <div class="step-indicator">
    <div class="step-dot active">2</div>
    <div class="step-line"></div>
  </div>
  <div class="logo-step-content">
    <div class="logo-visual">
      <svg width="50" height="60" viewBox="0 0 105 126" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M66.5333 38H38.3C34.9587 38 32.25 40.6863 32.25 44V82C32.25 85.3137 34.9587 88 38.3 88H66.5333C69.8747 88 72.5833 85.3137 72.5833 82V44C72.5833 40.6863 69.8747 38 66.5333 38Z" fill="#3B82F6"/>
        <path d="M38.2998 48H66.5331" stroke="white" stroke-width="2"/>
        <path d="M38.2998 56H62.4998" stroke="white" stroke-width="2"/>
        <path d="M38.2998 64H58.4665" stroke="white" stroke-width="2"/>
      </svg>
    </div>
    <div class="logo-explanation">
      <h3>📄 Contrat Traditionnel</h3>
      <p><strong>Le document</strong> symbolise les contrats légaux traditionnels avec leurs clauses, conditions et articles. Il représente l'expertise juridique, la rigueur documentaire et la validité légale qui constituent la base de notre transformation.</p>
    </div>
  </div>
</div>

<div class="logo-step">
  <div class="step-indicator">
    <div class="step-dot active">3</div>
  </div>
  <div class="logo-step-content">
    <div class="logo-visual">
      <svg width="100" height="120" viewBox="0 0 105 126" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-final">
        <path d="M52.4167 3L102.833 33V93L52.4167 123L2 93V33L52.4167 3Z" stroke="url(#logoGradient)" stroke-width="4"/>
        <path d="M66.5333 38H38.3C34.9587 38 32.25 40.6863 32.25 44V82C32.25 85.3137 34.9587 88 38.3 88H66.5333C69.8747 88 72.5833 85.3137 72.5833 82V44C72.5833 40.6863 69.8747 38 66.5333 38Z" fill="url(#logoGradient)"/>
        <path d="M38.2998 48H66.5331" stroke="white" stroke-width="2"/>
        <path d="M38.2998 56H62.4998" stroke="white" stroke-width="2"/>
        <path d="M38.2998 64H58.4665" stroke="white" stroke-width="2"/>
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3B82F6"/>
            <stop offset="100%" stop-color="#06B6D4"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="logo-explanation">
      <h3>⚡ Smart Legal Contract</h3>
      <p><strong>La fusion finale</strong> unit harmonieusement juridique et technologie. Le dégradé bleu vers cyan symbolise cette transformation innovante qui préserve la validité légale tout en apportant l'automatisation et la transparence de la blockchain.</p>
    </div>
  </div>
</div>

</div>

<div class="color-symbolism">
  <h4>🎨 Symbolisme des Couleurs</h4>
  <div class="color-meanings">
    <div class="color-meaning">
      <div class="color-badge blue"></div>
      <div>
        <strong>Bleu Principal (#3B82F6)</strong>
        <p>Confiance, sécurité et professionnalisme juridique</p>
      </div>
    </div>
    <div class="color-meaning">
      <div class="color-badge cyan"></div>
      <div>
        <strong>Cyan Accent (#06B6D4)</strong>
        <p>Innovation, technologie et futurisme blockchain</p>
      </div>
    </div>
    <div class="color-meaning">
      <div class="color-badge gradient"></div>
      <div>
        <strong>Dégradé Innovant</strong>
        <p>Transformation et évolution du traditionnel vers le digital</p>
      </div>
    </div>
  </div>
</div>

</div>

</div>

<style>

.home-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Animation pulse pour le logo du hero - FORCER LA TAILLE */
.hero-logo-pulse,
.VPHero .VPImage,
.VPHero .VPImage img,
.vp-doc img.hero-logo-pulse,
img.hero-logo-pulse {
  animation: pulse 3s ease-in-out infinite !important;
  transform-origin: center !important;
  width: 400px !important;
  height: 480px !important;
  max-width: 400px !important;
  max-height: 480px !important;
  min-width: 400px !important;
  min-height: 480px !important;
  margin-top: -200px;

}

/* Cibler spécifiquement le conteneur VitePress */
.VPHero .container .main .image {
  width: 400px !important;
  height: 480px !important;
}

.VPHero .image {
  width: 400px !important;
  height: 480px !important;
}

/* Sur tablet, encore grand */
@media (max-width: 1024px) {
  .hero-logo-pulse,
  .VPHero .VPImage,
  .VPHero .VPImage img,
  .vp-doc img.hero-logo-pulse,
  img.hero-logo-pulse {
    width: 320px !important;
    height: 384px !important;
    max-width: 320px !important;
    max-height: 384px !important;
    min-width: 320px !important;
    min-height: 384px !important;
  }
  
  .VPHero .container .main .image,
  .VPHero .image {
    width: 320px !important;
    height: 384px !important;
  }
}

/* Sur mobile, garde une taille visible */
@media (max-width: 768px) {
  .hero-logo-pulse,
  .VPHero .VPImage,
  .VPHero .VPImage img,
  .vp-doc img.hero-logo-pulse,
  img.hero-logo-pulse {
    width: 250px !important;
    height: 300px !important;
    max-width: 250px !important;
    max-height: 300px !important;
    min-width: 250px !important;
    min-height: 300px !important;
  }
  
  .VPHero .container .main .image,
  .VPHero .image {
    width: 250px !important;
    height: 300px !important;
  }
}

@media (max-width: 480px) {
  .hero-logo-pulse,
  .VPHero .VPImage,
  .VPHero .VPImage img,
  .vp-doc img.hero-logo-pulse,
  img.hero-logo-pulse {
    width: 200px !important;
    height: 240px !important;
    max-width: 200px !important;
    max-height: 240px !important;
    min-width: 200px !important;
    min-height: 240px !important;
  }
  
  .VPHero .container .main .image,
  .VPHero .image {
    width: 200px !important;
    height: 240px !important;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.process-steps {
  display: grid;
  gap: 2rem;
  margin: 2rem 0;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.step-number {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #3B82F6, #06B6D4);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.step-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.step-content p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.architecture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.arch-card {
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.arch-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.arch-card.frontend {
  border-top: 4px solid #3B82F6;
}

.arch-card.backend {
  border-top: 4px solid #10B981;
}

.arch-card.library {
  border-top: 4px solid #8B5CF6;
}

.arch-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 2rem;
  color: var(--vp-c-brand-1);
}

.arch-card h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
}

.arch-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  text-align: left;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.feature-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
}

.feature-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

.admin-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.admin-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #8B5CF6, #3B82F6);
  color: white;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.admin-card:hover {
  transform: translateY(-2px);
}

.admin-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.admin-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.admin-card p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.9;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.tech-card {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tech-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tech-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.tech-icon img {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.tech-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 600;
}

.tech-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  line-height: 1.4;
}

.color-palette {
  margin: 2rem 0;
}

.color-section {
  margin-bottom: 2rem;
}

.color-section h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
}

.color-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  min-width: 120px;
}

.color-swatch {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.color-item span {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.color-item code {
  font-size: 0.8rem;
  background: var(--vp-c-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: var(--vp-c-text-2);
}

.typography {
  margin: 2rem 0;
}

.type-sample {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

.type-sample code {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.type-h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--vp-c-text-1);
}

.type-h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--vp-c-text-1);
}

.type-body {
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  color: var(--vp-c-text-1);
}

/* Philosophie du Logo - Nouvelle section étape par étape */
.logo-philosophy {
  margin: 3rem 0;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
}

.logo-steps {
  margin: 2rem 0;
}

.logo-step {
  display: flex;
  margin-bottom: 3rem;
  position: relative;
}

.logo-step:last-child {
  margin-bottom: 0;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 2rem;
  flex-shrink: 0;
}

.step-dot {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3B82F6, #06B6D4);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  z-index: 2;
}

.step-line {
  width: 2px;
  height: 100px;
  background: linear-gradient(to bottom, #3B82F6, #06B6D4);
  margin-top: 1rem;
}

.logo-step:last-child .step-line {
  display: none;
}

.logo-step-content {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.logo-step-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  flex-shrink: 0;
}

.logo-final {
  animation: logoSlow 4s ease-in-out infinite;
}

@keyframes logoSlow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}

.logo-explanation {
  flex: 1;
}

.logo-explanation h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
  font-weight: 600;
}

.logo-explanation p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.logo-explanation strong {
  color: var(--vp-c-brand);
  font-weight: 600;
}

.color-symbolism {
  margin-top: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05));
  border-radius: 12px;
  border: 1px solid var(--vp-c-brand-lightest);
}

.color-symbolism h4 {
  margin: 0 0 1.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
}

.color-meanings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.color-meaning {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.color-badge {
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.color-badge.blue {
  background: #3B82F6;
}

.color-badge.cyan {
  background: #06B6D4;
}

.color-badge.gradient {
  background: linear-gradient(135deg, #3B82F6, #06B6D4);
}

.color-meaning strong {
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}

.color-meaning p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .step {
    flex-direction: column;
    text-align: center;
  }
  
  .architecture-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .tech-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .color-row {
    justify-content: center;
  }
  
  .logo-step {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .step-indicator {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .step-line {
    display: none;
  }
  
  .logo-step-content {
    flex-direction: column;
    text-align: center;
  }
  
  .color-meanings {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .home-content {
    padding: 1rem 0.5rem;
  }
  
  .step {
    padding: 1rem;
  }
  
  .step-number {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }
  
  .arch-card, .feature-card, .tech-card {
    padding: 1rem;
  }
  
  .logo-philosophy {
    padding: 1rem;
  }
  
  .logo-step-content {
    padding: 1rem;
  }
}
</style>