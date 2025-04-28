# Swaminarayan Live TV - Backend

The backend server for Swaminarayan Live TV built with Node.js and Express.

## Features

- RESTful API endpoints for video management
- YouTube API integration for video details
- PostgreSQL database integration
- Automatic video rotation system
- Bulk video insertion
- Video status management (public/private)

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- YouTube Data API v3

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- YouTube API Key

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
YOUTUBE_API_KEY=your_youtube_api_key
```

3. Start the development server:

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

## API Endpoints

### Videos

- `GET /api/videos/next` - Get the next video to play based on category

  - Query Parameters:
    - `category`: One of "kirtan", "dhun", or "katha"
  - Returns: Video object with details

- `POST /api/videos/bulkInsert` - Add multiple videos at once

  - Request Body:
    ```json
    {
      "videos": [
        {
          "url": "YouTube URL",
          "category": "kirtan|dhun|katha"
        }
      ]
    }
    ```
  - Returns: Success message

- `PUT /api/videos/:id/private` - Mark a video as private

  - URL Parameters:

    - `id`: Video ID

  - Returns: Updated video object
