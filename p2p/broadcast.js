const { GossipSub } = require('@libp2p/gossipsub');
const protobuf = require('protobufjs');
const logger = require('../utils/logger');
const { Advertiser, Publisher, Ad, Interaction, Payment } = require('../models');

// トピックの定義
const TOPICS = {
    ADVERTISER: 'advertiser',
    PUBLISHER: 'publisher',
    AD: 'ad',
    INTERACTION: 'interaction',
    PAYMENT: 'payment'
};

// メッセージのシリアライズ/デシリアライズ
const root = protobuf.Root.fromJSON({
    nested: {
        Advertiser: {
            fields: {
                id: { type: 'string', id: 1 },
                name: { type: 'string', id: 2 },
                email: { type: 'string', id: 3 },
                paymentMethod: { type: 'string', id: 4 },
                paymentDetails: { type: 'string', id: 5 } // JSON.stringifyされたデータ
            }
        },
        Publisher: {
            fields: {
                id: { type: 'string', id: 1 },
                name: { type: 'string', id: 2 },
                email: { type: 'string', id: 3 },
                paymentMethod: { type: 'string', id: 4 },
                paymentDetails: { type: 'string', id: 5 } // JSON.stringifyされたデータ
            }
        },
        Ad: {
            fields: {
                id: { type: 'string', id: 1 },
                type: { type: 'string', id: 2 },
                data: { type: 'string', id: 3 }, // JSON.stringifyされたデータ
                advertiserId: { type: 'string', id: 4 }
            }
        },
        Interaction: {
            fields: {
                id: { type: 'string', id: 1 },
                adId: { type: 'string', id: 2 },
                publisherId: { type: 'string', id: 3 },
                interactionType: { type: 'string', id: 4 },
                timestamp: { type: 'string', id: 5 } // ISO文字列
            }
        },
        Payment: {
            fields: {
                id: { type: 'int32', id: 1 },
                adType: { type: 'string', id: 2 },
                adId: { type: 'string', id: 3 },
                publisherId: { type: 'string', id: 4 },
                advertiserId: { type: 'string', id: 5 },
                amount: { type: 'double', id: 6 },
                currency: { type: 'string', id: 7 },
                status: { type: 'string', id: 8 },
                paypalTransactionId: { type: 'string', id: 9 },
                createdAt: { type: 'string', id: 10 } // ISO文字列
            }
        }
    }
});

// 各メッセージのエンコーダー/デコーダー
const AdvertiserMessage = root.lookupType('Advertiser');
const PublisherMessage = root.lookupType('Publisher');
const AdMessage = root.lookupType('Ad');
const InteractionMessage = root.lookupType('Interaction');
const PaymentMessage = root.lookupType('Payment');

const encodeAdvertiser = (advertiser) => AdvertiserMessage.encode(AdvertiserMessage.create(advertiser)).finish();
const decodeAdvertiser = (buffer) => AdvertiserMessage.toObject(AdvertiserMessage.decode(buffer), { enums: String, longs: String });

const encodePublisher = (publisher) => PublisherMessage.encode(PublisherMessage.create(publisher)).finish();
const decodePublisher = (buffer) => PublisherMessage.toObject(PublisherMessage.decode(buffer), { enums: String, longs: String });

const encodeAd = (ad) => AdMessage.encode(AdMessage.create(ad)).finish();
const decodeAd = (buffer) => AdMessage.toObject(AdMessage.decode(buffer), { enums: String, longs: String });

const encodeInteraction = (interaction) => InteractionMessage.encode(InteractionMessage.create(interaction)).finish();
const decodeInteraction = (buffer) => InteractionMessage.toObject(InteractionMessage.decode(buffer), { enums: String, longs: String });

const encodePayment = (payment) => PaymentMessage.encode(PaymentMessage.create(payment)).finish();
const decodePayment = (buffer) => PaymentMessage.toObject(PaymentMessage.decode(buffer), { enums: String, longs: String });

// ブロードキャスト関数
const broadcastAdvertiser = (advertiser) => {
    if (global.libp2p && global.libp2p.pubsub) {
        const data = encodeAdvertiser(advertiser);
        global.libp2p.pubsub.publish(TOPICS.ADVERTISER, data);
        logger.info(`Advertiserブロードキャスト: ${{advertiser.id}}`);
    }
};

const broadcastPublisher = (publisher) => {
    if (global.libp2p && global.libp2p.pubsub) {
        const data = encodePublisher(publisher);
        global.libp2p.pubsub.publish(TOPICS.PUBLISHER, data);
        logger.info(`Publisherブロードキャスト: ${{publisher.id}}`);
    }
};

const broadcastAd = (ad) => {
    if (global.libp2p && global.libp2p.pubsub) {
        const data = encodeAd(ad);
        global.libp2p.pubsub.publish(TOPICS.AD, data);
        logger.info(`Adブロードキャスト: ${{ad.id}}`);
    }
};

const broadcastInteraction = (interaction) => {
    if (global.libp2p && global.libp2p.pubsub) {
        const data = encodeInteraction(interaction);
        global.libp2p.pubsub.publish(TOPICS.INTERACTION, data);
        logger.info(`Interactionブロードキャスト: ${{interaction.id}}`);
    }
};

const broadcastPayment = (payment) => {
    if (global.libp2p && global.libp2p.pubsub) {
        const data = encodePayment(payment);
        global.libp2p.pubsub.publish(TOPICS.PAYMENT, data);
        logger.info(`Paymentブロードキャスト: ${{payment.id}}`);
    }
};

module.exports = {
    broadcastAdvertiser,
    broadcastPublisher,
    broadcastAd,
    broadcastInteraction,
    broadcastPayment
};
