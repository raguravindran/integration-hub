# IntegrationHub Dashboard

A real-time monitoring dashboard for enterprise integrations with drag-and-drop configuration, data visualization, and metrics tracking.

## Features

- Real-time monitoring of integration status and performance
- Drag-and-drop configuration of integration components
- Detailed metrics and data visualization
- WebSocket-based live updates
- MongoDB for flexible data storage

## Tech Stack

- **Frontend**: React.js, Chart.js, React Beautiful DnD
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.io

## Project Structure

```
integration-hub/
├── client/             # React frontend
│   ├── public/         # Static files
│   └── src/            # Source code
│       ├── components/ # UI components
│       ├── contexts/   # React contexts
│       ├── hooks/      # Custom hooks
│       ├── pages/      # Page components
│       ├── utils/      # Utility functions
│       └── App.js      # Main React component
├── server/             # Node.js/Express backend
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   └── server.js       # Entry point
└── package.json        # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install-all
```

This will install dependencies for the root project, client, and server.

### Configuration

Create a `.env` file in the server directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/integration-hub
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:3000
```

### Running the Application

```bash
npm start
```

This will start both the client and server concurrently:
- Client: http://localhost:3000
- Server: http://localhost:5000

## API Endpoints

### Integrations
- `GET /api/integrations` - Get all integrations
- `GET /api/integrations/:id` - Get a specific integration
- `POST /api/integrations` - Create a new integration
- `PUT /api/integrations/:id` - Update an integration
- `DELETE /api/integrations/:id` - Delete an integration

### Metrics
- `GET /api/metrics` - Get all metrics
- `GET /api/metrics/integration/:integrationId` - Get metrics for a specific integration
- `GET /api/metrics/dashboard` - Get aggregated metrics for the dashboard
- `POST /api/metrics` - Create a new metric

## WebSocket Events

- `integrationCreated` - When a new integration is created
- `integrationUpdated` - When an integration is updated
- `integrationDeleted` - When an integration is deleted
- `metricCreated` - When a new metric is recorded

## License

ISC
