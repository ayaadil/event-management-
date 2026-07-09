const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});