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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Info,
  ArrowUpward,
  ArrowDownward,
  Category as CategoryIcon,
  CalendarToday,
  AccountBalance,
  Savings,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [savingsSuggestions, setSavingsSuggestions] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [spendingTrends, setSpendingTrends] = useState(null);
  const [topExpenses, setTopExpenses] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Fetch all required data
        const [
          expensesResponse,
          analyticsResponse,
          suggestionsResponse,
          yearlyResponse,
          budgetResponse,
          trendsResponse,
          topExpensesResponse
        ] = await Promise.all([
          axios.get(`${API_URL}/expenses/monthly?month=${month}&year=${year}&userId=${userId}`),
          axios.get(`${API_URL}/expenses/analytics?month=${month}&year=${year}&userId=${userId}`),
          axios.get(`${API_URL}/savings/suggestions?month=${month}&year=${year}&userId=${userId}`),
          axios.get(`${API_URL}/expenses/yearly?year=${year}&userId=${userId}`),
          axios.get(`${API_URL}/budgets/status?month=${month}&year=${year}&userId=${userId}`),
          axios.get(`${API_URL}/expenses/trends?userId=${userId}`),
          axios.get(`${API_URL}/expenses/top?userId=${userId}`)
        ]);

        setMonthlyData(expensesResponse.data);
        setCategoryData(analyticsResponse.data);
        setSavingsSuggestions(suggestionsResponse.data);
        setYearlyData(yearlyResponse.data);
        setBudgetStatus(budgetResponse.data);
        setSpendingTrends(trendsResponse.data);
        setTopExpenses(topExpensesResponse.data);

        // Calculate monthly comparison
        const previousMonth = month === 1 ? 12 : month - 1;
        const previousYear = month === 1 ? year - 1 : year;
        const previousMonthResponse = await axios.get(
          `${API_URL}/expenses/analytics?month=${previousMonth}&year=${previousYear}&userId=${userId}`
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
  const previousMonthTotal = monthlyComparison?.reduce((sum, item) => sum + item.total, 0) || 0;
  const spendingChange = ((totalExpenses - previousMonthTotal) / previousMonthTotal) * 100;

  // Category Chart Data
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

  // Monthly Trend Data
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

  // Yearly Comparison Data
  const yearlyComparisonData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'This Year',
        data: yearlyData?.currentYear || [],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
      },
      {
        label: 'Last Year',
        data: yearlyData?.previousYear || [],
        borderColor: '#f50057',
        backgroundColor: 'rgba(245, 0, 87, 0.1)',
      },
    ],
  };

  // Category Radar Data
  const categoryRadarData = {
    labels: categoryData?.map(item => item.category) || [],
    datasets: [
      {
        label: 'Current Month',
        data: categoryData?.map(item => item.total) || [],
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: '#2196f3',
      },
      {
        label: 'Previous Month',
        data: monthlyComparison?.map(item => item.total) || [],
        backgroundColor: 'rgba(245, 0, 87, 0.2)',
        borderColor: '#f50057',
      },
    ],
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                This Month's Spending
              </Typography>
              <Typography variant="h4">${totalExpenses.toFixed(2)}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {spendingChange > 0 ? (
                  <TrendingUp color="error" />
                ) : (
                  <TrendingDown color="success" />
                )}
                <Typography
                  variant="body2"
                  color={spendingChange > 0 ? 'error' : 'success'}
                  sx={{ ml: 1 }}
                >
                  {Math.abs(spendingChange).toFixed(1)}% vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Potential Savings
              </Typography>
              <Typography variant="h4" color="error">
                ${totalSavings.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Based on your spending patterns
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categories Used
              </Typography>
              <Typography variant="h4">
                {categoryData?.length || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Different spending categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Budget Status
              </Typography>
              <Typography variant="h4" color={budgetStatus?.isOverBudget ? 'error' : 'success'}>
                {budgetStatus?.percentageUsed || 0}%
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                of monthly budget used
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
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Amount ($)'
                    }
                  }
                }
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

        {/* Yearly Comparison */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Yearly Comparison
            </Typography>
            <Bar
              data={yearlyComparisonData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Amount ($)'
                    }
                  }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* Category Comparison */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Category Comparison
            </Typography>
            <Radar
              data={categoryRadarData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  r: {
                    beginAtZero: true,
                  }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* Top Expenses */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Expenses
            </Typography>
            <List>
              {topExpenses?.map((expense, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <CategoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={expense.description}
                      secondary={`${expense.category} - ${new Date(expense.date).toLocaleDateString()}`}
                    />
                    <Typography variant="h6" color="primary">
                      ${expense.amount.toFixed(2)}
                    </Typography>
                  </ListItem>
                  {index < topExpenses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Savings Suggestions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Smart Savings Suggestions
            </Typography>
            <Grid container spacing={2}>
              {savingsSuggestions?.map((suggestion, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CategoryIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="primary">
                          {suggestion.category}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        Current Spending: ${suggestion.currentSpending.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="error">
                        Potential Savings: ${suggestion.potentialSavings.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {suggestion.suggestion}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          icon={<TrendingDown />}
                          label={`${suggestion.savingsPercentage}% potential savings`}
                          color="error"
                          variant="outlined"
                        />
                      </Box>
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