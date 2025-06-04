# Backend - Présentation de l'API

L'API **Smart Legal Contract** est le cœur technique de la plateforme, construite avec **FastAPI** pour offrir des performances optimales et une documentation automatique. Elle transforme les spécifications d'automates en smart contracts déployables sur la blockchain Ethereum grâce à la bibliothèque MSFSM, tout en permettant de gérer et administrer la couche métier de la plateforme, incluant l'authentification, le CRUD des contrats, les SLA et les Smart Legal Contracts (SLC).



##  Architecture Générale

L'API suit une **architecture en couches** moderne et modulaire pour assurer la maintenabilité et la scalabilité :

<div class="architecture-overview">

<div class="layer-card api-layer">
  <div class="layer-icon">🌐</div>
  <h3>Couche API</h3>
  <p>Routes FastAPI avec validation automatique des données, documentation Swagger intégrée et gestion des erreurs standardisée.</p>
</div>

<div class="layer-card service-layer">
  <div class="layer-icon">⚙️</div>
  <h3>Couche Services</h3>
  <p>Logique métier pour la gestion des contrats, déploiement blockchain et orchestration des opérations complexes.</p>
</div>

<div class="layer-card repo-layer">
  <div class="layer-icon">💾</div>
  <h3>Couche Données</h3>
  <p>Repositories pour l'accès aux données avec stockage JSON performant et gestion automatique des fichiers.</p>
</div>

</div>

## Structure des Dossiers

L'organisation du code suit les bonnes pratiques de développement Python moderne :

<div class="folder-structure">

<div class="folder-section">
  <h4>🔐 Authentication (`app/auth/`)</h4>
  <div class="folder-details">
    <p><strong>Système d'authentification complet</strong> avec JWT, gestion des rôles, et profils utilisateurs. Inclut les routes de connexion, inscription, et gestion des mots de passe.</p>
  </div>
</div>

<div class="folder-section">
  <h4>🛡️ API Keys (`app/api_keys/`)</h4>
  <div class="folder-details">
    <p><strong>Gestion des clés API</strong> pour l'accès sécurisé aux endpoints. Création, révocation, et suivi de l'utilisation des clés avec quotas configurables.</p>
  </div>
</div>

<div class="folder-section">
  <h4>🔧 Services (`app/services/`)</h4>
  <div class="folder-details">
    <p><strong>Logique métier</strong> pour les contrats automatiques, smart contracts, et packages. Orchestration du déploiement et de l'exécution des contrats.</p>
  </div>
</div>

<div class="folder-section">
  <h4>📊 Repositories (`app/repositories/`)</h4>
  <div class="folder-details">
    <p><strong>Accès aux données</strong> avec un système de repository générique pour les opérations CRUD sur fichiers JSON. Abstraction complète du stockage.</p>
  </div>
</div>

<div class="folder-section">
  <h4>🌐 API Routes (`app/api/routes/`)</h4>
  <div class="folder-details">
    <p><strong>Endpoints REST</strong> organisés par domaine fonctionnel. Validation automatique, documentation Swagger, et gestion des erreurs intégrée.</p>
  </div>
</div>

<div class="folder-section">
  <h4>⚡ CLI (`app/cli/`)</h4>
  <div class="folder-details">
    <p><strong>Interface en ligne de commande</strong> pour l'administration système, gestion des utilisateurs, et maintenance de la plateforme.</p>
  </div>
</div>

</div>

## Système d'Authentification

Le système d'authentification offre une **sécurité multi-niveaux** adaptée aux besoins modernes :

<div class="auth-features">

<div class="auth-feature">
  <div class="feature-icon">🔑</div>
  <h4>JWT & Cookies</h4>
  <p>Support des tokens JWT via header Authorization ET cookies HTTP-only sécurisés pour les clients web. Refresh tokens automatiques avec expiration configurable.</p>
</div>

<div class="auth-feature">
  <div class="feature-icon">👥</div>
  <h4>Gestion des Rôles</h4>
  <p>Système de rôles granulaire (Admin/User) avec permissions spécifiques. Contrôle d'accès automatique sur les endpoints sensibles.</p>
</div>

<div class="auth-feature">
  <div class="feature-icon">🛡️</div>
  <h4>Sécurité Avancée</h4>
  <p>Hachage bcrypt des mots de passe, protection CORS configurable, et validation stricte des données d'entrée avec Pydantic.</p>
</div>

<div class="auth-feature">
  <div class="feature-icon">👤</div>
  <h4>Profils Utilisateurs</h4>
  <p>Gestion complète des profils avec upload d'images, modification des informations personnelles, et historique des actions.</p>
</div>

</div>

### Flux d'Authentification

<div class="auth-flow">

<div class="flow-step">
  <div class="step-number">1</div>
  <div class="step-content">
    <h5>Inscription/Connexion</h5>
    <p>L'utilisateur s'inscrit ou se connecte via l'endpoint `/auth/login`. Validation des credentials et génération des tokens.</p>
  </div>
</div>

<div class="flow-step">
  <div class="step-number">2</div>
  <div class="step-content">
    <h5>Token Management</h5>
    <p>Génération d'un JWT access token (courte durée) et d'un refresh token (longue durée). Stockage sécurisé côté client.</p>
  </div>
</div>

<div class="flow-step">
  <div class="step-number">3</div>
  <div class="step-content">
    <h5>Accès Sécurisé</h5>
    <p>Chaque requête inclut le token d'accès. Validation automatique par les middlewares avec vérification des permissions.</p>
  </div>
</div>

<div class="flow-step">
  <div class="step-number">4</div>
  <div class="step-content">
    <h5>Renouvellement</h5>
    <p>Refresh automatique des tokens expirés via `/auth/refresh`. Maintien de la session utilisateur sans interruption.</p>
  </div>
</div>

</div>

## Système de Clés API

La gestion des clés API assure un **contrôle d'accès robuste** pour tous les clients de l'API :

<div class="api-key-system">

<div class="api-key-feature">
  <div class="key-icon">🎫</div>
  <h4>Génération Sécurisée</h4>
  <p>Clés API cryptographiquement sécurisées avec préfixe `sk_` pour identification. Génération automatique avec entropy élevée.</p>
</div>

<div class="api-key-feature">
  <div class="key-icon">📊</div>
  <h4>Suivi d'Utilisation</h4>
  <p>Compteurs d'utilisation en temps réel, quotas configurables par clé, et historique complet des requêtes effectuées.</p>
</div>

<div class="api-key-feature">
  <div class="key-icon">🔒</div>
  <h4>Contrôle Granulaire</h4>
  <p>Activation/désactivation instantanée, labels personnalisés, et révocation immédiate pour une sécurité maximale.</p>
</div>

<div class="api-key-feature">
  <div class="key-icon">⚡</div>
  <h4>Administration Simplifiée</h4>
  <p>Interface d'administration dédiée pour les admins, création en masse, et gestion centralisée de toutes les clés actives.</p>
</div>

</div>

### Utilisation des Clés API

```http
GET /api/v1/contracts/
X-API-KEY: sk_your_secret_api_key_here
Authorization: Bearer your_jwt_token_here
```

La **double authentification** (clé API + JWT) garantit une sécurité maximale pour toutes les opérations.

##  Gestion des Erreurs

Le système de gestion d'erreurs fournit un **feedback précis et localisable** :

<div class="error-system">

<div class="error-category">
  <h4>🔍 Codes d'Erreur Structurés</h4>
  <div class="error-examples">
    <div class="error-example">
      <code>auth.invalid_credentials</code>
      <span>Identifiants incorrects</span>
    </div>
    <div class="error-example">
      <code>contract.not_found</code>
      <span>Contrat introuvable</span>
    </div>
    <div class="error-example">
      <code>package.already_exists</code>
      <span>Package déjà existant</span>
    </div>
  </div>
</div>

<div class="error-category">
  <h4>🌍 Internationalisation</h4>
  <p>Codes d'erreur conçus pour la traduction automatique côté frontend. Structure hiérarchique claire : <code>domaine.type_erreur</code></p>
</div>

<div class="error-category">
  <h4>📝 Détails Contextuels</h4>
  <p>Informations détaillées sur chaque erreur avec suggestions de résolution et données contextuelles pour le debugging.</p>
</div>

</div>

### Format de Réponse d'Erreur

```json
{
  "code": "contract.deployment_failed",
  "message": "Contract deployment failed: Insufficient gas",
  "details": {
    "contract_name": "MonContrat",
    "gas_required": 2000000,
    "gas_provided": 1500000
  }
}
```

##  Fonctionnalités Principales

###  Gestion des Contrats Automatiques

<div class="feature-section">
<div class="feature-header">
<h4>Smart Legal Contract Automaton (SLCA)</h4>
</div>
<div class="feature-content">
<p>Création, modification et validation d'automates représentant la logique contractuelle. Support complet des états, transitions, et conditions avec détection automatique des erreurs de structure.</p>

<strong>Fonctionnalités clés :</strong>

<div class="features-grid">
<div class="feature-item">
<div class="feature-icon">✅</div>
<div class="feature-text">Validation de la structure des automates</div>
</div>
<div class="feature-item">
<div class="feature-icon">🔄</div>
<div class="feature-text">Détection des boucles infinies et états isolés</div>
</div>
<div class="feature-item">
<div class="feature-icon">📊</div>
<div class="feature-text">Visualisation temps réel de l'état d'exécution</div>
</div>
<div class="feature-item">
<div class="feature-icon">💾</div>
<div class="feature-text">Import/Export au format <code>.slac.json</code></div>
</div>
<div class="feature-item">
<div class="feature-icon">👥</div>
<div class="feature-text">Gestion multi-utilisateurs avec permissions</div>
</div>
</div>
</div>
</div>

### ⚡ Déploiement Blockchain

<div class="feature-section">
<div class="feature-header">
<h4>Génération et Déploiement Automatique</h4>
</div>
<div class="feature-content">
<p>Transformation automatique des spécifications SLCA en code Solidity optimisé, compilation, et déploiement sur blockchain Ethereum avec gestion des dépendances entre contrats.</p>

<strong>Pipeline de déploiement :</strong>

<div class="features-list">
<div class="feature-list-item">
<div class="feature-list-icon">🔧</div>
<div class="feature-list-text">Génération de code Solidity via bibliothèque MSFSM</div>
</div>
<div class="feature-list-item">
<div class="feature-list-icon">⚙️</div>
<div class="feature-list-text">Compilation automatique avec Hardhat</div>
</div>
<div class="feature-list-item">
<div class="feature-list-icon">🌐</div>
<div class="feature-list-text">Déploiement sur réseau Ethereum (local/testnet/mainnet)</div>
</div>
<div class="feature-list-item">
<div class="feature-list-icon">📋</div>
<div class="feature-list-text">Génération automatique des ABIs</div>
</div>
<div class="feature-list-item">
<div class="feature-list-icon">🔗</div>
<div class="feature-list-text">Gestion des références entre contrats</div>
</div>
</div>
</div>
</div>

### 🚀 Exécution des Contrats

<div class="feature-section">
<div class="feature-header">
<h4>Interaction avec les Smart Contracts</h4>
</div>
<div class="feature-content">
<p>Exécution sécurisée des fonctions des contrats déployés avec validation des paramètres, suivi des transactions, et retour d'informations détaillées.</p>
</div>
</div>

### 📦 Système de Packages

<div class="feature-section">
<div class="feature-header">
<h4>Bibliothèque de Composants Réutilisables</h4>
</div>
<div class="feature-content">
<p>Gestion d'une bibliothèque de packages contenant des fonctions, structures et variables Solidity préconfigurées pour accélérer le développement de contrats.</p>

<strong>Gestion des packages :</strong>

<div class="features-list">
<div class="feature-list-item">
<div class="feature-list-icon">📚</div>
<div class="feature-list-text">Bibliothèque extensible de composants Solidity</div>
</div>
<div class="feature-list-item">
<div class="feature-list-icon">🔧</div>
<div class="feature-list-text">Fonctions préconfigurées pour cas d'usage courants</div>
</div>
<div class="feature-list-item">
<div class="feature-list-icon">🏗️</div>
<div class="feature-list-text">Structures de données réutilisables</div>
</div>
<div class="feature-list-item">
<div class="feature-list-icon">🔄</div>
<div class="feature-list-text">Import/Export de packages personnalisés</div>
</div>
<div class="feature-list-item">
<div class="feature-list-icon">👨‍💼</div>
<div class="feature-list-text">Administration centralisée (admins uniquement)</div>
</div>
</div>
</div>
</div>

##  Outils d'Administration

###  Interface en Ligne de Commande

L'API inclut un **CLI complet** pour l'administration système :

<div class="cli-commands">

<div class="cli-section">
  <h4>👨‍💼 Administration (`admin`)</h4>
  <ul>
    <li><code>reset</code> - Réinitialiser les credentials admin</li>
    <li><code>info</code> - Afficher la configuration actuelle</li>
  </ul>
</div>

<div class="cli-section">
  <h4>📄 Contrats (`contract`)</h4>
  <ul>
    <li><code>list</code> - Lister tous les contrats</li>
    <li><code>clean</code> - Nettoyer les fichiers de contrats</li>
  </ul>
</div>

<div class="cli-section">
  <h4>🔧 Utilitaires (`utils`)</h4>
  <ul>
    <li><code>check-dirs</code> - Vérifier les répertoires système</li>
    <li><code>show-env</code> - Afficher l'environnement actuel</li>
  </ul>
</div>

</div>

### Suivi et Historique

<div class="monitoring-features">

<div class="monitor-item">
  <div class="monitor-icon">📈</div>
  <h4>Historique des Actions</h4>
  <p>Traçabilité complète de toutes les opérations : création, modification, déploiement, et exécution des contrats.</p>
</div>

<div class="monitor-item">
  <div class="monitor-icon">👥</div>
  <h4>Suivi Utilisateurs</h4>
  <p>Association de chaque action à son utilisateur pour audit complet et gestion des responsabilités.</p>
</div>

<div class="monitor-item">
  <div class="monitor-icon">⏰</div>
  <h4>Horodatage Précis</h4>
  <p>Timestamps UTC pour toutes les opérations avec fuseau horaire cohérent et recherche temporelle.</p>
</div>

</div>

## Configuration et Déploiement

###  Support Docker

<div class="deployment-options">

<div class="deploy-option">
  <h4>🏗️ Développement</h4>
  <p>Script <code>start-dev.sh</code> pour lancement rapide avec Hardhat local et rechargement automatique.</p>
</div>

<div class="deploy-option">
  <h4>🚀 Production</h4>
  <p>Configuration Docker Compose complète avec services séparés, volumes persistants, et configuration d'environnement.</p>
</div>

<div class="deploy-option">
  <h4>⚙️ Configuration</h4>
  <p>Variables d'environnement par contexte (<code>.env.dev</code>, <code>.env.docker</code>, <code>.env.prod</code>) pour flexibilité maximale.</p>
</div>

</div>

###  Variables d'Environnement Principales

```bash
# API Configuration
API_PREFIX=/api/v1
CORS_ALLOW_ORIGINS=http://localhost:5173

# Blockchain
ETHEREUM_PROVIDER_URL=http://localhost:8545
ETHEREUM_CHAIN_ID=31337

# Security
JWT_SECRET_KEY=your_secure_key
API_KEY_HEADER_NAME=X-API-KEY
```

## Documentation Interactive

L'API génère automatiquement sa **documentation interactive** via FastAPI :

<div class="docs-features">

<div class="docs-feature">
  <div class="docs-icon">📖</div>
  <h4>Swagger UI</h4>
  <p>Interface interactive complète accessible sur <code>/docs</code> pour tester directement tous les endpoints.</p>
</div>

<div class="docs-feature">
  <div class="docs-icon">🔍</div>
  <h4>Schémas Automatiques</h4>
  <p>Génération automatique des schémas de données avec validation en temps réel et exemples d'utilisation.</p>
</div>

<div class="docs-feature">
  <div class="docs-icon">🔐</div>
  <h4>Test avec Authentification</h4>
  <p>Support complet des clés API et tokens JWT directement dans l'interface de test Swagger.</p>
</div>

</div>

---

L'API Smart Legal Contract combine **performance**, **sécurité** et **facilité d'utilisation** pour offrir une plateforme robuste de transformation de contrats traditionnels en smart contracts blockchain.

<style>
.architecture-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.layer-card {
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.layer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.api-layer {
  border-top: 4px solid #3B82F6;
}

.service-layer {
  border-top: 4px solid #10B981;
}

.repo-layer {
  border-top: 4px solid #8B5CF6;
}

.layer-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.layer-card h3 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
}

.layer-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.folder-structure {
  margin: 2rem 0;
}

.folder-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border-left: 4px solid var(--vp-c-brand);
}

.folder-section h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
}

.folder-details p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.auth-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.auth-feature {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.auth-feature h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.auth-feature p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

.auth-flow {
  display: grid;
  gap: 1.5rem;
  margin: 2rem 0;
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.step-number {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3B82F6, #06B6D4);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.step-content {
  flex: 1;
}

.step-content h5 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
}

.step-content p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

.api-key-system {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.api-key-feature {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
}

.key-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.api-key-feature h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.api-key-feature p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

.error-system {
  margin: 2rem 0;
}

.error-category {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.error-category h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
}

.error-examples {
  display: grid;
  gap: 0.5rem;
}

.error-example {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--vp-c-bg);
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
}

.error-example code {
  color: var(--vp-c-brand);
  font-weight: 500;
}

.error-example span {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.feature-section {
  margin: 2rem 0;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.feature-header h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
}

.feature-content {
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.feature-content p {
  margin-bottom: 1rem;
}

.cli-commands {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.cli-section {
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.cli-section h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1rem;
}

.cli-section ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cli-section li {
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.cli-section code {
  color: var(--vp-c-brand);
  font-weight: 500;
}

.monitoring-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.monitor-item {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
}

.monitor-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.monitor-item h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.monitor-item p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

.deployment-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.deploy-option {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.deploy-option h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.deploy-option p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

.docs-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.docs-feature {
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  text-align: center;
}

.docs-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.docs-feature h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.docs-feature p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .architecture-overview,
  .auth-features,
  .api-key-system,
  .cli-commands,
  .monitoring-features,
  .deployment-options,
  .docs-features {
    grid-template-columns: 1fr;
  }
  
  .flow-step {
    flex-direction: column;
    text-align: center;
  }
  
  .feature-section {
    padding: 1rem;
  }
}

/* Styles pour les grilles de fonctionnalités */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.feature-text {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

/* Style liste moderne avec bordure gauche */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.feature-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, rgba(52, 81, 178, 0.05), rgba(52, 81, 178, 0.02));
  border-radius: 8px;
  border-left: 3px solid var(--vp-c-brand);
  transition: all 0.2s ease;
}

.feature-list-item:hover {
  background: linear-gradient(135deg, rgba(52, 81, 178, 0.1), rgba(52, 81, 178, 0.05));
  transform: translateX(4px);
}

.feature-list-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.feature-list-text {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

/* Style pour le code inline dans les features */
.feature-text code,
.feature-list-text code {
  background: rgba(var(--vp-c-brand-rgb), 0.1);
  color: var(--vp-c-brand);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85em;
}

/* Responsive */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .feature-item {
    padding: 0.8rem;
  }
  
  .feature-list-item {
    padding: 0.6rem 1rem;
  }
}
</style>