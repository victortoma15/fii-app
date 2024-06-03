const express = require('express');
const router = express.Router();
const calendarController = require('../calendarController');

router.get('/auth', calendarController.auth);
router.get('/auth/callback', calendarController.authCallback);
router.post('/create-event', calendarController.createEvent);

module.exports = router;
