 [![en](https://img.shields.io/badge/lang-en-red.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.md)
[![zh](https://img.shields.io/badge/lang-zh-green.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.zh.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.fr.md)
[![es](https://img.shields.io/badge/lang-es-yellow.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.es.md)
[![jp](https://img.shields.io/badge/lang-jp-orange.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.jp.md)
[![kr](https://img.shields.io/badge/lang-ko-purple.svg)](https://github.com/guy-hartstein/company-research-agent/blob/main/README.kr.md)


# 企業調査エージェント 🔍

![web ui](<static/ui-1.png>)

包括的な企業調査レポートを生成するマルチエージェントツール。このプラットフォームは、AIエージェントのパイプラインを使用して、あらゆる企業に関する情報を収集、整理、統合します。

✨オンラインで試してみてください！ https://companyresearcher.tavily.com ✨

https://github.com/user-attachments/assets/0e373146-26a7-4391-b973-224ded3182a9

## 機能

- **マルチソース調査**：企業ウェブサイト、ニュース記事、財務報告書、業界分析など、様々なソースからデータを取得
- **AIによるコンテンツフィルタリング**：Tavilyの関連性スコアを使用したコンテンツキュレーション
- **非同期処理**：調査の進捗を追跡するための効率的なポーリングベースアーキテクチャ
- **柔軟なモデル選択**：設定パネルで選んだ[OpenRouter](https://openrouter.ai)の任意のモデルを使用可能。フォールバックとしてOpenAI/Geminiの直接キーにも対応
- **モダンなReactフロントエンド**：進捗追跡とダウンロードオプションを備えたレスポンシブインターフェース
- **モジュラーアーキテクチャ**：専門的な調査・処理ノードのパイプラインを中心に構築

## エージェントフレームワーク

### 調査パイプライン

このプラットフォームは、データを順次処理する専門ノードを持つエージェントフレームワークに従います：

1. **調査ノード**：
   - `CompanyAnalyzer`：主要な企業情報を調査
   - `IndustryAnalyzer`：市場ポジションとトレンドを分析
   - `FinancialAnalyst`：財務指標とパフォーマンスデータを取得
   - `NewsScanner`：最新のニュースと動向を収集

2. **処理ノード**：
   - `Collector`：すべてのアナライザーから調査データを集約
   - `Curator`：コンテンツフィルタリングと関連性スコアリングを実装
   - `Briefing`：選択したモデルを使用してカテゴリ別の要約を生成
   - `Editor`：選択したモデルで要約を最終レポートにコンパイル・書式設定

   ![web ui](<static/agent-flow.png>)

### コンテンツ生成アーキテクチャ

すべてのLLMステップ（調査ノードでのクエリ生成、`Briefing`、`Editor`）は1つのモデルを使用します。プロバイダーの選択は`backend/llm.py`で行われます：

1. **OpenRouter（推奨）**：
   - OpenRouterキー（バックエンド`.env`の`OPENROUTER_API_KEY`、またはアプリの設定パネルで貼り付けたキー）がある場合、すべてのステップで設定パネルで選択したOpenRouterモデルを使用
   - デフォルトモデルは`google/gemini-3.8-flash`で、`OPENROUTER_MODEL`で変更可能

2. **フォールバック**：
   - OpenRouterキーがない場合は`OPENAI_API_KEY`（GPTモデル）を使用
   - `GEMINI_API_KEY`が設定されている場合のみ、要約生成にGemini 2.5 Flashを使用（Geminiキーは必須ではありません）

### コンテンツキュレーションシステム

このプラットフォームは`curator.py`でコンテンツフィルタリングシステムを使用します：

1. **関連性スコアリング**：
   - 文書はTavilyのAI検索によってスコア付けされます
   - 継続するには最小閾値（デフォルト0.4）が必要
   - スコアは検索クエリとの関連性を反映
   - 高スコアは検索意図とのより良い一致を示す

2. **文書処理**：
   - コンテンツは正規化・クリーニングされます
   - URLは重複除去・標準化されます
   - 文書は関連性スコアでソートされます
   - 調査はバックグラウンドで非同期実行されます

### バックエンドアーキテクチャ

プラットフォームはポーリングベースのシンプルな通信システムを実装します：

![web ui](<static/ui-2.png>)

1. **バックエンド実装**：
   - 非同期サポート付きのFastAPIを使用
   - 調査タスクはバックグラウンドで実行
   - 結果はRESTエンドポイント経由で保存・アクセス
   - シンプルなジョブステータス追跡
   
2. **フロントエンド統合**：
   - Reactフロントエンドが調査リクエストを送信
   - 追跡用のjob_idを受信
   - `/research/{job_id}/report`エンドポイントをポーリング
   - 完了時に最終レポートを表示

3. **APIエンドポイント**：
   - `POST /research`：新しい調査リクエストの送信（オプションで`openrouter_api_key`と`model`を指定可能）
   - `GET /models`：OpenRouterで利用可能なテキストモデルの一覧（1時間キャッシュ）
   - `GET /config`：サーバーに設定済みのLLMキーとデフォルトモデルを返す
   - `GET /research/{job_id}/report`：完了したレポートのポーリング
   - `POST /generate-pdf`：レポートコンテンツからPDFを生成

## セットアップ

### クイックセットアップ（推奨）

最も簡単な開始方法はセットアップスクリプトを使用することです。このスクリプトは自動的に`uv`を検出し、利用可能な場合はより高速なPythonパッケージインストールに使用します：

1. リポジトリをクローン：
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. セットアップスクリプトを実行可能にして実行：
```bash
chmod +x setup.sh
./setup.sh
```

セットアップスクリプトは以下を行います：

- `uv`を検出してより高速なPythonパッケージインストールに使用（利用可能な場合）
- 必要なPythonとNode.jsのバージョンを確認
- Python仮想環境を作成（推奨）
- すべての依存関係をインストール（PythonとNode.js）
- 環境変数の設定をガイド（TavilyキーとOpenRouterキーを入力。OpenRouterキーをスキップした場合のみOpenAI/Geminiキーを確認）
- バックエンドとフロントエンドサーバーを起動（オプション）

> **💡 プロのヒント**: [uv](https://github.com/astral-sh/uv)をインストールすることで、Pythonパッケージの大幅に高速なインストールが可能になります：
>
> ```bash
> curl -LsSf https://astral.sh/uv/install.sh | sh
> ```

以下のAPIキーが必要です：
- Tavily APIキー
- OpenRouter APIキー（推奨。後からアプリの設定パネルで貼り付けることも可能）
- OpenAI APIキー（OpenRouterを使用しない場合のみ）
- Google Gemini APIキー（オプション）
- Google Maps APIキー（オプション。所在地の自動補完にのみ使用）
- MongoDB URI（オプション）

### 手動セットアップ

手動でセットアップしたい場合は、以下の手順に従ってください：

1. リポジトリをクローン：
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. バックエンド依存関係をインストール：
```bash
# オプション：仮想環境を作成・アクティベート
# uv使用（より高速 - 利用可能な場合は推奨）：
uv venv .venv
source .venv/bin/activate

# または標準Python：
# python -m venv .venv
# source .venv/bin/activate

# Python依存関係をインストール
# uv使用（より高速）：
uv pip install -r requirements.txt

# またはpip使用：
# pip install -r requirements.txt
```

3. フロントエンド依存関係をインストール：
```bash
cd ui
npm install
```

4. **環境変数の設定**：

このプロジェクトはバックエンドとフロントエンド用に2つの個別の`.env`ファイルが必要です。

**バックエンド設定：**

プロジェクトのルートディレクトリに`.env`ファイルを作成し、バックエンドAPIキーを追加します：

```env
TAVILY_API_KEY=your_tavily_key
# 推奨：すべてのモデルに使える1つのキー（代わりにアプリの設定パネルでキーを貼り付けることも可能）
OPENROUTER_API_KEY=your_openrouter_key
# オプションのデフォルトモデル。ユーザーは設定パネルで別のモデルを選択可能
# OPENROUTER_MODEL=anthropic/claude-sonnet-5.5
# OpenRouterの代替：各プロバイダーの直接キー
# OPENAI_API_KEY=your_openai_key
# GEMINI_API_KEY=your_gemini_key

# オプション：MongoDB永続化を有効化
# MONGODB_URI=your_mongodb_connection_string
```

**フロントエンド設定：**

`ui`ディレクトリ内に`.env`ファイルを作成します。最初にサンプルファイルをコピーできます：

```bash
cp ui/.env.development.example ui/.env
```

次に、`ui/.env`を開いてフロントエンド環境変数を追加します：

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Dockerセットアップ

アプリケーションはDockerとDocker Composeを使用して実行できます：

1. リポジトリをクローン：
```bash
git clone https://github.com/guy-hartstein/company-research-agent.git
cd company-research-agent
```

2. **環境変数の設定**：

Docker設定は2つの個別の`.env`ファイルを使用します。

**バックエンド設定：**

プロジェクトのルートディレクトリに`.env`ファイルを作成し、バックエンドAPIキーを追加します：

```env
TAVILY_API_KEY=your_tavily_key
# 推奨：すべてのモデルに使える1つのキー（代わりにアプリの設定パネルでキーを貼り付けることも可能）
OPENROUTER_API_KEY=your_openrouter_key
# オプションのデフォルトモデル。ユーザーは設定パネルで別のモデルを選択可能
# OPENROUTER_MODEL=anthropic/claude-sonnet-5.5
# OpenRouterの代替：各プロバイダーの直接キー
# OPENAI_API_KEY=your_openai_key
# GEMINI_API_KEY=your_gemini_key

# オプション：MongoDB永続化を有効化
# MONGODB_URI=your_mongodb_connection_string
```

**フロントエンド設定：**

`ui`ディレクトリ内に`.env`ファイルを作成します。最初にサンプルファイルをコピーできます：

```bash
cp ui/.env.development.example ui/.env
```

次に、`ui/.env`を開いてフロントエンド環境変数を追加します：

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

3. コンテナをビルド・起動：
```bash
docker compose up --build
```

これによりバックエンドとフロントエンドサービスが起動します：
- バックエンドAPIは`http://localhost:8000`で利用可能
- フロントエンドは`http://localhost:5174`で利用可能

サービスを停止するには：
```bash
docker compose down
```

注意：`.env`の環境変数を更新する際は、コンテナを再起動する必要があります：
```bash
docker compose down && docker compose up
```

### アプリケーションの実行

1. バックエンドサーバーを起動（オプションを選択）：
```bash
# オプション1：直接Pythonモジュール
python -m application.py

# オプション2：UvicornでFastAPI
uvicorn application:app --reload --port 8000
```

2. 新しいターミナルでフロントエンドを起動：
```bash
cd ui
npm run dev
```

3. `http://localhost:5173`でアプリケーションにアクセス

## 使用方法

### モデルの選択

アプリ右上のモデルボタンをクリックすると**設定**パネルが開きます。ここではOpenRouterキーを貼り付けたり（キーはブラウザにのみ保存され、各調査リクエストと一緒に送信されます）、OpenRouterのモデルカタログをプロバイダー別にロゴ付きで検索・絞り込みできます。選択したモデルは調査パイプラインのすべてのステップで使用されます。OpenRouterキーがない場合、バックエンドは`OPENAI_API_KEY`にフォールバックします（`GEMINI_API_KEY`が設定されていれば要約生成にGeminiを使用）。

### ローカル開発

1. バックエンドサーバーを起動（オプションを選択）：

   **オプション1：直接Pythonモジュール**
   ```bash
   python -m application.py
   ```

   **オプション2：UvicornでFastAPI**
   ```bash
   # uvicornがインストールされていない場合はインストール
   # uv使用（より高速）：
   uv pip install uvicorn
   # またはpip使用：
   # pip install uvicorn

   # ホットリロード付きでFastAPIアプリケーションを実行
   uvicorn application:app --reload --port 8000
   ```

   バックエンドは以下で利用可能：
   - APIエンドポイント：`http://localhost:8000`

2. フロントエンド開発サーバーを起動：
   ```bash
   cd ui
   npm run dev
   ```

3. `http://localhost:5173`でアプリケーションにアクセス

> **⚡ パフォーマンス注意**: セットアップ時に`uv`を使用した場合、大幅に高速なパッケージインストールと依存関係解決の恩恵を受けられます。`uv`はRustで書かれた現代的なPythonパッケージマネージャーで、pipより10〜100倍高速です。

### デプロイメントオプション

アプリケーションは様々なクラウドプラットフォームにデプロイできます。一般的なオプションをいくつか紹介します：

- **Docker**：アプリケーションにはコンテナ化デプロイメント用のDockerfileが含まれています
- **Heroku**：PythonビルドパックでGitHubから直接デプロイ
- **Google Cloud Run**：自動スケーリング付きコンテナ化デプロイメントに適しています

ニーズに最も適したプラットフォームを選択してください。アプリケーションはプラットフォーム非依存で、Pythonウェブアプリケーションがサポートされているどこでもホストできます。

## 貢献

1. リポジトリをフォーク
2. 機能ブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add some amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを開く

## ライセンス

このプロジェクトはApache License 2.0の下でライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 謝辞

- 検索APIを提供する[Tavily](https://tavily.com/)
- その他すべてのオープンソースライブラリとその貢献者

## Star History

<a href="https://www.star-history.com/?repos=guy-hartstein%2Fcompany-research-agent&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&theme=dark&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=guy-hartstein/company-research-agent&type=date&legend=top-left&sealed_token=rVZ57B-p9qQLLTRRBDp35rtvlnI4AXK1HGSdEKraUS5xKABI__fDDwbOQ4DFxHDbSg5kT5whU7PRExyQTS9q2w-f_eICUpXxRSnQc9iUyggTJ3DFpFLrB6BrvfoLkprVCxCQhFyO6So8KZJ24DxC0_7OPdgg5jK3JPyXYmbRa8Zt91A-g90ua2UgtvBA" />
 </picture>
</a>
