const express = require('express');
const router = express.Router();
const transcriptionController = require('../controllers/transcriptionController');

// Health check
router.get('/health', transcriptionController.health);

// Transcribe audio
router.post('/', transcriptionController.transcribe);

module.exports = router;




