 [![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.md)
[![zh](https://img.shields.io/badge/lang-zh-green.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.zh.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.fr.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.es.md)
[![jp](https://img.shields.io/badge/lang-jp-orange.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.jp.md)
[![kr](https://img.shields.io/badge/lang-ko-purple.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.kr.md)


# Agent de Recherche d'Entreprise 🔍

![web ui](<static/ui-1.png>)

Un outil multi-agents qui génère des rapports de recherche d'entreprise complets. La plateforme utilise un pipeline d'agents IA pour collecter, organiser et synthétiser des informations sur n'importe quelle entreprise.

✨Essayez-le en ligne ! https://companyresearcher.tavily.com ✨

https://github.com/user-attachments/assets/0e373146-26a7-4391-b973-224ded3182a9

## Fonctionnalités

- **Recherche Multi-Sources** : Récupère des données de diverses sources, y compris les sites web d'entreprise, articles de presse, rapports financiers et analyses sectorielles
- **Filtrage de contenu par IA** : Utilise le score de pertinence de Tavily pour la curation du contenu
- **Traitement Asynchrone** : Architecture efficace basée sur le polling pour suivre la progression de la recherche
- **Choix flexible du modèle** : Utilisez n'importe quel modèle OpenRouter sélectionné dans les Paramètres, ou des clés OpenAI/Gemini directes en solution de repli
- **Frontend React moderne** : Interface réactive avec suivi de progression et options de téléchargement
- **Architecture modulaire** : Construite autour d'un pipeline de nœuds spécialisés de recherche et de traitement

## Cadre Agentique

### Pipeline de Recherche

La plateforme suit un cadre agentique avec des nœuds spécialisés qui traitent les données de manière séquentielle :

1. **Nœuds de Recherche** :
   - `CompanyAnalyzer` : Recherche les informations principales sur l'entreprise
   - `IndustryAnalyzer` : Analyse la position sur le marché et les tendances
   - `FinancialAnalyst` : Récupère les indicateurs financiers et les données de performance
   - `NewsScanner` : Collecte les actualités et développements récents

2. **Nœuds de Traitement** :
   - `Collector` : Agrège les données de recherche de tous les analyseurs
   - `Curator` : Met en œuvre le filtrage de contenu et le scoring de pertinence
   - `Briefing` : Génère des synthèses par catégorie à l'aide du modèle sélectionné
   - `Editor` : Compile et met en forme les synthèses dans un rapport final avec le modèle sélectionné

   ![web ui](<static/agent-flow.png>)

### Architecture de Génération de Contenu

Toutes les étapes LLM (génération des requêtes par les chercheurs, `Briefing` et `Editor`) utilisent un seul et même modèle. Le fournisseur est choisi dans `backend/llm.py` :

1. **OpenRouter** (recommandé) :
   - Activé lorsqu'une clé OpenRouter est disponible (`OPENROUTER_API_KEY` dans le `.env` du backend, ou collée dans le panneau Paramètres de l'application)
   - Chaque étape utilise le modèle OpenRouter sélectionné dans les Paramètres
   - Modèle par défaut : `google/gemini-3.8-flash`, modifiable via `OPENROUTER_MODEL`

2. **Clés directes** (repli) :
   - Sans clé OpenRouter, le backend utilise `OPENAI_API_KEY` (modèles GPT)
   - Gemini 2.5 Flash est utilisé pour les synthèses uniquement si `GEMINI_API_KEY` est défini ; une clé Gemini n'est plus obligatoire

### Système de Curation de Contenu

La plateforme utilise un système de filtrage de contenu dans `curator.py` :

1. **Scoring de Pertinence** :
   - Les documents sont scorés par la recherche IA de Tavily
   - Un seuil minimum (par défaut 0,4) est requis pour continuer
   - Les scores reflètent la pertinence par rapport à la requête de recherche
   - Un score élevé indique une meilleure correspondance avec l'intention de recherche

2. **Traitement des Documents** :
   - Le contenu est normalisé et nettoyé
   - Les URLs sont dédupliquées et standardisées
   - Les documents sont triés par score de pertinence
   - La recherche s'exécute de manière asynchrone en arrière-plan

### Architecture Backend

La plateforme implémente un système de communication simple basé sur le polling :

![web ui](<static/ui-2.png>)

1. **Implémentation Backend** :
   - Utilise FastAPI avec support asynchrone
   - Les tâches de recherche s'exécutent en arrière-plan
   - Les résultats sont stockés et accessibles via des endpoints REST
   - Suivi simple de l'état des tâches
   
2. **Intégration Frontend** :
   - Le frontend React soumet des demandes de recherche
   - Reçoit un job_id pour le suivi
   - Effectue un polling sur l'endpoint `/research/{job_id}/report`
   - Affiche le rapport final une fois terminé

3. **Endpoints de l'API** :
   - `POST /research` : Soumettre une nouvelle demande de recherche (accepte en option `openrouter_api_key` et `model`)
   - `GET /research/{job_id}/report` : Polling pour le rapport terminé
   - `POST /generate-pdf` : Générer un PDF du contenu du rapport
   - `GET /models` : Lister les modèles texte OpenRouter (mis en cache pendant 1 heure)
   - `GET /config` : Indiquer quelles clés LLM le serveur possède, ainsi que le modèle par défaut

## Configuration

### Configuration Rapide (Recommandée)

La façon la plus simple de commencer est d'utiliser le script de configuration, qui détecte automatiquement et utilise `uv` pour une installation plus rapide des paquets Python lorsqu'il est disponible :

1. Clonez le dépôt :
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. Rendez le script de configuration exécutable et lancez-le :
```bash
chmod +x setup.sh
./setup.sh
```

Le script de configuration va :

- Détecter et utiliser `uv` pour une installation plus rapide des paquets Python (si disponible)
- Vérifier les versions requises de Python et Node.js
- Créer éventuellement un environnement virtuel Python (recommandé)
- Installer toutes les dépendances (Python et Node.js)
- Vous guider dans la configuration de vos variables d'environnement
- Vous demander votre clé OpenRouter (recommandée, peut être ignorée ; les clés OpenAI/Gemini ne sont demandées que si vous l'ignorez)
- Démarrer éventuellement les serveurs backend et frontend

> **💡 Conseil Pro** : Installez [uv](https://github.com/astral-sh/uv) pour une installation significativement plus rapide des paquets Python :
>
> ```bash
> curl -LsSf https://astral.sh/uv/install.sh | sh
> ```

Vous aurez besoin des clés API suivantes :

- Clé API Tavily
- Clé API OpenRouter (recommandée — vous pouvez aussi la coller plus tard dans les Paramètres)
- Clé API OpenAI (uniquement si vous n'utilisez pas OpenRouter)
- Clé API Google Gemini (optionnel)
- Clé API Google Maps (optionnel, uniquement pour l'autocomplétion des lieux)
- URI MongoDB (optionnel)

### Configuration Manuelle

Si vous préférez configurer manuellement, suivez ces étapes :

1. Clonez le dépôt :

```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. Installez les dépendances backend :

```bash
# Optionnel : Créez et activez un environnement virtuel
# Avec uv (plus rapide - recommandé si disponible) :
uv venv .venv
source .venv/bin/activate

# Ou avec Python standard :
# python -m venv .venv
# source .venv/bin/activate

# Installez les dépendances Python
# Avec uv (plus rapide) :
uv pip install -r requirements.txt

# Ou avec pip :
# pip install -r requirements.txt
```

3. Installez les dépendances frontend :

```bash
cd ui
npm install
```

4. **Configuration des Variables d'Environnement** :

Ce projet nécessite deux fichiers `.env` séparés pour le backend et le frontend.

**Configuration Backend :**

Créez un fichier `.env` dans le répertoire racine du projet et ajoutez vos clés API backend :

```env
TAVILY_API_KEY=votre_clé_tavily
# Recommandé : une seule clé pour tous les modèles (ou collez une clé dans les Paramètres de l'application)
OPENROUTER_API_KEY=votre_clé_openrouter
# Modèle par défaut optionnel ; les utilisateurs peuvent toujours en choisir un autre dans les Paramètres
# OPENROUTER_MODEL=anthropic/claude-sonnet-5.5
# Alternative à OpenRouter : clés directes des fournisseurs
# OPENAI_API_KEY=votre_clé_openai
# GEMINI_API_KEY=votre_clé_gemini

# Optionnel : Activez la persistance MongoDB
# MONGODB_URI=votre_chaîne_de_connexion_mongodb
```

**Configuration Frontend :**

Créez un fichier `.env` dans le répertoire `ui`. Vous pouvez d'abord copier le fichier d'exemple :

```bash
cp ui/.env.development.example ui/.env
```

Puis, ouvrez `ui/.env` et ajoutez vos variables d'environnement frontend :

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=votre_clé_google_maps_ici
```

### Configuration Docker

L'application peut être exécutée à l'aide de Docker et Docker Compose :

1. Clonez le dépôt :

```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. **Configuration des Variables d'Environnement** :

La configuration Docker utilise deux fichiers `.env` séparés.

**Configuration Backend :**

Créez un fichier `.env` dans le répertoire racine du projet et ajoutez vos clés API backend :

```env
TAVILY_API_KEY=votre_clé_tavily
# Recommandé : une seule clé pour tous les modèles (ou collez une clé dans les Paramètres de l'application)
OPENROUTER_API_KEY=votre_clé_openrouter
# Modèle par défaut optionnel ; les utilisateurs peuvent toujours en choisir un autre dans les Paramètres
# OPENROUTER_MODEL=anthropic/claude-sonnet-5.5
# Alternative à OpenRouter : clés directes des fournisseurs
# OPENAI_API_KEY=votre_clé_openai
# GEMINI_API_KEY=votre_clé_gemini

# Optionnel : Activez la persistance MongoDB
# MONGODB_URI=votre_chaîne_de_connexion_mongodb
```

**Configuration Frontend :**

Créez un fichier `.env` dans le répertoire `ui`. Vous pouvez d'abord copier le fichier d'exemple :

```bash
cp ui/.env.development.example ui/.env
```

Puis, ouvrez `ui/.env` et ajoutez vos variables d'environnement frontend :

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=votre_clé_google_maps_ici
```

3. Construisez et démarrez les conteneurs :

```bash
docker compose up --build
```

Cela démarrera les services backend et frontend :

- L'API backend sera disponible sur `http://localhost:8000`
- Le frontend sera disponible sur `http://localhost:5174`

Pour arrêter les services :

```bash
docker compose down
```

Remarque : Lors de la mise à jour des variables d'environnement dans `.env`, vous devrez redémarrer les conteneurs :

```bash
docker compose down && docker compose up
```

### Exécution de l'Application

1. Démarrez le serveur backend (choisissez une option) :

```bash
# Option 1 : Module Python Direct
python -m application.py

# Option 2 : FastAPI avec Uvicorn
uvicorn application:app --reload --port 8000
```

2. Dans un nouveau terminal, démarrez le frontend :

```bash
cd ui
npm run dev
```

3. Accédez à l'application sur `http://localhost:5173`

## Utilisation

### Choisir un modèle

Cliquez sur le bouton du modèle en haut à droite de l'application pour ouvrir les **Paramètres**. Vous pouvez y coller une clé OpenRouter (stockée uniquement dans votre navigateur et envoyée avec chaque demande de recherche) et rechercher ou filtrer le catalogue complet des modèles OpenRouter par fournisseur. Le modèle sélectionné est utilisé pour toutes les étapes du pipeline de recherche. Sans clé OpenRouter, le backend se rabat sur `OPENAI_API_KEY` (avec Gemini pour les synthèses si `GEMINI_API_KEY` est défini).

### Développement Local

1. Démarrez le serveur backend (choisissez une option) :

   **Option 1 : Module Python Direct**

   ```bash
   python -m application.py
   ```

   **Option 2 : FastAPI avec Uvicorn**

   ```bash
   # Installez uvicorn si ce n'est pas déjà fait
   # Avec uv (plus rapide) :
   uv pip install uvicorn
   # Ou avec pip :
   # pip install uvicorn

   # Exécutez l'application FastAPI avec rechargement à chaud
   uvicorn application:app --reload --port 8000
   ```

   Le backend sera disponible sur :
   - Point d'accès API : `http://localhost:8000`

2. Démarrez le serveur de développement frontend :

   ```bash
   cd ui
   npm run dev
   ```

3. Accédez à l'application sur `http://localhost:5173`

> **⚡ Note de Performance** : Si vous avez utilisé `uv` lors de l'installation, vous bénéficierez d'une installation de paquets et d'une résolution de dépendances significativement plus rapides. `uv` est un gestionnaire de paquets Python moderne écrit en Rust qui peut être 10 à 100 fois plus rapide que pip.

## Star History

<a href="https://www.star-history.com/?repos=guy-hartstein%2Fcompany-research-agent&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&theme=dark&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
 </picture>
</a>
