import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, Paper } from '@mui/material';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jsuuxdxebfyoayqaiecc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzdXV4ZHhlYmZ5b2F5cWFpZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NjUwNDAsImV4cCI6MjA0OTM0MTA0MH0.TKVYFdscHDkQE7XBH_6wWwHrgMzEFnM-cOgdjgZ5Hks'
);

const RequestForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('requests')
        .insert([
          { 
            first_name: firstName,
            last_name: lastName,
            status: 'pending'
          }
        ]);

      if (error) throw error;
      
      setMessage('მოთხოვნა წარმატებით გაიგზავნა!');
      setFirstName('');
      setLastName('');
    } catch (error) {
      console.error('Error:', error);
      setMessage('შეცდომა მოთხოვნის გაგზავნისას');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            მოთხოვნის გაგზავნა
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="სახელი"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="გვარი"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              margin="normal"
              required
            />
            
            <Button 
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
            >
              მოთხოვნის გაგზავნა
            </Button>
          </form>
          
          {message && (
            <Typography 
              color={message.includes('შეცდომა') ? 'error' : 'success'} 
              sx={{ mt: 2 }} 
              align="center"
            >
              {message}
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default RequestForm;
