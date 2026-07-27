const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');
// POST /api/uploads  (multipart/form-data, field name: "image")
router.post('/', protect, upload.single('image'), uploadImage);

module.exports = router;