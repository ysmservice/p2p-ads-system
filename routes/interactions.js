const express = require('express');
const router = express.Router();
const interactionsController = require('../controllers/interactionsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const Joi = require('joi');

// インタラクション記録のスキーマ
const interactionSchema = Joi.object({
    adId: Joi.string().guid({ version: 'uuidv4' }).required(),
    interactionType: Joi.string().valid('click', 'video_view').required()
});

// インタラクションの記録（出版社および管理者）
router.post('/', authenticate, authorize(['publisher', 'admin']), validate(interactionSchema), interactionsController.recordInteraction);

module.exports = router;
