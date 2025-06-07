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
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: new Date(),
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/savings-goals');
      setGoals(response.data);
    } catch (err) {
      setError('Failed to fetch savings goals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/savings-goals', {
        ...newGoal,
        targetAmount: parseFloat(newGoal.targetAmount),
      });

      setNewGoal({
        name: '',
        targetAmount: '',
        targetDate: new Date(),
      });
      fetchGoals();
    } catch (err) {
      setError('Failed to add savings goal');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await axios.delete(`http://localhost:5000/api/savings-goals/${goalId}`);
      fetchGoals();
    } catch (err) {
      setError('Failed to delete savings goal');
    }
  };

  const handleUpdateProgress = async (goalId, amount) => {
    try {
      await axios.put(`http://localhost:5000/api/savings-goals/${goalId}`, {
        currentAmount: amount,
      });
      fetchGoals();
    } catch (err) {
      setError('Failed to update savings goal progress');
    }
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
          Savings Goals
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Add Goal Form */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add New Savings Goal
          </Typography>
          <Grid container spacing={2} component="form" onSubmit={handleAddGoal}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Goal Name"
                value={newGoal.name}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Target Amount"
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, targetAmount: e.target.value })
                }
                inputProps={{ step: '0.01', min: '0' }}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Target Date"
                  value={newGoal.targetDate}
                  onChange={(date) =>
                    setNewGoal({ ...newGoal, targetDate: date })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={1}>
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

        {/* Goals List */}
        <Grid container spacing={3}>
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysRemaining = calculateDaysRemaining(goal.targetDate);
            const isOverdue = daysRemaining < 0;

            return (
              <Grid item xs={12} md={6} key={goal.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography variant="h6">{goal.name}</Typography>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Target: ${goal.targetAmount.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Current: ${goal.currentAmount.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={isOverdue ? 'error.main' : 'textSecondary'}
                      >
                        {isOverdue
                          ? 'Target date has passed'
                          : `${daysRemaining} days remaining`}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{ height: 10, borderRadius: 5, mt: 2 }}
                    />
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      {progress.toFixed(1)}% of goal achieved
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Update Progress"
                        type="number"
                        inputProps={{ step: '0.01', min: '0' }}
                        onChange={(e) =>
                          handleUpdateProgress(goal.id, parseFloat(e.target.value))
                        }
                      />
                    </Box>
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

export default SavingsGoals; 