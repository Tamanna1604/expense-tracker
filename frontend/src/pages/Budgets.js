import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
  });

  useEffect(() => {
    fetchBudgetsAndExpenses();
  }, []);

  const fetchBudgetsAndExpenses = async () => {
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const [budgetsResponse, expensesResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/budgets?month=${month}&year=${year}`),
        axios.get(`http://localhost:5000/api/expenses/analytics?month=${month}&year=${year}`),
      ]);

      setBudgets(budgetsResponse.data);
      setExpenses(expensesResponse.data);
    } catch (err) {
      setError('Failed to fetch budgets and expenses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      await axios.post('http://localhost:5000/api/budgets', {
        ...newBudget,
        month,
        year,
        amount: parseFloat(newBudget.amount),
      });

      setNewBudget({ category: '', amount: '' });
      fetchBudgetsAndExpenses();
    } catch (err) {
      setError('Failed to add budget');
    }
  };

  const getCategoryExpense = (category) => {
    const expense = expenses.find((e) => e.category === category);
    return expense ? expense.total : 0;
  };

  const calculateProgress = (budget, spent) => {
    return Math.min((spent / budget) * 100, 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Monthly Budgets
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Add Budget Form */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add New Budget
          </Typography>
          <Grid container spacing={2} component="form" onSubmit={handleAddBudget}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Category"
                value={newBudget.category}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, category: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={newBudget.amount}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, amount: e.target.value })
                }
                inputProps={{ step: '0.01', min: '0' }}
                required
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ height: '100%' }}
              >
                Add
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Budget Cards */}
        <Grid container spacing={3}>
          {budgets.map((budget) => {
            const spent = getCategoryExpense(budget.category);
            const progress = calculateProgress(budget.amount, spent);
            const remaining = budget.amount - spent;

            return (
              <Grid item xs={12} md={6} lg={4} key={budget.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {budget.category}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Budget: ${budget.amount.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Spent: ${spent.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={remaining >= 0 ? 'success.main' : 'error.main'}
                      >
                        Remaining: ${remaining.toFixed(2)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      color={progress > 100 ? 'error' : 'primary'}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography
                      variant="body2"
                      color={progress > 100 ? 'error' : 'textSecondary'}
                      sx={{ mt: 1 }}
                    >
                      {progress.toFixed(1)}% of budget used
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
};

export default Budgets; 