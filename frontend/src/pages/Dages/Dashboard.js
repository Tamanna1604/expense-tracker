              <Typography color="textSecondary" gutterBottom>
                This Month's Spending
              </Typography>
              <Typography variant="h4">₹{totalExpenses.toFixed(2)}</Typography>
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

              <Typography color="textSecondary" gutterBottom>
                Potential Savings
              </Typography>
              <Typography variant="h4" color="error">
                ₹{totalSavings.toFixed(2)}
              </Typography>

                    <ListItemText
                      primary={expense.description}
                      secondary={`${expense.category} - ${new Date(expense.date).toLocaleDateString()}`}
                    />
                    <Typography variant="h6" color="primary">
                      ₹{parseFloat(expense.amount || 0).toFixed(2)}
                    </Typography>

                      <Typography variant="body2" color="textSecondary">
                        Current Spending: ₹{suggestion.currentSpending.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="error">
                        Potential Savings: ₹{suggestion.potentialSavings.toFixed(2)}
                      </Typography> 