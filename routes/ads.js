const express = require('express');
const router = express.Router();
const adsController = require('../controllers/adsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const Joi = require('joi');

// 広告の登録スキーマ
const adSchema = Joi.object({
    type: Joi.string().valid('image', 'vast', 'vpaid').required(),
    data: Joi.object().required(),
    advertiserId: Joi.string().guid({ version: 'uuidv4' }).required()
});

// 広告の登録（広告主のみ）
router.post('/', authenticate, authorize('advertiser'), validate(adSchema), adsController.registerAd);

// 広告の取得（管理者および広告主のみ）
router.get('/:id', authenticate, authorize(['admin', 'advertiser']), adsController.getAd);

// 広告の更新（広告主のみ）
router.put('/:id', authenticate, authorize('advertiser'), validate(adSchema), adsController.updateAd);

// 広告の一覧取得（管理者および広告主のみ）
router.get('/', authenticate, authorize(['admin', 'advertiser']), adsController.getAllAds);

module.exports = router;
