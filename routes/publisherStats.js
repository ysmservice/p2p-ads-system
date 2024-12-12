const express = require('express');
const router = express.Router();
const publisherStatsController = require('../controllers/publisherStatsController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// 出版社の統計情報の取得（管理者および出版社のみ）
router.get('/', authenticate, authorize(['admin', 'publisher']), publisherStatsController.getPublisherStats);

module.exports = router;