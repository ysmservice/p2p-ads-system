import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { mdns } from '@libp2p/mdns'
import { bootstrap } from '@libp2p/bootstrap'
import { mplex } from '@libp2p/mplex'
import { noise } from '@chainsafe/libp2p-noise'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { kadDHT } from '@libp2p/kad-dht'
import { peerIdFromString } from '@libp2p/peer-id'
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { identify } from '@libp2p/identify'  // Add this import
import logger from '../utils/logger.js'
import broadcastModule from '../p2p/broadcast.js'
import '../utils/events.mjs';
import '../utils/customEvent.mjs';
const {
  broadcastAd,
  broadcastAdvertiser,
  broadcastInteraction,
  broadcastPayment,
  broadcastPublisher,
  decodeAdvertiser,
  decodePublisher,
  decodeAd,
  decodeInteraction,
  decodePayment
} = broadcastModule
import models from '../models/index.js'
const { Advertiser, Publisher, Ad, Interaction, Payment } = models
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const TOPICS = {
  ADVERTISER: 'advertiser',
  PUBLISHER: 'publisher',
  AD: 'ad',
  INTERACTION: 'interaction',
  PAYMENT: 'payment',
  SYNC_REQUEST: 'sync_request'
}

const PEER_ID_PATH = path.join(__dirname, '..', 'peer-id.json')

const getPeerId = async () => {
  const peerIdDir = path.dirname(PEER_ID_PATH)
  await fs.ensureDir(peerIdDir)

  if (await fs.pathExists(PEER_ID_PATH)) {
    const peerIdJSON = await fs.readJson(PEER_ID_PATH)
    return peerIdFromString(peerIdJSON.id)
  } else {
    const peerId = await createEd25519PeerId()
    await fs.writeJson(PEER_ID_PATH, { id: peerId.toString() }, { spaces: 2 })
    return peerId
  }
}

const requestSync = async (node) => {
  try {
    if (!node.services.pubsub) {
      logger.error('PubSub not initialized')
      return
    }
    
    const peers = node.services.pubsub.getSubscribers(TOPICS.ADVERTISER)
    for (const peerId of peers) {
      if (peerId !== node.peerId.toString()) {
        await node.services.pubsub.publish(TOPICS.SYNC_REQUEST, Buffer.from(peerId))
      }
    }
  } catch (err) {
    logger.error(`Error in requestSync: ${err.message}`)
  }
}

const handleSyncRequest = async (node, msg) => {
  try {
    const peerId = msg.data.toString()
    if (peerId !== node.peerId.toB58String()) {
      const advertisers = await Advertiser.findAll()
      const publishers = await Publisher.findAll()
      const ads = await Ad.findAll()
      const interactions = await Interaction.findAll()
      const payments = await Payment.findAll()

      for (const advertiser of advertisers) {
        broadcastAdvertiser(advertiser)
      }
      for (const publisher of publishers) {
        broadcastPublisher(publisher)
      }
      for (const ad of ads) {
        broadcastAd(ad)
      }
      for (const interaction of interactions) {
        broadcastInteraction(interaction)
      }
      for (const payment of payments) {
        broadcastPayment(payment)
      }
    }
  } catch (err) {
    logger.error(`Error handling sync request: ${err.message}`)
  }
}

let nodeInstance = null;

export default async function createLibp2pNode() {
  const peerId = await getPeerId()

  const node = await createLibp2p({
    peerId,
    addresses: {
      listen: ['/ip4/0.0.0.0/tcp/15001']
    },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    services: {
      identify: identify(),  // Use identify service
      pubsub: gossipsub({
        emitSelf: false,
        enabled: true,
        allowPublishToZeroPeers: true,
        canRelayMessages: true,
        directPeers: [],
      }),
      dht: kadDHT()
    },
    peerDiscovery: [
      mdns({
        interval: 20000
      }),
      bootstrap({
        list: process.env.LIBP2P_BOOTSTRAP_PEERS
          ? process.env.LIBP2P_BOOTSTRAP_PEERS.split(',')
          : []
      })
    ],
  })

  // Start the node
  await node.start()
  logger.info('libp2p node started')

  // Verify pubsub service is available
  if (!node.services.pubsub) {
    throw new Error('Pubsub service not available')
  }

  // Store node instance
  nodeInstance = node

  // Wait for services to initialize
  await new Promise(resolve => setTimeout(resolve, 2000))

  try {
    await setupSubscriptions(node)
    logger.info('Node subscriptions initialized')
  } catch (err) {
    logger.error(`Failed to initialize subscriptions: ${err.message}`)
    throw err
  }

  return node
}

async function setupSubscriptions(node) {
  for (const topic of Object.values(TOPICS)) {
    try {
      await node.services.pubsub.subscribe(topic, msg => handleMessage(node, topic, msg))
      logger.info(`Subscribed to topic: ${topic}`)
    } catch (err) {
      logger.error(`Failed to subscribe to topic ${topic}: ${err.message}`)
      throw err
    }
  }

  // Set up sync request handler
  await node.services.pubsub.subscribe(TOPICS.SYNC_REQUEST, 
    msg => handleSyncRequest(node, msg)
  )

  // Start periodic sync
  setInterval(() => requestSync(node), 3600000)
}

async function handleMessage(node, topic, msg) {
  if (msg.from === node.peerId.toString()) return
  try {
    switch (topic) {
      case TOPICS.ADVERTISER:
        const advertiser = decodeAdvertiser(msg.data)
        logger.info(`P2Pから広告主を受信: ${advertiser.id}`)
        await Advertiser.findOrCreate({
          where: { id: advertiser.id },
          defaults: advertiser
        })
        break
      case TOPICS.PUBLISHER:
        const publisher = decodePublisher(msg.data)
        logger.info(`P2Pから出版社を受信: ${publisher.id}`)
        await Publisher.findOrCreate({
          where: { id: publisher.id },
          defaults: publisher
        })
        break
      case TOPICS.AD:
        const ad = decodeAd(msg.data)
        logger.info(`P2Pから広告を受信: ${ad.id}`)
        await Ad.findOrCreate({
          where: { id: ad.id },
          defaults: ad
        })
        break
      case TOPICS.INTERACTION:
        const interaction = decodeInteraction(msg.data)
        logger.info(`P2Pからインタラクションを受信: ${interaction.id}`)
        await Interaction.findOrCreate({
          where: { id: interaction.id },
          defaults: interaction
        })
        break
      case TOPICS.PAYMENT:
        const payment = decodePayment(msg.data)
        logger.info(`P2Pから支払いを受信: ${payment.id}`)
        await Payment.findOrCreate({
          where: { id: payment.id },
          defaults: payment
        })
        break
      default:
        logger.warn(`未知のトピックからのメッセージ: ${topic}`)
    }
  } catch (err) {
    logger.error(`Message handling error for topic ${topic}: ${err.message}`)
  }
}

function getNodeInstance() {
  return nodeInstance;
}

export { getNodeInstance };