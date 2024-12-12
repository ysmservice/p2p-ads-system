# P2P分散型広告サーバー API仕様書

## 認証

### ユーザー登録

- **URL**: `/users/register`
- **メソッド**: `POST`
- **説明**: 新しいユーザーを登録します。
- **リクエストボディ**:

    ```json
    {
        "username": "user1",
        "email": "user1@example.com",
        "password": "StrongP@ssw0rd",
        "role": "advertiser" | "publisher" | "admin"
    }
    ```

- **レスポンス**:
    - **成功時**: `201 Created`

        ```json
        {
            "message": "User registered successfully",
            "token": "jwt_token_here"
        }
        ```

    - **エラー時**: 適切なステータスコードとエラーメッセージ。

### ユーザーログイン

- **URL**: `/users/login`
- **メソッド**: `POST`
- **説明**: ユーザーがログインします。
- **リクエストボディ**:

    ```json
    {
        "email": "user1@example.com",
        "password": "StrongP@ssw0rd"
    }
    ```

- **レスポンス**:
    - **成功時**: `200 OK`

        ```json
        {
            "message": "Logged in successfully",
            "token": "jwt_token_here"
        }
        ```

    - **エラー時**: 適切なステータスコードとエラーメッセージ。

### トークンリフレッシュ

- **URL**: `/auth/refresh`
- **メソッド**: `POST`
- **説明**: JWTトークンをリフレッシュします。
- **リクエストボディ**:

    ```json
    {
        "token": "expired_jwt_token_here"
    }
    ```

- **レスポンス**:
    - **成功時**: `200 OK`

        ```json
        {
            "token": "new_jwt_token_here"
        }
        ```

    - **エラー時**: 適切なステータスコードとエラーメッセージ。

## エンドポイント

### 1. 広告主管理API

- **POST /advertisers**
  - **説明**: 新しい広告主を登録します。（管理者のみ）
  - **リクエストボディ**:
    ```json
    {
        "name": "Advertiser Name",
        "email": "advertiser@example.com",
        "paymentMethod": "paypal",
        "paymentDetails": {
            "paypalEmail": "advertiser_paypal@example.com"
        }
    }
    ```
  - **レスポンス**:
    ```json
    {
        "message": "Advertiser registered successfully",
        "advertiser": { ... }
    }
    ```

- **GET /advertisers**
  - **説明**: すべての広告主を取得します。（管理者のみ）
  - **レスポンス**:
    ```json
    {
        "advertisers": [ ... ]
    }
    ```

- **GET /advertisers/:id**
  - **説明**: 特定の広告主を取得します。（管理者のみ）
  - **レスポンス**:
    ```json
    {
        "advertiser": { ... }
    }
    ```

- **PUT /advertisers/:id**
  - **説明**: 特定の広告主を更新します。（管理者のみ）
  - **リクエストボディ**:
    ```json
    {
        "name": "Updated Advertiser Name",
        "email": "updated_advertiser@example.com",
        "paymentMethod": "paypal",
        "paymentDetails": {
            "paypalEmail": "updated_advertiser_paypal@example.com"
        }
    }
    ```
  - **レスポンス**:
    ```json
    {
        "message": "Advertiser updated successfully",
        "advertiser": { ... }
    }
    ```

### 2. 出版社管理API

- **POST /publishers**
  - **説明**: 新しい出版社を登録します。（管理者のみ）
  - **リクエストボディ**:
    ```json
    {
        "name": "Publisher Name",
        "email": "publisher@example.com",
        "paymentMethod": "paypal",
        "paymentDetails": {
            "paypalEmail": "publisher_paypal@example.com"
        }
    }
    ```
  - **レスポンス**:
    ```json
    {
        "message": "Publisher registered successfully",
        "publisher": { ... }
    }
    ```

- **GET /publishers**
  - **説明**: すべての出版社を取得します。（管理者のみ）
  - **レスポンス**:
    ```json
    {
        "publishers": [ ... ]
    }
    ```

- **GET /publishers/:id**
  - **説明**: 特定の出版社を取得します。（管理者および出版社自身）
  - **レスポンス**:
    ```json
    {
        "publisher": { ... }
    }
    ```

- **PUT /publishers/:id**
  - **説明**: 特定の出版社を更新します。（管理者および出版社自身）
  - **リクエストボディ**:
    ```json
    {
        "name": "Updated Publisher Name",
        "email": "updated_publisher@example.com",
        "paymentMethod": "paypal",
        "paymentDetails": {
            "paypalEmail": "updated_publisher_paypal@example.com"
        }
    }
    ```
  - **レスポンス**:
    ```json
    {
        "message": "Publisher updated successfully",
        "publisher": { ... }
    }
    ```

### 3. 広告管理API
### **広告タイプ (`ads` の `type`)**

以下はサポートされる広告タイプのリストです。

| タイプ名   | 説明                                                                 |
| ---------- | -------------------------------------------------------------------- |
| `image`    | 静的な画像広告。サイズ指定（例: 300x250）に対応します。              |
| `vast`     | 動画広告。VAST（Video Ad Serving Template）形式をサポートします。   |
| `vpaid`    | 動画広告。VPAID（Video Player-Ad Interface Definition）をサポートします。 |

---

### **広告登録時の JSON サンプル**

#### 画像広告 (`image`)

```json
{
    "type": "image",
    "data": {
        "file": "banner_300x250.jpg",
        "width": 300,
        "height": 250
    },
    "advertiserId": "advertiser_uuid"
}
```

#### VAST広告 (`vast`)

```json
{
    "type": "vast",
    "data": {
        "vastUrl": "https://example.com/vast.xml"
    },
    "advertiserId": "advertiser_uuid"
}
```

#### VPAID広告 (`vpaid`)

```json
{
    "type": "vpaid",
    "data": {
        "scriptUrl": "https://example.com/vpaid.js",
        "parameters": {
            "key1": "value1",
            "key2": "value2"
        }
    },
    "advertiserId": "advertiser_uuid"
}
```

---

### **インタラクションタイプ (`interactionType`)**

以下はサポートされるインタラクションタイプのリストです。

| タイプ名     | 説明                                                                 |
| ------------ | -------------------------------------------------------------------- |
| `click`      | 広告がクリックされた場合に記録されます。                              |
| `view`       | 動画広告の指定時間（例: 50%視聴）を超えた場合に記録。                |
| `hover`      | ユーザーが広告上に一定時間マウスをホバーした場合に記録されます。      |
| `engagement` | ユーザーが広告上で特定のアクション（例: スクロール、ズーム）を行った場合に記録されます。 |
| `complete`   | 動画広告が最後まで再生された場合に記録されます。                      |

---
- **POST /ads**
  - **説明**: 新しい広告を登録します。（広告主のみ）
  - **リクエストボディ**:
    ```json
    {
        "type": "image",
        "data": {
            "file": "banner_300x250.jpg",
            "width": 300,
            "height": 250
        },
        "advertiserId": "advertiser_uuid"
    }
    ```
  - **レスポンス**:
    ```json
    {
        "message": "Ad registered successfully",
        "ad": { ... }
    }
    ```

- **GET /ads**
  - **説明**: すべての広告を取得します。（管理者および広告主のみ）
  - **レスポンス**:
    ```json
    {
        "ads": [ ... ]
    }
    ```

- **GET /ads/:id**
  - **説明**: 特定の広告を取得します。（管理者および広告主のみ）
  - **レスポンス**:
    ```json
    {
        "ad": { ... }
    }
    ```

- **PUT /ads/:id**
  - **説明**: 特定の広告を更新します。（広告主のみ）
  - **リクエストボディ**:
    ```json
    {
        "type": "image",
        "data": {
            "file": "banner_300x250_new.jpg",
            "width": 300,
            "height": 250
        },
        "advertiserId": "advertiser_uuid"
    }
    ```
  - **レスポンス**:
    ```json
    {
        "message": "Ad updated successfully",
        "ad": { ... }
    }
    ```

### 4. インタラクション記録API

- **POST /interactions**
  - **説明**: 広告インタラクション（クリック、動画視聴など）を記録します。（出版社および管理者）
  - **リクエストボディ**:
    ```json
    {
        "adId": "ad_uuid",
        "interactionType": "click"
    }
    ```
  - **レスポンス**:
    ```json
    {
        "message": "Interaction recorded successfully",
        "interaction": { ... }
    }
    ```

### 5. 支払い管理API

- **POST /payments**
  - **説明**: 新しい支払いを作成します。（管理者のみ）
  - **リクエストボディ**:
    ```json
    {
        "adType": "image",
        "adId": "ad_uuid",
        "amount": 10.00
    }
    ```
  - **レスポンス**:
    ```json
    {
        "message": "Payment created successfully",
        "payment": { ... }
    }
    ```

- **GET /payments**
  - **説明**: すべての支払い履歴を取得します。（管理者、広告主、出版社）
  - **レスポンス**:
    ```json
    {
        "payments": [ ... ]
    }
    ```

- **GET /payments/:id**
  - **説明**: 特定の支払いを取得します。（管理者、広告主、出版社）
  - **レスポンス**:
    ```json
    {
        "payment": { ... }
    }
    ```

- **POST /payments/webhook**
  - **説明**: PayPalからのWebhook通知を処理します。
  - **レスポンス**:
    ```json
    "Webhook received and processed"
    ```

- **POST /payments/process-bulk-payments**
  - **説明**: 累積支払い処理を手動でトリガーします。（管理者のみ）
  - **レスポンス**:
    ```json
    {
        "message": "Bulk payments processed successfully"
    }
    ```

---

## 14. P2Pデータ同期の詳細実装

### 14.1 データの受信時の処理

`p2p/node.js`内で、P2Pネットワークから受信したデータを処理し、ローカルのデータベースに保存します。以下に、`p2p/node.js`の修正版を示します。

```javascript
// p2p/node.js
const Libp2p = require('libp2p');
const TCP = require('@libp2p/tcp');
const WebSockets = require('@libp2p/websockets');
const Mplex = require('@libp2p/mplex');
const { Noise } = require('@libp2p/noise');
const Bootstrap = require('@libp2p/bootstrap');
const Gossipsub = require('@libp2p/gossipsub');
const logger = require('../utils/logger');
const { decodeAdvertiser, decodePublisher, decodeAd, decodeInteraction, decodePayment } = require('../p2p/broadcast');
const { Advertiser, Publisher, Ad, Interaction, Payment } = require('../models');

// トピックの定義
const TOPICS = {
    ADVERTISER: 'advertiser',
    PUBLISHER: 'publisher',
    AD: 'ad',
    INTERACTION: 'interaction',
    PAYMENT: 'payment'
};

const createLibp2pNode = async () => {
    const node = await Libp2p.create({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/15002', '/ip4/0.0.0.0/tcp/15003/ws']
        },
        modules: {
            transport: [TCP, WebSockets],
            streamMuxer: [Mplex],
            connEncryption: [Noise],
            pubsub: Gossipsub,
            bootstrap: Bootstrap
        },
        config: {
            pubsub: {
                enabled: true,
                emitSelf: false
            },
            bootstrap: {
                list: process.env.LIBP2P_BOOTSTRAP_PEERS ? process.env.LIBP2P_BOOTSTRAP_PEERS.split(',') : []
            }
        }
    });

    // トピックにサブスクライブ
    for (const topic of Object.values(TOPICS)) {
        await node.pubsub.subscribe(topic, async (msg) => {
            if (msg.from === node.peerId.toB58String()) return; // 自分自身からのメッセージは無視

            switch (topic) {
                case TOPICS.ADVERTISER:
                    const advertiser = decodeAdvertiser(msg.data);
                    logger.info(`P2Pから広告主を受信: ${advertiser.id}`);
                    // 既存の広告主が存在しない場合にのみ作成
                    await Advertiser.findOrCreate({
                        where: { id: advertiser.id },
                        defaults: advertiser
                    });
                    break;
                case TOPICS.PUBLISHER:
                    const publisher = decodePublisher(msg.data);
                    logger.info(`P2Pから出版社を受信: ${publisher.id}`);
                    await Publisher.findOrCreate({
                        where: { id: publisher.id },
                        defaults: publisher
                    });
                    break;
                case TOPICS.AD:
                    const ad = decodeAd(msg.data);
                    logger.info(`P2Pから広告を受信: ${ad.id}`);
                    await Ad.findOrCreate({
                        where: { id: ad.id },
                        defaults: ad
                    });
                    break;
                case TOPICS.INTERACTION:
                    const interaction = decodeInteraction(msg.data);
                    logger.info(`P2Pからインタラクションを受信: ${interaction.id}`);
                    await Interaction.findOrCreate({
                        where: { id: interaction.id },
                        defaults: interaction
                    });
                    break;
                case TOPICS.PAYMENT:
                    const payment = decodePayment(msg.data);
                    logger.info(`P2Pから支払いを受信: ${payment.id}`);
                    await Payment.findOrCreate({
                        where: { id: payment.id },
                        defaults: payment
                    });
                    break;
                default:
                    logger.warn(`未知のトピックからのメッセージ: ${topic}`);
            }
        });
    }

    await node.start();
    logger.info('libp2p node started');

    return node;
};

module.exports = createLibp2pNode;
