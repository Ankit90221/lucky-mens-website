const express = require('express');
const cors = require('cors');
const path = require('path');
const { db } = require('@vercel/postgres'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.post('/api/add-appointment', async (req, res) => {
    const { name, phone, date, time, service, notes } = req.body;

    const errors = [];
    if (!name || !/^[A-Za-z\s]+$/.test(name.trim())) errors.push('Name must contain only letters and spaces.');
    if (name && name.trim().length > 100) errors.push('Name must be less than 100 characters.');
    if (!phone || !/^\d{10}$/.test(phone.trim())) errors.push('Phone number must be exactly 10 digits.');
    if (!date) errors.push('Date is required.');
    if (!time) errors.push('Time slot is required.');
    if (!service) errors.push('Service type is required.');
    if (notes && notes.length > 500) errors.push('Notes must be less than 500 characters.');

    if (errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }

    try {
        const client = await db.connect();
        
        const sql = `INSERT INTO appointments (name, phone, date, time, service, notes) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
        const values = [name.trim(), phone.trim(), date, time, service, notes ? notes.trim() : ''];
        
        const result = await client.query(sql, values);
        client.release();

        res.json({
            success: true,
            message: 'Appointment booked successfully!',
            appointmentId: result.rows[0].id 
        });
    } catch (err) {
        console.error('Insert error:', err);
        res.status(500).json({ success: false, message: 'Database error. Please try again.' });
    }
});

app.get('/api/appointments', async (req, res) => {
    try {
        const client = await db.connect();
        const sql = 'SELECT * FROM appointments ORDER BY date ASC, time ASC';
        const result = await client.query(sql);
        client.release();

        res.json({ success: true, appointments: result.rows });
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Local server running on port ${PORT}`));
}

module.exports = app;
