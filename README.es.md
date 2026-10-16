 [![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.md)
[![zh](https://img.shields.io/badge/lang-zh-green.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.zh.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.fr.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.es.md)
[![jp](https://img.shields.io/badge/lang-jp-orange.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.jp.md)
[![kr](https://img.shields.io/badge/lang-ko-purple.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.kr.md)

# Investigador de Empresas 🔍

![interfaz web](<static/ui-1.png>)

Una herramienta multi-agente que genera informes de investigación exhaustivos sobre empresas. La plataforma utiliza un sistema de agentes de IA para recopilar, seleccionar y sintetizar información sobre cualquier empresa.

✨¡Pruébalo en línea! https://companyresearcher.tavily.com ✨

https://github.com/user-attachments/assets/0e373146-26a7-4391-b973-224ded3182a9

## Características

- **Investigación Multi-Fuente**: Recopila datos de diversas fuentes, incluyendo sitios web de empresas, artículos de noticias, informes financieros y análisis sectoriales
- **Filtrado de Contenido Impulsado por IA**: Utiliza la puntuación de relevancia de Tavily para la selección de contenido
- **Procesamiento Asíncrono**: Arquitectura eficiente basada en polling para rastrear el progreso de la investigación
- **Selección Flexible de Modelos**: Usa cualquier modelo disponible en [OpenRouter](https://openrouter.ai), elegido desde el panel de Configuración de la aplicación, o claves directas de OpenAI/Gemini como alternativa
- **Frontend Moderno en React**: Interfaz de usuario receptiva con seguimiento de progreso y opciones de descarga
- **Arquitectura Modular**: Construido utilizando un sistema de nodos de investigación y procesamiento especializados

## Marco de Agentes

### Sistema de Investigación

La plataforma sigue un marco basado en agentes con nodos especializados que procesan datos secuencialmente:

1. **Nodos de Investigación**:
   - `CompanyAnalyzer`: Investiga información básica del negocio
   - `IndustryAnalyzer`: Analiza posición de mercado y tendencias
   - `FinancialAnalyst`: Recopila métricas financieras y datos de rendimiento
   - `NewsScanner`: Recopila noticias y desarrollos recientes

2. **Nodos de Procesamiento**:
   - `Collector`: Agrega datos de investigación de todos los analizadores
   - `Curator`: Implementa filtrado de contenido y puntuación de relevancia
   - `Briefing`: Genera resúmenes específicos por categoría utilizando el modelo seleccionado
   - `Editor`: Compila y formatea los resúmenes en un informe final utilizando el modelo seleccionado

   ![interfaz web](<static/agent-flow.png>)

### Arquitectura de Generación de Contenido

Todos los pasos con LLM (generación de consultas en los investigadores, `Briefing` y `Editor`) utilizan un único modelo. El proveedor se elige en `backend/llm.py`:

1. **OpenRouter** (recomendado):
   - Con una clave de OpenRouter (`OPENROUTER_API_KEY` en el `.env` del backend, o pegada en el panel de Configuración de la aplicación), todos los pasos usan el modelo de OpenRouter seleccionado en Configuración
   - Modelo predeterminado: `google/gemini-3.8-flash`, configurable con `OPENROUTER_MODEL`

2. **Claves directas** (alternativa):
   - Sin clave de OpenRouter, el backend utiliza `OPENAI_API_KEY` (modelos GPT)
   - Si `GEMINI_API_KEY` está configurada, se usa Gemini 2.5 Flash solo para los resúmenes; la clave de Gemini ya no es obligatoria

### Sistema de Selección de Contenido

La plataforma utiliza un sistema de filtrado de contenido en `curator.py`:

1. **Puntuación de Relevancia**:
   - Los documentos son puntuados por la búsqueda potenciada por IA de Tavily
   - Se requiere un umbral mínimo (predeterminado 0.4) para proceder
   - Las puntuaciones reflejan la relevancia para la consulta de investigación específica
   - Puntuaciones más altas indican mejores coincidencias con la intención de la investigación

2. **Procesamiento de Documentos**:
   - El contenido se normaliza y limpia
   - Las URLs se desduplicaron y estandarizaron
   - Los documentos se ordenan por puntuaciones de relevancia
   - La investigación se ejecuta de forma asíncrona en segundo plano

### Arquitectura del Backend

La plataforma implementa un sistema de comunicación simple basado en polling:

![interfaz web](<static/ui-2.png>)

1. **Implementación Backend**:
   - Utiliza FastAPI con soporte asíncrono
   - Las tareas de investigación se ejecutan en segundo plano
   - Los resultados se almacenan y acceden mediante endpoints REST
   - Seguimiento simple del estado del trabajo
   
2. **Integración Frontend**:
   - El frontend React envía solicitudes de investigación
   - Recibe job_id para seguimiento
   - Realiza polling al endpoint `/research/{job_id}/report`
   - Muestra el informe final cuando está completo

3. **Endpoints de la API**:
   - `POST /research`: Enviar nueva solicitud de investigación (acepta opcionalmente `openrouter_api_key` y `model`)
   - `GET /models`: Listar los modelos de texto disponibles en OpenRouter (en caché durante 1 hora)
   - `GET /config`: Indicar qué claves de LLM tiene configuradas el servidor y el modelo predeterminado
   - `GET /research/{job_id}/report`: Polling para informe completado
   - `POST /generate-pdf`: Generar PDF del contenido del informe

## Instalación

### Instalación Rápida (Recomendada)

La forma más sencilla de comenzar es utilizando el script de instalación, que detecta automáticamente y usa `uv` para una instalación más rápida de paquetes Python cuando está disponible:

1. Clonar el repositorio:
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. Hacer que el script de instalación sea ejecutable y ejecutarlo:
```bash
chmod +x setup.sh
./setup.sh
```

El script de instalación hará lo siguiente:

- Detectar y usar `uv` para una instalación más rápida de paquetes Python (si está disponible)
- Verificar las versiones requeridas de Python y Node.js
- Opcionalmente crear un entorno virtual de Python (recomendado)
- Instalar todas las dependencias (Python y Node.js)
- Guiarte a través de la configuración de tus variables de entorno (te pedirá tu clave de Tavily y tu clave de OpenRouter; solo pedirá claves de OpenAI/Gemini si omites la de OpenRouter)
- Opcionalmente iniciar los servidores de backend y frontend

> **💡 Consejo Pro**: Instala [uv](https://github.com/astral-sh/uv) para una instalación significativamente más rápida de paquetes Python:
>
> ```bash
> curl -LsSf https://astral.sh/uv/install.sh | sh
> ```

Necesitarás tener listas las siguientes claves API:
- Clave API de Tavily
- Clave API de OpenRouter (recomendada; también puedes pegarla más tarde en Configuración)
- Clave API de OpenAI (solo si no usas OpenRouter)
- Clave API de Google Gemini (opcional)
- Clave API de Google Maps (opcional, solo para el autocompletado de ubicaciones)
- URI de MongoDB (opcional)

### Instalación Manual

Si prefieres realizar la instalación manualmente, sigue estos pasos:

1. Clonar el repositorio:
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. Instalar dependencias de backend:
```bash
# Opcional: Crear y activar entorno virtual
# Con uv (más rápido - recomendado si está disponible):
uv venv .venv
source .venv/bin/activate

# O con Python estándar:
# python -m venv .venv
# source .venv/bin/activate

# Instalar dependencias de Python
# Con uv (más rápido):
uv pip install -r requirements.txt

# O con pip:
# pip install -r requirements.txt
```

3. Instalar dependencias de frontend:
```bash
cd ui
npm install
```

4. **Configurar Variables de Entorno**:

Este proyecto requiere dos archivos `.env` separados para el backend y el frontend.

**Configuración del Backend:**

Crea un archivo `.env` en el directorio raíz del proyecto y añade tus claves API del backend:

```env
TAVILY_API_KEY=tu_clave_tavily
# Recomendado: una sola clave para todos los modelos (o pega una clave en la Configuración de la aplicación)
OPENROUTER_API_KEY=tu_clave_openrouter
# Modelo predeterminado opcional; los usuarios pueden elegir otro en Configuración
# OPENROUTER_MODEL=anthropic/claude-sonnet-5.5
# Alternativa a OpenRouter: claves directas de los proveedores
# OPENAI_API_KEY=tu_clave_openai
# GEMINI_API_KEY=tu_clave_gemini

# Opcional: Habilitar persistencia en MongoDB
# MONGODB_URI=tu_cadena_de_conexion_mongodb
```

**Configuración del Frontend:**

Crea un archivo `.env` dentro del directorio `ui`. Puedes copiar primero el archivo de ejemplo:

```bash
cp ui/.env.development.example ui/.env
```

Luego, abre `ui/.env` y añade tus variables de entorno del frontend:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=tu_clave_google_maps_aqui
```

### Instalación con Docker

La aplicación puede ejecutarse utilizando Docker y Docker Compose:

1. Clonar el repositorio:
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. **Configurar Variables de Entorno**:

La configuración de Docker utiliza dos archivos `.env` separados.

**Configuración del Backend:**

Crea un archivo `.env` en el directorio raíz del proyecto con tus claves API del backend:

```env
TAVILY_API_KEY=tu_clave_tavily
# Recomendado: una sola clave para todos los modelos (o pega una clave en la Configuración de la aplicación)
OPENROUTER_API_KEY=tu_clave_openrouter
# Modelo predeterminado opcional; los usuarios pueden elegir otro en Configuración
# OPENROUTER_MODEL=anthropic/claude-sonnet-5.5
# Alternativa a OpenRouter: claves directas de los proveedores
# OPENAI_API_KEY=tu_clave_openai
# GEMINI_API_KEY=tu_clave_gemini

# Opcional: Habilitar persistencia en MongoDB
# MONGODB_URI=tu_cadena_de_conexion_mongodb
```

**Configuración del Frontend:**

Crea un archivo `.env` dentro del directorio `ui`. Puedes copiar primero el archivo de ejemplo:

```bash
cp ui/.env.development.example ui/.env
```

Luego, abre `ui/.env` y añade tus variables de entorno del frontend:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=tu_clave_google_maps_aqui
```

3. Construir e iniciar los contenedores:
```bash
docker compose up --build
```

Esto iniciará los servicios de backend y frontend:
- La API de backend estará disponible en `http://localhost:8000`
- El frontend estará disponible en `http://localhost:5174`

Para detener los servicios:
```bash
docker compose down
```

Nota: Al actualizar las variables de entorno en `.env`, necesitarás reiniciar los contenedores:
```bash
docker compose down && docker compose up
```

### Elegir un Modelo

Haz clic en el botón del modelo en la esquina superior derecha de la aplicación para abrir **Configuración**. Allí puedes pegar una clave de OpenRouter (se guarda solo en tu navegador y se envía con cada solicitud de investigación) y buscar o filtrar el catálogo de modelos de OpenRouter por proveedor, con sus logotipos. El modelo seleccionado se usa en todos los pasos de la investigación. Si no hay clave de OpenRouter disponible, el backend recurre a `OPENAI_API_KEY` (y a Gemini para los resúmenes si `GEMINI_API_KEY` está configurada).

### Ejecutando la Aplicación

1. Iniciar el servidor de backend (elige una opción):
```bash
# Opción 1: Módulo Python Directo
python -m application.py

# Opción 2: FastAPI con Uvicorn
uvicorn application:app --reload --port 8000
```

2. En una nueva terminal, iniciar el frontend:
```bash
cd ui
npm run dev
```

3. Acceder a la aplicación en `http://localhost:5173`

## Uso

### Desarrollo Local

1. Iniciar el servidor de backend (elige una opción):

   **Opción 1: Módulo Python Directo**
   ```bash
   python -m application.py
   ```

   **Opción 2: FastAPI con Uvicorn**
   ```bash
   # Instalar uvicorn si aún no está instalado
   # Con uv (más rápido):
   uv pip install uvicorn
   # O con pip:
   # pip install uvicorn

   # Ejecutar la aplicación FastAPI con recarga automática
   uvicorn application:app --reload --port 8000
   ```

   El backend estará disponible en:
   - Punto de conexión API: `http://localhost:8000`

2. Iniciar el servidor de desarrollo del frontend:
   ```bash
   cd ui
   npm run dev
   ```

3. Acceder a la aplicación en `http://localhost:5173`

> **⚡ Nota de Rendimiento**: Si usaste `uv` durante la instalación, te beneficiarás de una instalación de paquetes y resolución de dependencias significativamente más rápida. `uv` es un gestor de paquetes Python moderno escrito en Rust que puede ser 10-100x más rápido que pip.

### Opciones de Despliegue

La aplicación puede desplegarse en varias plataformas en la nube. Aquí hay algunas opciones comunes:

- **Docker**: La aplicación incluye un Dockerfile para despliegue en contenedores
- **Heroku**: Despliegue directamente desde GitHub con el buildpack de Python
- **Google Cloud Run**: Adecuado para despliegue en contenedores con escalado automático

Elige la plataforma que mejor se adapte a tus necesidades. La aplicación es independiente de la plataforma y puede alojarse en cualquier lugar que admita aplicaciones web Python.

## Contribuir

1. Haz un fork del repositorio
2. Crea una rama de características (`git checkout -b feature/caracteristica-increible`)
3. Haz commit de tus cambios (`git commit -m 'Añadir característica increíble'`)
4. Haz push a la rama (`git push origin feature/caracteristica-increible`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](LICENSE) para más detalles.

## Agradecimientos

- [Tavily](https://tavily.com/) por la API de investigación
- Todas las demás bibliotecas de código abierto y sus contribuyentes

## Star History

<a href="https://www.star-history.com/?repos=guy-hartstein%2Fcompany-research-agent&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&theme=dark&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
 </picture>
</a>
