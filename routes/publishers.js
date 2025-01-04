const express = require('express');
const router = express.Router();
const publishersController = require('../controllers/publishersController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const Joi = require('joi');

// 出版社の登録スキーマ
const publisherSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    paymentMethod: Joi.string().valid('paypal').required(),
    paymentDetails: Joi.object({
        paypalEmail: Joi.string().email().required()
    }).required()
});

// 出版社の登録（管理者のみ）
router.post('/', authenticate, authorize('admin'), validate(publisherSchema), publishersController.registerPublisher);

// 出版社の取得（管理者および出版社自身）
router.get('/:id', authenticate, authorize(['admin', 'publisher']), publishersController.getPublisher);

// 出版社の更新（管理者および出版社自身）
router.put('/:id', authenticate, authorize(['admin', 'publisher']), validate(publisherSchema), publishersController.updatePublisher);

// 出版社の一覧取得（管理者のみ）
router.get('/', authenticate, authorize('admin'), publishersController.getAllPublishers);

module.exports = router;
