const express = require('express');
const router = express.Router();
const advertiserStatsController = require('../controllers/advertiserStatsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// 広告主の統計情報の取得（管理者および広告主のみ）
router.get('/', authenticate, authorize(['admin', 'advertiser']), advertiserStatsController.getAdvertiserStats);

module.exports = router;