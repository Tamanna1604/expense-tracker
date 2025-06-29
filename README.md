# Smart Expense Tracker

A comprehensive expense tracking application that helps users manage their finances intelligently.

## Features

- User authentication and profile management
- Automatic expense categorization using Cohere AI
- Monthly expense tracking and analysis
- Comparative analysis with previous months
- Smart savings suggestions
- Interactive dashboard with visual analytics
- Expense trends and patterns
- Budget planning and alerts

## Tech Stack

### Frontend
- React.js
- Material-UI
- Chart.js for visualizations
- Axios for API calls

### Backend
- Node.js
- Express.js
- MySQL Database
- JWT Authentication
- Cohere AI API for expense categorization

## Project Structure
```
expense-tracker/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend
└── README.md
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory
2. Install dependencies: `npm install`
3. Create a `.env` file with required environment variables
4. Start the server: `npm start`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Create a `.env` file with required environment variables
4. Start the development server: `npm start`

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=expense_tracker
JWT_SECRET=your_jwt_secret
COHERE_API_KEY=your_cohere_api_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
``` #   e x p e n s e - t r a c k e r 
 
 