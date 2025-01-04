import express from 'express';
import * as paymentsController from '../controllers/paymentsController.js';
import authenticate from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import validate from '../middleware/validate.js';
import Joi from 'joi';

const router = express.Router();

// 支払いの作成スキーマ
const paymentSchema = Joi.object({
    adType: Joi.string().valid('image', 'vast', 'vpaid', 'bulk').required(),
    adId: Joi.string().guid({ version: 'uuidv4' }).allow(null),
    amount: Joi.number().precision(2).positive().required()
});

// 支払いの作成（管理者のみ）
router.post('/', authenticate, authorize(['admin']), validate(paymentSchema), paymentsController.createPaymentInternal);

// 支払い履歴の取得（管理者、広告主、出版社）
router.get('/', authenticate, authorize(['admin', 'advertiser', 'publisher']), paymentsController.getAllPayments);

// 特定の支払いの取得（管理者、広告主、出版社）
router.get('/:id', authenticate, authorize(['admin', 'advertiser', 'publisher']), paymentsController.getPayment);

// PayPal Webhookのエンドポイント
router.post('/webhook', paymentsController.handleWebhook);

// 管理者による累積支払い処理の手動トリガー
router.post('/process-bulk-payments', authenticate, authorize(['admin']), paymentsController.processBulkPayments);

export default router;
