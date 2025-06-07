import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [savingsSuggestions, setSavingsSuggestions] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const [expensesResponse, analyticsResponse, suggestionsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/expenses/monthly?month=${month}&year=${year}&userId=${userId}`),
          axios.get(`http://localhost:5000/api/expenses/analytics?month=${month}&year=${year}&userId=${userId}`),
          axios.get(`http://localhost:5000/api/savings/suggestions?month=${month}&year=${year}&userId=${userId}`),
        ]);

        setMonthlyData(expensesResponse.data);
        setCategoryData(analyticsResponse.data);
        setSavingsSuggestions(suggestionsResponse.data);

        // Calculate monthly comparison
        const previousMonth = month === 1 ? 12 : month - 1;
        const previousYear = month === 1 ? year - 1 : year;
        const previousMonthResponse = await axios.get(
          `http://localhost:5000/api/expenses/analytics?month=${previousMonth}&year=${previousYear}&userId=${userId}`
        );
        setMonthlyComparison(previousMonthResponse.data);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const totalExpenses = monthlyData?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const totalSavings = savingsSuggestions?.reduce((sum, suggestion) => sum + suggestion.potentialSavings, 0) || 0;

  const categoryChartData = {
    labels: categoryData?.map(item => item.category) || [],
    datasets: [
      {
        label: 'Expenses by Category',
        data: categoryData?.map(item => item.total) || [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const monthlyTrendData = {
    labels: monthlyData?.map(expense => new Date(expense.date).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Daily Expenses',
        data: monthlyData?.map(expense => expense.amount) || [],
        borderColor: '#2196f3',
        tension: 0.1,
      },
    ],
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses This Month
              </Typography>
              <Typography variant="h4">${totalExpenses.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Potential Savings
              </Typography>
              <Typography variant="h4" color="error">
                ${totalSavings.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categories
              </Typography>
              <Typography variant="h4">
                {categoryData?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Expense Trend
            </Typography>
            <Line
              data={monthlyTrendData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <Doughnut
              data={categoryChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </Paper>
        </Grid>

        {/* Savings Suggestions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Savings Suggestions
            </Typography>
            <Grid container spacing={2}>
              {savingsSuggestions?.map((suggestion, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {suggestion.category}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Current Spending: ${suggestion.currentSpending.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="error">
                        Potential Savings: ${suggestion.potentialSavings.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {suggestion.suggestion}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 