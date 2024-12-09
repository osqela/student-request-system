const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase კლიენტის ინიციალიზაცია
const supabaseUrl = 'https://jsuuxdxebfyoayqaiecc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzdXV4ZHhlYmZ5b2F5cWFpZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NjUwNDAsImV4cCI6MjA0OTM0MTA0MH0.TKVYFdscHDkQE7XBH_6wWwHrgMzEFnM-cOgdjgZ5Hks';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static('public'));

// მთავარი გვერდიდან გადამისამართება request.html-ზე
app.get('/', (req, res) => {
    res.redirect('/request.html');
});

// მოთხოვნის მიღების endpoint
app.post('/api/submit-request', async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        // მოთხოვნის შენახვა Supabase-ში
        const { data, error } = await supabase
            .from('requests')
            .insert([
                {
                    first_name: firstName,
                    last_name: lastName,
                    status: 'pending'
                }
            ]);

        if (error) throw error;

        res.json({ success: true, message: 'მოთხოვნა წარმატებით გაიგზავნა' });
    } catch (error) {
        console.error('Error submitting request:', error);
        res.status(500).json({ success: false, message: 'დაფიქსირდა შეცდომა მოთხოვნის გაგზავნისას' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
