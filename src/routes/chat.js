const { Router } = require("express");
const router = Router();


const { generateResponse } = require('../controllers/responseController');

// Route for generating a response
router.post('/generate-response', generateResponse);

module.exports = router;