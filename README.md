# Text-to-Speech API

A full-stack text-to-speech application with AI-powered text manipulation features. This API provides endpoints for converting text to speech, processing PDFs, and performing AI-powered text transformations like paraphrasing and summarization.

## Features

- **Text-to-Speech Conversion**: Convert text to natural-sounding speech
- **PDF-to-Speech**: Extract text from PDFs and convert to speech
- **AI Text Manipulation**:
  - Paraphrase text with different tones
  - Summarize long texts
  - Extract key points
  - Change text tone (formal, casual, etc.)
- **User Authentication**: JWT-based authentication system
- **File Management**: Upload and manage audio files
- **Operation History**: Track and retrieve past operations

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Google Cloud account (for Text-to-Speech and Gemini AI)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd text-to-speech-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env` with your configuration

4. **Database Setup**
   - Create a MySQL database
   - Update the database connection details in `.env`
   - Run migrations:
     ```bash
     npx sequelize-cli db:migrate
     ```

5. **Google Cloud Setup**
   - Enable the following APIs in Google Cloud Console:
     - Text-to-Speech API
     - Generative Language API (for Gemini AI)
   - Create a service account and download the JSON key file
   - Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your service account key file

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The API will be available at `http://localhost:5000` by default.

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:5000/api-docs`
- OpenAPI JSON: `http://localhost:5000/api-docs.json`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| DB_HOST | Database host | localhost |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | |
| DB_NAME | Database name | text_to_speech |
| JWT_SECRET | Secret for JWT tokens | |
| JWT_EXPIRE | JWT expiration time | 7d |
| GOOGLE_APPLICATION_CREDENTIALS | Path to Google service account key | |
| GOOGLE_AI_API_KEY | Google AI API key | |
| SESSION_SECRET | Secret for session | |
| ALLOWED_ORIGINS | Comma-separated allowed origins | http://localhost:3000 |
| MAX_FILE_SIZE | Maximum file upload size (bytes) | 10485760 (10MB) |
| UPLOAD_DIR | Directory for file uploads | ./public/uploads |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user profile

### Text-to-Speech
- `POST /api/tts/text-to-speech` - Convert text to speech
- `POST /api/tts/pdf-to-speech` - Convert PDF to speech
- `GET /api/tts/voices` - Get available voices
- `GET /api/tts/history` - Get TTS history
- `GET /api/tts/audio/:id` - Get audio file by ID

### AI Text Manipulation
- `POST /api/ai/paraphrase` - Paraphrase text
- `POST /api/ai/summarize` - Summarize text
- `POST /api/ai/key-points` - Extract key points from text
- `POST /api/ai/change-tone` - Change text tone
- `GET /api/ai/history` - Get AI operation history

## Error Handling

The API follows RESTful error handling conventions. All error responses include a `success` flag set to `false` and an error message.

Example error response:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Rate Limiting

API rate limiting is implemented to prevent abuse. By default, the API allows:
- 100 requests per 15 minutes for authenticated users
- 20 requests per 15 minutes for unauthenticated users

## Security

- All passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Input validation is performed on all endpoints
- File uploads are validated and scanned for malicious content
- CORS is properly configured
- Security headers are set using Helmet

## Testing

To run tests:
```bash
npm test
```

## Deployment

### Prerequisites
- Node.js production server (PM2, Nginx, etc.)
- MySQL database
- SSL certificate (recommended)

### Steps
1. Set `NODE_ENV=production` in your environment
2. Install production dependencies:
   ```bash
   npm install --production
   ```
3. Run database migrations:
   ```bash
   NODE_ENV=production npx sequelize-cli db:migrate
   ```
4. Start the server using a process manager like PM2:
   ```bash
   pm2 start index.js --name "text-to-speech-api"
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
