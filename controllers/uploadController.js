const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  let filename = req.file.filename;

  // صور آيفون (HEIC/HEIF) ما تنعرض بمعظم المتصفحات، فنحولها تلقائياً لـ JPEG
  const isHeic = req.file.mimetype === 'image/heic' || req.file.mimetype === 'image/heif';

  if (isHeic) {
    const originalPath = req.file.path;
    const jpegFilename = `${path.parse(filename).name}.jpg`;
    const jpegPath = path.join(path.dirname(originalPath), jpegFilename);

    try {
      await sharp(originalPath).jpeg({ quality: 90 }).toFile(jpegPath);
      fs.unlink(originalPath, () => {}); // نحذف نسخة HEIC الأصلية بعد التحويل
      filename = jpegFilename;
    } catch (err) {
      // لو فشل التحويل لأي سبب، نحذف الملف المرفوع ونرجع خطأ واضح بدل رابط مكسور
      fs.unlink(originalPath, () => {});
      return res.status(422).json({ message: 'Failed to process this image, please try a different photo' });
    }
  }

  // رابط ثابت وعام، يشتغل لأي شخص يفتح الموقع (مو رابط محلي بالمتصفح)
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

  res.status(201).json({ url: fileUrl });
};

module.exports = { uploadImage };