const express = require('express');
const setupController = require('../controllers/setup.controller');
const router = express.Router();

// POST or GET. Using POST as it changes server state.
// Add protection: e.g. check for a secret query param or NODE_ENV
router.get('/setup-db', setupController.setupDB);

module.exports = router;