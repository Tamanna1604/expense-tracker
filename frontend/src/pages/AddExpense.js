import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const CATEGORIES = [
  'Food & Groceries',
  'Utilities',
  'Entertainment',
  'Transportation',
  'Healthcare',
  'Shopping',
  'Housing',
  'Fitness',
  'Food & Dining',
  'Personal Care',
  'Insurance',
  'Education',
  'Other'
];

const AddExpense = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [classifying, setClassifying] = useState(false);

  // Debounce function for API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Classify text using Cohere API
  const classifyText = async (text) => {
    if (!text) return;
    try {
      setClassifying(true);
      const response = await axios.post('http://localhost:5000/api/classify', { text });
      setCategory(response.data.category);
    } catch (error) {
      console.error('Classification error:', error.response?.data || error.message);
      // Don't show error to user, just keep the current category or set to 'Other'
      if (!category) {
        setCategory('Other');
      }
    } finally {
      setClassifying(false);
    }
  };

  // Debounced version of classifyText
  const debouncedClassify = debounce(classifyText, 500);

  // Update category when description changes
  useEffect(() => {
    if (description && !isEditingCategory) {
      debouncedClassify(description);
    }
  }, [description, isEditingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axios.post('http://localhost:5000/api/expenses', {
        amount: parseFloat(amount),
        description,
        date: date.toISOString().split('T')[0],
        category,
      });

      setSuccess(true);
      setAmount('');
      setDescription('');
      setDate(new Date());
      setCategory('');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Add New Expense
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Expense added successfully!
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  required
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you spend on?"
                  helperText={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      {classifying ? (
                        <CircularProgress size={16} />
                      ) : category ? (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Detected category:
                          </Typography>
                          <Chip
                            label={category}
                            color="primary"
                            variant="outlined"
                            size="small"
                            onClick={() => setIsEditingCategory(true)}
                            sx={{ cursor: 'pointer' }}
                          />
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Type to see category suggestions
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </Box>
            </Grid>

            {isEditingCategory && (
              <Grid item xs={12}>
                <Autocomplete
                  value={category}
                  onChange={(event, newValue) => {
                    setCategory(newValue);
                    setIsEditingCategory(false);
                  }}
                  options={CATEGORIES}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      fullWidth
                      autoFocus
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Add Expense'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddExpense; 