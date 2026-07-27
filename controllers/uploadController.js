const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // رابط ثابت وعام، يشتغل لأي شخص يفتح الموقع (مو رابط محلي بالمتصفح)
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(201).json({ url: fileUrl });
};

module.exports = { uploadImage };