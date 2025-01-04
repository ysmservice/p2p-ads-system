const express = require('express');
const router = express.Router();
const advertisersController = require('../controllers/advertisersController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const Joi = require('joi');

// 広告主の登録スキーマ
const advertiserSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    paymentMethod: Joi.string().valid('paypal').required(),
    paymentDetails: Joi.object({
        paypalEmail: Joi.string().email().required()
    }).required()
});

// 広告主の登録（管理者のみ）
router.post('/', authenticate, authorize('admin'), validate(advertiserSchema), advertisersController.registerAdvertiser);

// 広告主の取得（管理者のみ）
router.get('/:id', authenticate, authorize('admin'), advertisersController.getAdvertiser);

// 広告主の更新（管理者のみ）
router.put('/:id', authenticate, authorize('admin'), validate(advertiserSchema), advertisersController.updateAdvertiser);

// 広告主の一覧取得（管理者のみ）
router.get('/', authenticate, authorize('admin'), advertisersController.getAllAdvertisers);

module.exports = router;
