require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express(); 
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "50mb",
}));
// تقديم الصور المرفوعة كملفات ثابتة عامة (يشتغل لأي شخص يفتح الرابط)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const ticketTypeRoutes = require('./routes/ticketTypeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const savedEventRoutes = require('./routes/savedEventRoutes');
const speakerRoutes = require('./routes/speakerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/saved-events', savedEventRoutes);
app.use('/api/speakers', speakerRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});