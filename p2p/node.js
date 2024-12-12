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
const { createFromJSON, generate } = require('@libp2p/peer-id-factory');
const fs = require('fs-extra');
const path = require('path');

// トピックの定義
const TOPICS = {
    ADVERTISER: 'advertiser',
    PUBLISHER: 'publisher',
    AD: 'ad',
    INTERACTION: 'interaction',
    PAYMENT: 'payment'
};

// Peer IDの保存パス
const PEER_ID_PATH = path.join(__dirname, '..', 'peer-id.json');

// Peer IDの読み込みまたは生成
const getPeerId = async () => {
    const peerIdDir = path.dirname(PEER_ID_PATH);
    await fs.ensureDir(peerIdDir); // ディレクトリが存在しない場合は作成

    if (await fs.pathExists(PEER_ID_PATH)) {
        const peerIdJSON = await fs.readJson(PEER_ID_PATH);
        const peerId = await createFromJSON(peerIdJSON);
        logger.info(`既存のPeer IDをロードしました: ${{peerId.toB58String()}}`);
        return peerId;
    } else {
        const peerId = await generate({ type: 'Ed25519' });
        await fs.writeJson(PEER_ID_PATH, peerId.toJSON(), { spaces: 2 });
        logger.info(`新しいPeer IDを生成しました: ${{peerId.toB58String()}}`);
        return peerId;
    }
};

const createLibp2pNode = async () => {
    const peerId = await getPeerId();

    const node = await Libp2p.create({
        peerId,
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/15002', '/ip4/0.0.0.0/tcp/15003/ws']
        },
        transports: [
            new TCP(),
            new WebSockets()
        ],
        streamMuxers: [
            new Mplex()
        ],
        connectionEncryption: [
            new Noise()
        ],
        pubsub: new Gossipsub(),
        peerDiscovery: [
            new Bootstrap({
                list: process.env.LIBP2P_BOOTSTRAP_PEERS ? process.env.LIBP2P_BOOTSTRAP_PEERS.split(',') : []
            })
        ]
    });

    // トピックにサブスクライブ
    for (const topic of Object.values(TOPICS)) {
        await node.pubsub.subscribe(topic, async (msg) => {
            if (msg.from === node.peerId.toB58String()) return; // 自分自身からのメッセージは無視

            switch (topic) {
                case TOPICS.ADVERTISER:
                    const advertiser = decodeAdvertiser(msg.data);
                    logger.info(`P2Pから広告主を受信: ${{advertiser.id}}`);
                    // 既存の広告主が存在しない場合にのみ作成
                    await Advertiser.findOrCreate({
                        where: { id: advertiser.id },
                        defaults: advertiser
                    });
                    break;
                case TOPICS.PUBLISHER:
                    const publisher = decodePublisher(msg.data);
                    logger.info(`P2Pから出版社を受信: ${{publisher.id}}`);
                    await Publisher.findOrCreate({
                        where: { id: publisher.id },
                        defaults: publisher
                    });
                    break;
                case TOPICS.AD:
                    const ad = decodeAd(msg.data);
                    logger.info(`P2Pから広告を受信: ${{ad.id}}`);
                    await Ad.findOrCreate({
                        where: { id: ad.id },
                        defaults: ad
                    });
                    break;
                case TOPICS.INTERACTION:
                    const interaction = decodeInteraction(msg.data);
                    logger.info(`P2Pからインタラクションを受信: ${{interaction.id}}`);
                    await Interaction.findOrCreate({
                        where: { id: interaction.id },
                        defaults: interaction
                    });
                    break;
                case TOPICS.PAYMENT:
                    const payment = decodePayment(msg.data);
                    logger.info(`P2Pから支払いを受信: ${{payment.id}}`);
                    await Payment.findOrCreate({
                        where: { id: payment.id },
                        defaults: payment
                    });
                    break;
                default:
                    logger.warn(`未知のトピックからのメッセージ: ${{topic}}`);
            }
        });
    }

    await node.start();
    logger.info('libp2p node started');

    return node;
};

module.exports = createLibp2pNode;
