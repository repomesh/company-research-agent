 [![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.md)
[![zh](https://img.shields.io/badge/lang-zh-green.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.zh.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.fr.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.es.md)
[![jp](https://img.shields.io/badge/lang-jp-orange.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.jp.md)
[![kr](https://img.shields.io/badge/lang-ko-purple.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.kr.md)


# 기업 조사 에이전트 🔍

![web ui](<static/ui-1.png>)

포괄적인 기업 조사 보고서를 생성하는 멀티 에이전트 도구입니다. 이 플랫폼은 AI 에이전트 파이프라인을 사용하여 모든 기업에 대한 정보를 수집, 정리 및 종합합니다.

✨온라인에서 체험해보세요! https://companyresearcher.tavily.com ✨

https://github.com/user-attachments/assets/0e373146-26a7-4391-b973-224ded3182a9

## 기능

- **멀티소스 조사**: 기업 웹사이트, 뉴스 기사, 재무 보고서, 업계 분석 등 다양한 소스에서 데이터 수집
- **AI 콘텐츠 필터링**: Tavily의 관련성 점수를 사용한 콘텐츠 큐레이션
- **비동기 처리**: 조사 진행 상황을 추적하기 위한 효율적인 폴링 기반 아키텍처
- **유연한 모델 선택**: 설정에서 고른 OpenRouter 모델 하나로 모든 단계를 실행하며, 대안으로 OpenAI/Gemini API 키를 직접 사용할 수도 있습니다
- **모던 React 프론트엔드**: 진행 상황 추적과 다운로드 옵션을 갖춘 반응형 인터페이스
- **모듈러 아키텍처**: 전문화된 조사 및 처리 노드 파이프라인을 중심으로 구축

## 에이전트 프레임워크

### 조사 파이프라인

이 플랫폼은 데이터를 순차적으로 처리하는 전문화된 노드를 가진 에이전트 프레임워크를 따릅니다:

1. **조사 노드**:
   - `CompanyAnalyzer`: 핵심 기업 정보 조사
   - `IndustryAnalyzer`: 시장 위치 및 트렌드 분석
   - `FinancialAnalyst`: 재무 지표 및 성과 데이터 수집
   - `NewsScanner`: 최신 뉴스 및 개발 사항 수집

2. **처리 노드**:
   - `Collector`: 모든 분석기에서 조사 데이터 집계
   - `Curator`: 콘텐츠 필터링 및 관련성 점수 매기기 구현
   - `Briefing`: 선택한 모델을 사용하여 카테고리별 요약 생성
   - `Editor`: 선택한 모델로 요약을 최종 보고서로 컴파일 및 형식 지정

   ![web ui](<static/agent-flow.png>)

### 콘텐츠 생성 아키텍처

모든 LLM 단계(조사 노드의 쿼리 생성, `Briefing`, `Editor`)는 하나의 모델을 사용합니다. 어떤 공급자를 사용할지는 `backend/llm.py`에서 결정됩니다:

1. **OpenRouter** (권장):
   - OpenRouter 키가 있으면(백엔드 `.env`의 `OPENROUTER_API_KEY` 또는 앱 설정 패널에 붙여넣은 키) 모든 단계에서 설정에서 선택한 OpenRouter 모델을 사용합니다
   - 기본 모델은 `google/gemini-3.8-flash`이며, `OPENROUTER_MODEL`로 변경할 수 있습니다

2. **직접 공급자 키** (대안):
   - OpenRouter 키가 없으면 `OPENAI_API_KEY`(GPT 모델)를 사용합니다
   - `GEMINI_API_KEY`가 설정된 경우에만 브리핑에 Gemini 2.5 Flash를 사용합니다 (Gemini 키는 더 이상 필수가 아닙니다)

### 콘텐츠 큐레이션 시스템

이 플랫폼은 `curator.py`에서 콘텐츠 필터링 시스템을 사용합니다:

1. **관련성 점수 매기기**:
   - 문서는 Tavily의 AI 검색으로 점수가 매겨집니다
   - 계속 진행하려면 최소 임계값(기본값 0.4)이 필요합니다
   - 점수는 검색 쿼리와의 관련성을 반영합니다
   - 높은 점수는 검색 의도와의 더 나은 일치를 나타냅니다

2. **문서 처리**:
   - 콘텐츠가 정규화되고 정리됩니다
   - URL이 중복 제거되고 표준화됩니다
   - 문서가 관련성 점수로 정렬됩니다
   - 조사가 백그라운드에서 비동기적으로 실행됩니다

### 백엔드 아키텍처

플랫폼은 폴링 기반의 간단한 통신 시스템을 구현합니다:

![web ui](<static/ui-2.png>)

1. **백엔드 구현**:
   - 비동기 지원이 있는 FastAPI 사용
   - 조사 작업이 백그라운드에서 실행
   - 결과는 REST 엔드포인트를 통해 저장 및 액세스
   - 간단한 작업 상태 추적
   
2. **프론트엔드 통합**:
   - React 프론트엔드가 조사 요청을 제출
   - 추적을 위한 job_id 수신
   - `/research/{job_id}/report` 엔드포인트 폴링
   - 완료 시 최종 보고서 표시

3. **API 엔드포인트**:
   - `POST /research`: 새 조사 요청 제출 (선택적으로 `openrouter_api_key` 및 `model` 지정 가능)
   - `GET /research/{job_id}/report`: 완료된 보고서 폴링
   - `POST /generate-pdf`: 보고서 콘텐츠에서 PDF 생성
   - `GET /models`: OpenRouter 텍스트 모델 목록 (1시간 캐시)
   - `GET /config`: 서버에 설정된 LLM 키 정보 및 기본 모델

## 설정

### 빠른 설정 (권장)

시작하는 가장 쉬운 방법은 설정 스크립트를 사용하는 것입니다. 이 스크립트는 자동으로 `uv`를 감지하고 사용 가능할 때 더 빠른 Python 패키지 설치에 사용합니다:

1. 저장소 클론:
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. 설정 스크립트를 실행 가능하게 만들고 실행:
```bash
chmod +x setup.sh
./setup.sh
```

설정 스크립트는 다음을 수행합니다:

- `uv`를 감지하고 더 빠른 Python 패키지 설치에 사용 (사용 가능한 경우)
- 필요한 Python 및 Node.js 버전 확인
- Python 가상 환경 생성 (권장)
- 모든 종속성 설치 (Python 및 Node.js)
- 환경 변수 설정 안내 (Tavily 키와 OpenRouter 키 입력 요청, OpenRouter 키를 건너뛴 경우에만 OpenAI/Gemini 키 요청)
- 백엔드 및 프론트엔드 서버 시작 (선택사항)

> **💡 프로 팁**: [uv](https://github.com/astral-sh/uv)를 설치하여 훨씬 빠른 Python 패키지 설치를 이용하세요:
>
> ```bash
> curl -LsSf https://astral.sh/uv/install.sh | sh
> ```

다음 API 키가 필요합니다:
- Tavily API 키
- OpenRouter API 키 (권장 - 나중에 앱 설정에서 붙여넣을 수도 있음)
- OpenAI API 키 (OpenRouter를 사용하지 않는 경우에만)
- Google Gemini API 키 (선택사항)
- Google Maps API 키 (선택사항 - 위치 자동완성에만 필요)
- MongoDB URI (선택사항)

### 수동 설정

수동으로 설정하려면 다음 단계를 따르세요:

1. 저장소 클론:
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. 백엔드 종속성 설치:
```bash
# 선택사항: 가상 환경 생성 및 활성화
# uv 사용 (더 빠름 - 사용 가능한 경우 권장):
uv venv .venv
source .venv/bin/activate

# 또는 표준 Python:
# python -m venv .venv
# source .venv/bin/activate

# Python 종속성 설치
# uv 사용 (더 빠름):
uv pip install -r requirements.txt

# 또는 pip 사용:
# pip install -r requirements.txt
```

3. 프론트엔드 종속성 설치:
```bash
cd ui
npm install
```

4. **환경 변수 설정**:

이 프로젝트는 백엔드와 프론트엔드용으로 두 개의 별도 `.env` 파일이 필요합니다.

**백엔드 설정:**

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 백엔드 API 키를 추가합니다:

```env
TAVILY_API_KEY=your_tavily_key
# 권장: 모든 모델에 사용할 수 있는 단일 키 (또는 앱 설정에 키를 붙여넣기)
OPENROUTER_API_KEY=your_openrouter_key
# 선택사항: 기본 모델 (사용자는 설정에서 다른 모델을 선택할 수 있음)
# OPENROUTER_MODEL=anthropic/claude-sonnet-5.5
# OpenRouter 대안: 공급자 키 직접 사용
# OPENAI_API_KEY=your_openai_key
# GEMINI_API_KEY=your_gemini_key

# 선택사항: MongoDB 지속성 활성화
# MONGODB_URI=your_mongodb_connection_string
```

**프론트엔드 설정:**

`ui` 디렉토리 내에 `.env` 파일을 생성합니다. 먼저 예제 파일을 복사할 수 있습니다:

```bash
cp ui/.env.development.example ui/.env
```

그런 다음, `ui/.env`를 열고 프론트엔드 환경 변수를 추가합니다:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Docker 설정

애플리케이션은 Docker 및 Docker Compose를 사용하여 실행할 수 있습니다:

1. 저장소 클론:
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. **환경 변수 설정**:

Docker 설정은 두 개의 별도 `.env` 파일을 사용합니다.

**백엔드 설정:**

프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 백엔드 API 키를 추가합니다:

```env
TAVILY_API_KEY=your_tavily_key
# 권장: 모든 모델에 사용할 수 있는 단일 키 (또는 앱 설정에 키를 붙여넣기)
OPENROUTER_API_KEY=your_openrouter_key
# 선택사항: 기본 모델 (사용자는 설정에서 다른 모델을 선택할 수 있음)
# OPENROUTER_MODEL=anthropic/claude-sonnet-5.5
# OpenRouter 대안: 공급자 키 직접 사용
# OPENAI_API_KEY=your_openai_key
# GEMINI_API_KEY=your_gemini_key

# 선택사항: MongoDB 지속성 활성화
# MONGODB_URI=your_mongodb_connection_string
```

**프론트엔드 설정:**

`ui` 디렉토리 내에 `.env` 파일을 생성합니다. 먼저 예제 파일을 복사할 수 있습니다:

```bash
cp ui/.env.development.example ui/.env
```

그런 다음, `ui/.env`를 열고 프론트엔드 환경 변수를 추가합니다:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

3. 컨테이너 빌드 및 시작:
```bash
docker compose up --build
```

이렇게 하면 백엔드 및 프론트엔드 서비스가 시작됩니다:
- 백엔드 API는 `http://localhost:8000`에서 사용 가능
- 프론트엔드는 `http://localhost:5174`에서 사용 가능

서비스를 중지하려면:
```bash
docker compose down
```

참고: `.env`의 환경 변수를 업데이트할 때 컨테이너를 다시 시작해야 합니다:
```bash
docker compose down && docker compose up
```

### 애플리케이션 실행

1. 백엔드 서버 시작 (옵션 선택):
```bash
# 옵션 1: 직접 Python 모듈
python -m application.py

# 옵션 2: Uvicorn으로 FastAPI
uvicorn application:app --reload --port 8000
```

2. 새 터미널에서 프론트엔드 시작:
```bash
cd ui
npm run dev
```

3. `http://localhost:5173`에서 애플리케이션에 액세스

> **⚡ 성능 참고사항**: 설정 중에 `uv`를 사용했다면 훨씬 빠른 패키지 설치와 종속성 해결의 이점을 얻을 수 있습니다. `uv`는 Rust로 작성된 현대적인 Python 패키지 관리자로 pip보다 10-100배 빠를 수 있습니다.

## 사용법

### 모델 선택

앱 오른쪽 상단의 모델 버튼을 클릭하면 **설정** 패널이 열립니다. 여기서 OpenRouter 키를 붙여넣을 수 있으며(브라우저에만 저장되고 각 조사 요청과 함께 전송됨), 전체 OpenRouter 모델 카탈로그를 공급자별로 검색하거나 필터링할 수 있습니다. 선택한 모델은 조사 파이프라인의 모든 단계에 사용됩니다. OpenRouter 키가 없으면 백엔드는 `OPENAI_API_KEY`로 대체하며, `GEMINI_API_KEY`가 설정된 경우 브리핑에는 Gemini를 사용합니다.

### 로컬 개발

1. 백엔드 서버 시작 (옵션 선택):

   **옵션 1: 직접 Python 모듈**
   ```bash
   python -m application.py
   ```

   **옵션 2: Uvicorn으로 FastAPI**
   ```bash
   # uvicorn이 설치되지 않은 경우 설치
   # uv 사용 (더 빠름):
   uv pip install uvicorn
   # 또는 pip 사용:
   # pip install uvicorn

   # 핫 리로드로 FastAPI 애플리케이션 실행
   uvicorn application:app --reload --port 8000
   ```

   백엔드는 다음에서 사용 가능합니다:
   - API 엔드포인트: `http://localhost:8000`

2. 프론트엔드 개발 서버 시작:
   ```bash
   cd ui
   npm run dev
   ```

3. `http://localhost:5173`에서 애플리케이션에 액세스

### 배포 옵션

애플리케이션은 다양한 클라우드 플랫폼에 배포할 수 있습니다. 몇 가지 일반적인 옵션은 다음과 같습니다:

- **Docker**: 애플리케이션에는 컨테이너화된 배포를 위한 Dockerfile이 포함되어 있습니다
- **Heroku**: Python 빌드팩으로 GitHub에서 직접 배포
- **Google Cloud Run**: 자동 스케일링을 통한 컨테이너화된 배포에 적합

귀하의 요구 사항에 가장 적합한 플랫폼을 선택하세요. 애플리케이션은 플랫폼에 구애받지 않으며 Python 웹 애플리케이션이 지원되는 곳이면 어디든 호스팅할 수 있습니다.

## 기여

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경 사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

## 라이선스

이 프로젝트는 Apache License 2.0 하에 라이선스가 부여됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 감사의 말

- 검색 API를 제공하는 [Tavily](https://tavily.com/)
- 모든 다른 오픈 소스 라이브러리와 그 기여자들

## Star History

<a href="https://www.star-history.com/?repos=guy-hartstein%2Fcompany-research-agent&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&theme=dark&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
 </picture>
</a>
