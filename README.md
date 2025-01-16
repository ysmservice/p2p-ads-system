# p2p-ads-system

**Manage ads, advertisers, and publishers through a P2P network**

---

## 概要

**p2p-ads-system** は、広告主と出版社を管理し、P2P（ピアツーピア）ネットワークを通じて広告データを分散管理するシステムです。このシステムは、広告の登録、インタラクションの記録、累積支払いの管理など、広告運用に必要な機能を提供します。libp2p を使用してノード間でデータを同期し、高い可用性とスケーラビリティを実現しています。

## 主な機能

- **広告主管理**: 広告主の登録、取得、更新、一覧取得
- **出版社管理**: 出版社の登録、取得、更新、一覧取得
- **広告管理**: 広告の登録、取得、更新、一覧取得
- **インタラクション記録**: 広告に対するクリックやビデオビューの記録
- **累積支払い管理**: 広告インタラクションに基づく支払いの自動生成と管理
- **P2Pデータ同期**: libp2p を使用したノード間のデータ同期
- **PayPal統合**: 支払い処理のための PayPal API 統合
- **セキュリティ**: JWT認証、ロールベースのアクセス制御、入力検証

## 技術スタック

- **バックエンド**: Node.js, Express.js
- **データベース**: MariaDB, Sequelize ORM
- **P2Pネットワーク**: libp2p, GossipSub
- **認証**: JSON Web Tokens (JWT)
- **支払い処理**: PayPal Checkout SDK
- **その他**: Joi (入力検証), Winston (ロギング), Node-Cron (スケジューリング)

## セットアップ手順

### 1. プロジェクトのクローン

```bash
git clone https://github.com/yourusername/p2p-ads-system.git
cd p2p-ads-system
```

# 2. 必要なパッケージのインストール

Node.js と npm がインストールされていることを確認してください。次に、依存関係をインストールします。

```bash
npm install
```

# 3. 環境変数の設定

プロジェクトのルートディレクトリに .env ファイルを作成し、以下の環境変数を設定します。

```env
PORT=22335
MARIADB_URI=mariadb://ad_user:your_password@localhost:3306/p2p_ad_server
DB_USER=ad_user
DB_PASS=your_password
DB_NAME=p2p_ad_server
DB_HOST=localhost
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox
WEBHOOK_ID=your_paypal_webhook_id
JWT_SECRET=your_jwt_secret
INTERACTION_RATES={"click":0.05,"video_view":0.10}
BILLING_PERIOD_DAYS=30
LIBP2P_BOOTSTRAP_PEERS=/ip4/ysmads.net/tcp/15001/p2p/12D3KooWQnQx31VE3a3SgWBT7eqDAuujqxWX8dr7c1e4gfy789DF # 必要に応じて設定
```

注意:
	•	MARIADB_URI、DB_USER、DB_PASS、DB_NAME、DB_HOST は実際のデータベース接続情報に置き換えてください。
	•	PAYPAL_CLIENT_ID と PAYPAL_CLIENT_SECRET は PayPal の開発者ダッシュボードから取得してください。
	•	WEBHOOK_ID は PayPal の Webhook 設定から取得してください。
	•	JWT_SECRET は強力なランダム文字列を使用してください。
	•	LIBP2P_BOOTSTRAP_PEERS は既存のブートストラップノードのアドレスを設定します。初回起動時は空白でも問題ありません。

# 4. データベースのセットアップ

MariaDB をインストールし、以下のコマンドでデータベースとユーザーを作成します。

```sql
CREATE DATABASE p2p_ad_server;
CREATE USER 'ad_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON p2p_ad_server.* TO 'ad_user'@'localhost';
FLUSH PRIVILEGES;
```

# 5. サーバーの起動

```bash
node index.js
```

初回起動時には peer-id.json が自動的に生成され、P2Pノードが起動します。以降の起動では、保存されたPeer IDがロードされます。

# 使用方法

# APIエンドポイント
	•	広告主管理
	•	POST /advertisers: 広告主の登録（管理者のみ）
	•	GET /advertisers/:id: 広告主の取得（管理者のみ）
	•	PUT /advertisers/:id: 広告主の更新（管理者のみ）
	•	GET /advertisers: 広告主の一覧取得（管理者のみ）
	•	出版社管理
	•	POST /publishers: 出版社の登録（管理者のみ）
	•	GET /publishers/:id: 出版社の取得（管理者および出版社自身）
	•	PUT /publishers/:id: 出版社の更新（管理者および出版社自身）
	•	GET /publishers: 出版社の一覧取得（管理者のみ）
	•	広告管理
	•	POST /ads: 広告の登録（広告主のみ）
	•	GET /ads/id/:id: 広告の取得（管理者および広告主のみ）
	•	PUT /ads/:id: 広告の更新（広告主のみ）
	•	GET /ads: 広告の一覧取得（管理者および広告主のみ）
	•	インタラクション記録
	•	POST /interactions: インタラクションの記録（出版社および管理者）
	•	支払い管理
	•	POST /payments: 支払いの作成（管理者のみ）
	•	GET /payments: 支払い履歴の取得（管理者、広告主、出版社）
	•	GET /payments/:id: 特定の支払いの取得（管理者、広告主、出版社）
	•	POST /payments/webhook: PayPal Webhookのエンドポイント
	•	POST /payments/process-bulk-payments: 管理者による累積支払い処理の手動トリガー

# 認証と認可
	•	認証: JWT を使用してユーザーを認証します。各リクエストには Authorization ヘッダーに Bearer <token> を含める必要があります。
	•	認可: ユーザーのロール（admin, advertiser, publisher）に基づいてアクセス権を制御します。

# P2Pネットワークの設定
	•	ブートストラップノード: 環境変数 LIBP2P_BOOTSTRAP_PEERS に既存のブートストラップノードのアドレスを設定します。これにより、新しいノードがネットワークに参加できます。
	•	Peer ID: 各ノードは一意のPeer IDを持ち、peer-id.json に保存されます。これにより、ノードの一貫性と再起動後の同一性が保たれます。

# セキュリティ対策
	•	認証と認可: JWTベースの認証とロールベースの認可を実装し、不正アクセスを防止します。
	•	入力検証: Joiを使用して、すべてのリクエストボディを検証し、不正なデータの入力を防止します。
	•	エラーハンドリング: 共通のエラーハンドリングミドルウェアを使用し、エラーを一元的に処理します。
	•	ロギング: Winstonを使用して、システムの状態やエラーを詳細にログに記録します。
	•	環境変数の管理: .env ファイルを使用して、機密情報を安全に管理します。.env ファイルはバージョン管理に含めないようにします。
	•	セキュリティヘッダー: 必要に応じて、helmet などのミドルウェアを使用して、セキュリティヘッダーを追加します。
	•	CORS設定: フロントエンドからのリクエストを許可するために、CORS設定を適切に行います。

# デプロイとスケーリング
	•	デプロイ: 本番環境へのデプロイには、Dockerを使用するか、クラウドサービス（例: AWS、Heroku、DigitalOcean）を利用します。
	•	スケーリング: 負荷に応じてノードを追加し、P2Pネットワークをスケールアウトします。データベースのスケーリングも考慮します。

# ロギングとモニタリング
	•	Winston: ログはコンソールと app.log ファイルに出力されます。ログレベルは環境によって変更可能です。
	•	モニタリング: ログファイルを監視し、システムの健全性を維持します。必要に応じて、モニタリングツール（例: Prometheus, Grafana）を導入します。

# P2Pネットワークの詳細

libp2p を使用して、ノード間で広告データを分散管理します。各ノードは以下のトピックにサブスクライブし、データのブロードキャストを行います。
	•	advertiser
	•	publisher
	•	ad
	•	interaction
	•	payment

# メッセージフォーマット

protobuf を使用して、各データモデル（広告主、出版社、広告、インタラクション、支払い）のメッセージをシリアライズ・デシリアライズします。これにより、効率的かつ互換性のあるデータ通信が可能になります。

# データ同期

ノード間でデータがブロードキャストされると、受信側ノードはデータベースに保存します。これにより、全てのノードが最新のデータを保持し、一貫性を保つことができます。

# 貢献

貢献は大歓迎です！以下の手順でプロジェクトに貢献してください。
	1.	Fork: リポジトリをフォークします。
	2.	ブランチ作成: feature/your-feature-name ブランチを作成します。
	3.	コミット: 変更をコミットします。
	4.	プッシュ: ブランチをプッシュします。
	5.	プルリクエスト: フォーク先からオリジナルのリポジトリにプルリクエストを作成します。

# ライセンス

このプロジェクトは MIT ライセンス の下でライセンスされています。

# 連絡先

プロジェクトに関する質問や提案がある場合は、以下の連絡先までご連絡ください。
	•	メール: support@ysmfilm.net
	•	GitHub Issues: Issuesページ

# 追加情報

# Dockerを使用したセットアップ（オプション）

Dockerを使用してプロジェクトをコンテナ化することで、依存関係の管理やデプロイが容易になります。以下は、簡単な Dockerfile と docker-compose.yml の例です。

# Dockerfile
```docker
FROM node:14

# 作業ディレクトリの作成
WORKDIR /usr/src/app

# パッケージのコピーとインストール
COPY package*.json ./
RUN npm install

# アプリケーションコードのコピー
COPY . .

# ポートの公開
EXPOSE 3000

# アプリケーションの起動
CMD ["node", "index.js"]
```
# docker-compose.yml
```yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - .:/usr/src/app
    depends_on:
      - db

  db:
    image: mariadb
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: your_root_password
      MYSQL_DATABASE: p2p_ad_server
      MYSQL_USER: ad_user
      MYSQL_PASSWORD: your_password
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

セットアップ手順
	1.	DockerとDocker Composeのインストール: 公式サイトからインストールします。
	2.	.env ファイルの作成: 上記の環境変数を設定します。
	3.	コンテナの起動:
```bash
docker-compose up -d
```

	4.	ログの確認:
```bash
docker-compose logs -f
```


# テストの実装

プロジェクトの品質を保つために、ユニットテストや統合テストを実装することを推奨します。以下は、Jest を使用した簡単なテストの例です。

# インストール
```bash
npm install --save-dev jest supertest
```
# テストスクリプトの追加

package.json に以下を追加します。
```json
"scripts": {
    "test": "jest"
}
```
# テストファイルの作成

tests/advertisers.test.js
```js
const request = require('supertest');
const app = require('../index'); // Expressアプリケーションのエクスポートが必要

describe('Advertisers API', () => {
    it('should register a new advertiser', async () => {
        const res = await request(app)
            .post('/advertisers')
            .send({
                name: 'Test Advertiser',
                email: 'test@advertiser.com',
                paymentMethod: 'paypal',
                paymentDetails: {
                    paypalEmail: 'paypal@test.com'
                }
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('advertiser');
    });
});
```
# テストの実行
```bash
npm test
```
# おわりに

p2p-ads-system は、P2Pネットワークを活用した分散型広告管理システムです。高い可用性とスケーラビリティを実現し、効率的な広告運用をサポートします。今後のアップデートや新機能の追加にご期待ください。
