# Text-to-Speech Application

A full-stack text-to-speech application with AI-powered text manipulation features, built with React (Vite) and Node.js.

## Project Structure

```
tts/
├── api/           # Backend API (Node.js/Express)
├── client/        # Frontend (React/Vite)
└── docs/          # Documentation
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL (or your preferred database)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Godswillconcept/text-to-speech.git
   cd tts
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install API dependencies
   cd api && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` in both `api/` and `client/` directories
   - Update the environment variables with your configuration

4. **Database Setup**
   ```bash
   # From the api/ directory
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

## Available Scripts

### Root Directory
- `npm run start:api` - Start the API server
- `npm run dev:api` - Start the API server in development mode with hot-reload
- `npm run start:client` - Start the client development server
- `npm run build:client` - Build the client for production
- `npm run lint` - Lint all workspaces
- `npm run format` - Format code using Prettier

### API Directory
- `npm start` - Start the API server
- `npm run dev` - Start the API server in development mode
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database

### Client Directory
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Development Workflow

1. Start the development servers:
   ```bash
   # In one terminal
   npm run dev:api
   
   # In another terminal
   npm run start:client
   ```

2. The application will be available at `http://localhost:3000`
3. The API will be available at `http://localhost:8000` (or your configured port)

## Branching Strategy

- `main` - Production-ready code
- `api/*` - Feature branches for API development
- `client/*` - Feature branches for client development
- `feature/*` - Cross-cutting features that affect both API and client

## Documentation

- [API Documentation](./docs/api/README.md)
- [Client Documentation](./docs/client/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@GodswillConcep1](https://x.com/GodswillConcep1) - olatunjiabass01@gmail.com

Project Link: [https://github.com/Godswillconcept/text-to-speech](https://github.com/Godswillconcept/text-to-speech)
