# 🚀 Démarrage Rapide Backend

Bienvenue dans le guide de démarrage rapide du **Backend Smart Legal Contract** ! Ce guide vous accompagnera pour installer et configurer l'environnement backend en quelques minutes.

## Vue d'ensemble

Le backend Smart Legal Contract est composé de **deux éléments principaux** :

<div class="overview-grid">

<div class="overview-card backend">
  <div class="overview-icon">⚙️</div>
  <h3>Backend API</h3>
  <p>API FastAPI avec bibliothèque MSFSM pour la génération et déploiement des smart contracts</p>
  <div class="tech-stack">
    <span class="tech-tag">Python 3.11+</span>
    <span class="tech-tag">FastAPI</span>
    <span class="tech-tag">Poetry</span>
  </div>
</div>

<div class="overview-card blockchain">
  <div class="overview-icon">⛓️</div>
  <h3>Blockchain Locale</h3>
  <p>Nœud Ethereum de développement pour tester les smart contracts</p>
  <div class="tech-stack">
    <span class="tech-tag">Hardhat</span>
    <span class="tech-tag">Ethereum</span>
  </div>
</div>

</div>

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

<div class="prerequisites">
  <div class="prereq-section">
    <h4>Python</h4>
    <p><strong>Version 3.11+</strong> requis pour le backend</p>
  </div>
  
  <div class="prereq-section">
    <h4>Node.js</h4>
    <p><strong>Version 18+</strong> requis pour Hardhat</p>
  </div>
  
  <div class="prereq-section">
    <h4>Docker (Optionnel)</h4>
    <p>Pour l'option containerisée</p>
  </div>
  
  <div class="prereq-section">
    <h4>Bibliothèque MSFSM</h4>
    <p><strong>Bibliothèque interne</strong> pour la génération de smart contracts</p>
  </div>
</div>

## Installation Backend

### Étape 1 : Cloner le Projet Backend

```bash
# Cloner le backend
git clone <url-backend-repo> backend
cd backend

# OBLIGATOIRE : Cloner la bibliothèque msfsm
git clone https://git.litislab.fr/blockchain/projets/smartlogilabgroup/biblioth-ques/msfsm
```

### Étape 2 : Configuration des Dépendances

```bash
# Installer Poetry si nécessaire
curl -sSL https://install.python-poetry.org | python3 -

# Installer les dépendances Python
poetry install
poetry add --path ./msfsm
poetry add python-dotenv pydantic-settings python-jose[cryptography] passlib[bcrypt]

# Installer les dépendances Node.js pour Hardhat
npm install
```

Créez le fichier `.env.dev` dans le dossier backend :

```env
# API settings
API_PREFIX=/api/v1
API_TITLE=Multi-Scale Finite State Machine API
API_VERSION=1.0.0

# JWT settings
JWT_SECRET_KEY=your_secure_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Ethereum settings
ETHEREUM_PROVIDER_URL=http://localhost:8545
ETHEREUM_CHAIN_ID=31337
ETHEREUM_PUBLIC_KEY=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
ETHEREUM_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# API Key
API_KEY_HEADER_NAME=X-API-KEY
MASTER_KEY_NAME=sk_master_admin

# CORS
CORS_ALLOW_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Démarrage des Services Backend

### Option 1 : Script Automatique (Recommandé)

```bash
# Rendre le script exécutable
chmod +x start-dev.sh

# Lancer tous les services backend
./start-dev.sh
```

### Option 2 : Démarrage Manuel

**Terminal 1 - Blockchain locale :**
```bash
npx hardhat node
```

**Terminal 2 - API Backend :**
```bash
export APP_ENV=dev
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Option 3 : Docker

**Construire l'image Docker :**
```bash
docker build -t smart-legal-backend .
```

**Démarrer avec Docker Compose :**
```bash
# Backend uniquement
docker-compose up backend --build

# Ou en arrière-plan
docker-compose up -d backend --build
```

**Démarrer manuellement avec Docker :**
```bash
# Démarrer la blockchain locale
docker run -d -p 8545:8545 --name hardhat-node smart-legal-backend npx hardhat node

# Démarrer l'API
docker run -d -p 8000:8000 --name backend-api \
  --env-file .env.dev \
  smart-legal-backend python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Vérification de l'Installation

Une fois les services backend démarrés, vérifiez que tout fonctionne :

<div class="verification-grid">

<div class="verification-item">
  <div class="service-status">⚙️</div>
  <div>
    <h4>API Backend</h4>
    <p><a href="http://localhost:8000" target="_blank">http://localhost:8000</a></p>
    <span class="status-indicator">API et services backend</span>
  </div>
</div>

<div class="verification-item">
  <div class="service-status">📚</div>
  <div>
    <h4>Documentation API</h4>
    <p><a href="http://localhost:8000/docs" target="_blank">http://localhost:8000/docs</a></p>
    <span class="status-indicator">Interface Swagger automatique</span>
  </div>
</div>

<div class="verification-item">
  <div class="service-status">⛓️</div>
  <div>
    <h4>Nœud Ethereum</h4>
    <p><a href="http://localhost:8545" target="_blank">http://localhost:8545</a></p>
    <span class="status-indicator">Blockchain de développement</span>
  </div>
</div>

</div>

## Identifiants par Défaut

<div class="credentials-section">

<div class="credential-card admin">
  <h4>👤 Compte Administrateur</h4>
  <div class="credential-item">
    <span class="label">Email :</span>
    <code>admin@localhost.com</code>
  </div>
  <div class="credential-item">
    <span class="label">Mot de passe :</span>
    <code>admin123</code>
  </div>
</div>

<div class="credential-card api">
  <h4>🔐 Clé API Maître</h4>
  <div class="credential-item">
    <span class="label">API Key :</span>
    <code>pk_master_admin</code>
  </div>
</div>

</div>

## Scripts Utiles Backend

<div class="scripts-section">

<div class="script-group">
  <h4>Développement</h4>
  <div class="script-item">
    <code>./start-dev.sh</code>
    <span>Démarrage automatique complet</span>
  </div>
  <div class="script-item">
    <code>npx hardhat node</code>
    <span>Blockchain locale seulement</span>
  </div>
  <div class="script-item">
    <code>poetry run python -m uvicorn app.main:app --reload</code>
    <span>API seulement</span>
  </div>
</div>

<div class="script-group">
  <h4>Docker</h4>
  <div class="script-item">
    <code>docker-compose up backend --build</code>
    <span>Backend complet avec Docker</span>
  </div>
  <div class="script-item">
    <code>docker-compose down</code>
    <span>Arrêt et nettoyage</span>
  </div>
  <div class="script-item">
    <code>docker-compose logs -f backend</code>
    <span>Logs backend en temps réel</span>
  </div>
</div>

<div class="script-group">
  <h4>Tests & Debug</h4>
  <div class="script-item">
    <code>poetry run pytest</code>
    <span>Lancer les tests</span>
  </div>
  <div class="script-item">
    <code>poetry run python -m pytest --cov</code>
    <span>Tests avec couverture</span>
  </div>
  <div class="script-item">
    <code>poetry run python -c "import msfsm; print('MSFSM OK')"</code>
    <span>Vérifier MSFSM</span>
  </div>
</div>

</div>

## Résolution de Problèmes

<div class="troubleshooting">

<details>
<summary><strong>🚫 Erreur "Module msfsm not found"</strong></summary>
<div class="solution">
<p>La bibliothèque msfsm n'est pas installée correctement :</p>
<pre><code>git clone https://git.litislab.fr/blockchain/projets/smartlogilabgroup/biblioth-ques/msfsm
poetry add --path ./msfsm</code></pre>
</div>
</details>

<details>
<summary><strong>🔌 API ne démarre pas</strong></summary>
<div class="solution">
<p>Vérifiez la configuration et les dépendances :</p>
<ul>
<li>Vérifiez que Python 3.11+ est installé</li>
<li>Contrôlez le fichier <code>.env.dev</code></li>
<li>Vérifiez que le port 8000 n'est pas occupé</li>
<li>Lancez : <code>poetry install</code> pour réinstaller les dépendances</li>
</ul>
</div>
</details>

<details>
<summary><strong>⛓️ Blockchain inaccessible</strong></summary>
<div class="solution">
<p>Le nœud Hardhat n'est pas démarré :</p>
<pre><code>npx hardhat node</code></pre>
<p>Vérifiez que le port 8545 n'est pas utilisé par un autre service.</p>
</div>
</details>

<details>
<summary><strong>🐳 Problèmes Docker Backend</strong></summary>
<div class="solution">
<p>Nettoyez et reconstruisez les conteneurs backend :</p>
<pre><code>docker-compose down backend
docker-compose up backend --build --force-recreate</code></pre>
<p>Pour un nettoyage complet :</p>
<pre><code>docker system prune -a
docker-compose build --no-cache backend</code></pre>
</div>
</details>

<details>
<summary><strong>🔑 Problèmes d'authentification</strong></summary>
<div class="solution">
<p>Vérifiez la configuration JWT et API Keys :</p>
<ul>
<li>Contrôlez que <code>JWT_SECRET_KEY</code> est défini</li>
<li>Vérifiez que l'API Key <code>pk_master_admin</code> est correcte</li>
<li>Testez l'endpoint <code>/api/v1/health</code> sans authentification</li>
</ul>
</div>
</details>

</div>

<div class="success-message">
  <div class="success-icon">🎉</div>
  <div>
    <h4>Backend Configuré !</h4>
    <p>Votre backend Smart Legal Contract est maintenant opérationnel. L'API est accessible sur <code>http://localhost:8000</code> et la blockchain de développement sur <code>http://localhost:8545</code>.</p>
  </div>
</div>

<style>
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.overview-card {
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.overview-card.backend {
  border-top: 4px solid #10B981;
}

.overview-card.blockchain {
  border-top: 4px solid #8B5CF6;
}

.overview-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.overview-card h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
}

.overview-card p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.tech-stack {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.tech-tag {
  background: var(--vp-c-brand);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.prerequisites {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.prereq-section {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
}

.prereq-section h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
}

.prereq-section p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.verification-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.verification-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.service-status {
  font-size: 2rem;
  flex-shrink: 0;
}

.verification-item h4 {
  margin: 0 0 0.25rem 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
}

.verification-item p {
  margin: 0 0 0.25rem 0;
}

.verification-item a {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
}

.status-indicator {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.credentials-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.credential-card {
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.credential-card.admin {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05));
  border-color: var(--vp-c-brand);
}

.credential-card.api {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05));
  border-color: #8B5CF6;
}

.credential-card h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
}

.credential-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.credential-item .label {
  font-weight: 500;
  color: var(--vp-c-text-1);
  min-width: 100px;
}

.credential-item code {
  background: var(--vp-c-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand);
  border: 1px solid var(--vp-c-divider);
}

.scripts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.script-group {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.script-group h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
}

.script-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.script-item:last-child {
  border-bottom: none;
}

.script-item code {
  background: var(--vp-c-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  color: var(--vp-c-brand);
}

.script-item span {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.troubleshooting {
  margin: 2rem 0;
}

.troubleshooting details {
  margin-bottom: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.troubleshooting summary {
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.troubleshooting summary:hover {
  background: var(--vp-c-bg-alt);
}

.solution {
  padding: 1rem;
  background: var(--vp-c-bg);
}

.solution p {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-2);
}

.solution pre {
  background: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.9rem;
}

.solution ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  color: var(--vp-c-text-2);
}

.success-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 12px;
  margin: 3rem 0;
}

.success-icon {
  font-size: 3rem;
  flex-shrink: 0;
}

.success-message h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
}

.success-message p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .overview-grid,
  .prerequisites,
  .verification-grid,
  .credentials-section,
  .scripts-section {
    grid-template-columns: 1fr;
  }
  
  .verification-item {
    flex-direction: column;
    text-align: center;
  }
  
  .script-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .success-message {
    flex-direction: column;
    text-align: center;
  }
}
</style>