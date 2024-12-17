const express = require('express');
const upload = require('../Configs/multerConfig');
const barsController = require('../Controllers/barsController'); // Correct import
const router = express.Router();

router.post('/upload', upload.single('file'), barsController.uploadFile);

module.exports = router;
