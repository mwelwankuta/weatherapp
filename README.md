# Weather App

This weather application allows users to view current weather data and a 16-day forecast for any city and country. The app supports geolocation to fetch the user's current location automatically.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v14+)
- [pnpm](https://pnpm.io/) (or npm/yarn if you prefer)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/weather-app.git
   cd weather-app
   ```

2. Install dependencies using `pnpm`:
   ```bash
   pnpm install
   ```

### Environment Variables

You need to configure environment variables for the project to work. Follow these steps:

1. Navigate to the `backend/src` and `frontend/src` directories.
2. Copy the `.env.example` file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```

Replace the values in the .env files with the keys you obtain from your weather data provider and redis provider

### Running the Application

#### Backend

1. Navigate to the `backend` directory:
   ```bash
   cd apps/backend
   ```
2. Run the development server:
   ```bash
   pnpm run start
   ```

#### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd apps/frontend
   ```
2. Run the development server:
   ```bash
   pnpm run dev
   ```

The frontend will run at [http://localhost:5173](http://localhost:5173) and the backend at [http://localhost:3000](http://localhost:3000).

## License

This project is licensed under the MIT License.
