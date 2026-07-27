// يمسك أي خطأ يحصل داخل الـ controllers ويرجع رسالة موحدة
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'حدث خطأ في السيرفر',
  });
};

// للتعامل مع أي route غير موجود
const notFound = (req, res, next) => {
  res.status(404).json({ message:`The path does not exist: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
