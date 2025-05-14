# API Prestation de service Demo

Cette API de démo permet la création, la compilation et le déploiement de contrats intelligents selon une spécification de machine à états finis multi-échelle.

### API

L'API est constituée à l'aide du micro framework FastAPI. Une documentation est disponible à l'adresse suivante : `http://localhost:8000/docs` ou `http://localhost:8000/redoc`.

## Outils

Pour la partie blockchain, nous avons fait le choix d'utiliser Hardhat. Celui-ci est un environnement de développement Ethereum.

## Configuration

Créez un fichier `.env` dans le répertoire api et ajoutez les variables d'environnement nécessaires :

```
SOLC_VERSION=<votre_version_solc>
PROVIDER_URL=<votre_url_provider>
ADDRESS=<votre_adresse>
PRIVATE_KEY=<votre_clé_privée>
CHAIN_ID=<votre_chain_id>
PACKAGES_PATH=<chemin_vers_packages>
SMART_CONTRACTS_PATH=<chemin_vers_smart_contracts>
```

## Utilisation

Pour lancer la démo :
```bash
docker compose up --build
```

Pour éteindre la démo :
```bash
docker compose down
```
