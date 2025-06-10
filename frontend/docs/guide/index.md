# Guide de développement

Bienvenue dans le guide complet de Smart Legal Contract ! Cette documentation vous accompagnera dans la compréhension, le développement et la personnalisation de l'application.

## 🎯 À propos de ce guide

Ce guide est organisé en sections logiques pour vous permettre de progresser étape par étape, que vous soyez débutant ou développeur expérimenté.

## 📖 Structure de la documentation

### 🚀 Démarrage
- **[Installation](/guide/installation)** - Configuration initiale du projet
- **[Configuration](/guide/configuration)** - Paramétrage et variables d'environnement
- **[Premier contrat](/guide/first-contract)** - Créer votre premier contrat intelligent

### 🏗️ Architecture
- **[Vue d'ensemble](/guide/architecture)** - Architecture générale de l'application
- **[Structure des dossiers](/guide/folder-structure)** - Organisation du code source
- **[Patterns utilisés](/guide/patterns)** - Conventions et bonnes pratiques

### 🧩 Composants
- **[Composants UI](/guide/components/ui)** - Interface utilisateur réutilisable
- **[Composants métier](/guide/components/business)** - Logique applicative
- **[Composables](/guide/composables)** - Logique réactive partagée

### 📱 Vues et Pages
- **[Authentication](/guide/views/auth)** - Système de connexion/inscription
- **[Dashboard](/guide/views/dashboard)** - Tableau de bord principal
- **[Contrats](/guide/views/contracts)** - Gestion des contrats
- **[Profil utilisateur](/guide/views/profile)** - Gestion du profil

### 🌐 Internationalisation
- **[Configuration i18n](/guide/i18n)** - Configuration multilingue
- **[Locales](/guide/locales)** - Gestion des traductions

## 🎨 Philosophie de développement

Smart Legal Contract est construit autour de principes modernes :

### Vue 3 + Composition API
Utilisation intensive de la Composition API pour une meilleure réutilisabilité et maintenabilité du code.

```javascript
// Exemple de composable réutilisable
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubled = computed(() => count.value * 2)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return { count, doubled, increment, decrement }
}
```

### Design System avec Tailwind
Interface cohérente grâce à Tailwind CSS et des composants UI standardisés.

```vue
<template>
  <UiButton 
    variant="primary" 
    size="lg"
    @click="handleClick"
  >
    Action principale
  </UiButton>
</template>
```

### State Management moderne
Gestion d'état prévisible avec Pinia pour une architecture scalable.

```javascript
// Store Pinia
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  
  const login = async (credentials) => {
    // Logique de connexion
  }
  
  return { user, isAuthenticated, login }
})
```

## 🔧 Outils de développement

### Stack technique principale
- **Vue 3** : Framework JavaScript progressif
- **Vite** : Build tool moderne et rapide
- **Tailwind CSS** : Framework CSS utility-first
- **Pinia** : State management moderne
- **VueFlow** : Éditeur de workflows visuels
- **Vue Router** : Routage côté client
- **VueUse** : Collection de composables utilitaires

### Outils de qualité
- **ESLint** : Linting JavaScript/Vue
- **Prettier** : Formatage automatique du code
- **Vitest** : Framework de tests modernes
- **Cypress** : Tests end-to-end
- **Commitizen** : Commits conventionnels

## 🎯 Concepts clés

### Contrats intelligents
Un contrat dans SLC est composé de **clauses** (automates) qui définissent des flux de validation. Chaque clause contient des **états** et des **transitions** qui régissent le comportement du contrat.

### Automates visuels
L'éditeur VueFlow permet de créer visuellement des workflows complexes avec des nœuds connectés représentant les différentes étapes d'un processus contractuel.

### Gestion des rôles
Système de permissions granulaires avec différents niveaux d'accès :
- **Admin** : Accès complet à toutes les fonctionnalités
- **Manager** : Gestion des contrats et utilisateurs de son équipe
- **User** : Création et modification de ses propres contrats
- **Viewer** : Consultation en lecture seule

## 🚦 Workflow de développement

### 1. Structure des branches
```
main ─── Version stable de production
│
├── develop ─── Branche de développement principale
│
├── feature/nouvelle-fonctionnalite ─── Nouvelles fonctionnalités
│
├── bugfix/correction-bug ─── Corrections de bugs
│
└── hotfix/correction-urgente ─── Corrections urgentes
```

### 2. Conventions de commits
Utilisez des commits conventionnels pour un historique clair :

```bash
feat: ajout du composant UiDatePicker
fix: correction du bug de validation des formulaires
docs: mise à jour de la documentation des composables
style: formatage du code avec Prettier
refactor: restructuration du store auth
test: ajout des tests pour useValidation
```

### 3. Cycle de développement

```bash
# 1. Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et tester
npm run dev
npm run test

# 3. Vérifier la qualité du code
npm run lint
npm run format

# 4. Commit et push
git add .
git commit -m "feat: ajout de la nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request
```

## 🧪 Tests et qualité

### Types de tests
- **Tests unitaires** : Composables et utilitaires
- **Tests de composants** : Composants Vue isolés
- **Tests d'intégration** : Interaction entre composants
- **Tests E2E** : Parcours utilisateur complets

### Commandes de test
```bash
# Tests unitaires et composants
npm run test

# Tests avec coverage
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests en mode watch pour le développement
npm run test:watch
```

## 📚 Ressources supplémentaires

### Documentation officielle
- [Vue.js 3](https://vuejs.org/) - Framework principal
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Pinia](https://pinia.vuejs.org/) - State management
- [VueFlow](https://vueflow.dev/) - Éditeur de workflows
- [Vite](https://vitejs.dev/) - Build tool

### Communauté et support
- [GitHub Repository](https://github.com/Hama2017/ihm-fsm)
- [Issues & Bugs](https://github.com/Hama2017/ihm-fsm/issues)
- [Discussions](https://github.com/Hama2017/ihm-fsm/discussions)

## 🎯 Prochaines étapes

Pour bien commencer avec Smart Legal Contract :

1. **[🚀 Suivez le guide d'installation](/getting-started)** si ce n'est pas déjà fait
2. **[🏗️ Comprenez l'architecture](/guide/architecture)** pour saisir la structure globale
3. **[🧩 Explorez les composants](/guide/components/ui)** pour personnaliser l'interface
4. **[📱 Découvrez les vues](/guide/views/dashboard)** pour comprendre les fonctionnalités
5. **[🔧 Maîtrisez les composables](/guide/composables)** pour étendre l'application

<div class="tip custom-block">
<p class="custom-block-title">💡 Conseil de démarrage</p>
<p>Commencez par explorer le <strong>Dashboard</strong> et la création d'un <strong>premier contrat</strong> pour vous familiariser avec les concepts clés de l'application.</p>
</div>

<div class="info custom-block">
<p class="custom-block-title">ℹ️ Information</p>
<p>Cette documentation est en constante évolution. N'hésitez pas à contribuer en proposant des améliorations via des Pull Requests !</p>
</div>