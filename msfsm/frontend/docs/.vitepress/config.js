// docs/.vitepress/config.js
import { defineConfig } from 'vitepress'

export default defineConfig(async () => {
  const tailwindcss = (await import('@tailwindcss/postcss')).default
  const autoprefixer = (await import('autoprefixer')).default

  return {
    title: 'Smart Legal Contract',
    description: 'Documentation complète de l\'application SLC - Gestion de contrats intelligents avec Vue 3, Tailwind CSS et VueFlow',

    themeConfig: {
      logo: '/logo-finale.svg',

      nav: [
        { text: 'Accueil', link: '/' },
        { text: 'Démarrage rapide', link: '/getting-started' },
        { text: 'Guide', link: '/guide/' },
        {
          text: 'Backend & Librairie',
          items: [
            { text: 'API Backend (FastAPI)', link: '/backend/index' },
            { text: 'Librairie MSFSM', link: '/msfsm/index' }
          ]
        },
        {
          text: 'Liens',
          items: [
            { text: 'Frontend (GitHub)', link: 'https://github.com/Hama2017/ihm-fsm' },
            { text: 'Backend (GitHub)', link: 'https://github.com/Hama2017/slc-api' },
            { text: 'MSFSM (GitHub)', link: 'https://mon-org.gitlab.io/msfsm-doc' }
          ]
        }
      ],

      sidebar: {
        '/guide/': [
          {
            text: 'Démarrage',
            items: [
              { text: 'Installation', link: '/guide/installation' },
              { text: 'Configuration', link: '/guide/configuration' },
              { text: 'Premier contrat', link: '/guide/first-contract' }
            ]
          },
          {
            text: 'Architecture',
            items: [
              { text: 'Vue d\'ensemble', link: '/guide/architecture' },
              { text: 'Structure des dossiers', link: '/guide/folder-structure' },
              { text: 'Patterns utilisés', link: '/guide/patterns' }
            ]
          },
          {
            text: 'Composants',
            items: [
              { text: 'Composants UI', link: '/guide/components/ui' },
              { text: 'Composants métier', link: '/guide/components/business' },
              { text: 'Composables', link: '/guide/composables' }
            ]
          },
          {
            text: 'Vues & Pages',
            items: [
              { text: 'Authentication', link: '/guide/views/auth' },
              { text: 'Dashboard', link: '/guide/views/dashboard' },
              { text: 'Contrats', link: '/guide/views/contracts' },
              { text: 'Profil utilisateur', link: '/guide/views/profile' }
            ]
          },
          {
            text: 'Internationalisation',
            items: [
              { text: 'Configuration i18n', link: '/guide/i18n' },
              { text: 'Locales', link: '/guide/locales' }
            ]
          }
        ],

        '/api/': [
          {
            text: 'Services',
            items: [
              { text: 'AuthService', link: '/api/services/auth' },
              { text: 'ContractService', link: '/api/services/contract' },
              { text: 'UserService', link: '/api/services/user' }
            ]
          },
          {
            text: 'Stores',
            items: [
              { text: 'Auth Store', link: '/api/stores/auth' },
              { text: 'Contract Store', link: '/api/stores/contract' },
              { text: 'UI Store', link: '/api/stores/ui' }
            ]
          },
          {
            text: 'Composables',
            items: [
              { text: 'useLayout', link: '/api/composables/use-layout' },
              { text: 'useToast', link: '/api/composables/use-toast' },
              { text: 'useAutomate', link: '/api/composables/use-automate' },
              { text: 'useValidation', link: '/api/composables/use-validation' }
            ]
          }
        ],

        '/backend/': [
          {
            text: 'Démarrage',
            items: [
              { text: 'Introduction', link: '/backend/index' },
              { text: 'Guide rapide', link: '/backend/quickstart' },
            ]
          }
        ],

        '/msfsm/': [
          {
            text: 'MSFSM',
            items: [
              { text: 'Présentation', link: '/msfsm/index' },
              { text: 'Lien vers la doc complète', link: '/msfsm/link' }
            ]
          }
        ]
      },

      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2025 Smart Legal Contract'
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com/Hama2017/ihm-fsm' }
      ],

      search: {
        provider: 'local'
      },

      editLink: {
        pattern: 'https://github.com/Hama2017/ihm-fsm/edit/main/docs/:path',
        text: 'Modifier cette page sur GitHub'
      }
    },

    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }],
      ['meta', { name: 'theme-color', content: '#3b82f6' }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:locale', content: 'fr_FR' }],
      ['meta', { property: 'og:title', content: 'Smart Legal Contract - Documentation' }],
      ['meta', { property: 'og:description', content: 'Documentation complète de l\'application SLC' }],
      ['meta', { property: 'og:site_name', content: 'SLC Docs' }],
      ['meta', { property: 'og:url', content: 'https://slc-docs.com/' }]
    ],

    markdown: {
      theme: {
        light: 'github-light',
        dark: 'github-dark'
      },
      lineNumbers: true
    },

    vite: {
      css: {
        postcss: {
          plugins: [
            tailwindcss,
            autoprefixer
          ]
        }
      }
    },
    ignoreDeadLinks: true

  }
})
