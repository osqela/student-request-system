import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Container, 
  Typography 
} from '@mui/material';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jsuuxdxebfyoayqaiecc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzdXV4ZHhlYmZ5b2F5cWFpZWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NjUwNDAsImV4cCI6MjA0OTM0MTA0MH0.TKVYFdscHDkQE7XBH_6wWwHrgMzEFnM-cOgdjgZ5Hks'
);

interface Request {
  id: number;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
}

const RequestList = () => {
  const [requests, setRequests] = useState<Request[]>([]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      setRequests(data || []);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Real-time subscription
    const subscription = supabase
      .channel('requests_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'requests' 
      }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      fetchRequests();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        მოთხოვნების სია
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>სახელი</TableCell>
              <TableCell>გვარი</TableCell>
              <TableCell>სტატუსი</TableCell>
              <TableCell>თარიღი</TableCell>
              <TableCell>მოქმედება</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.first_name}</TableCell>
                <TableCell>{request.last_name}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  {new Date(request.created_at).toLocaleString('ka-GE')}
                </TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <>
                      <Button
                        color="success"
                        onClick={() => handleUpdateStatus(request.id, 'approved')}
                        sx={{ mr: 1 }}
                      >
                        დადასტურება
                      </Button>
                      <Button
                        color="error"
                        onClick={() => handleUpdateStatus(request.id, 'rejected')}
                      >
                        უარყოფა
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RequestList;
