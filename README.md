# Swaminarayan Live TV

A modern web application for streaming videos categorized into Kirtan, Dhun, and Katha for [Swaminarayan](https://www.youtube.com/@swaminarayanbhagwan1/streams "Swaminarayan Bhagwan") YouTube channel. The application automatically plays videos in sequence and handles private/unavailable videos gracefully.

## Features

- 🎥 Automatic video playback with smooth transitions
- 📱 Responsive design with modern UI
- 🎵 Category-based video organization (Kirtan, Dhun, Katha)
- 👨‍💼 Admin interface for video management
- ⚡ Automatic handling of private/unavailable videos
- 📊 YouTube video integration
- 🎨 Beautiful UI with Tailwind CSS

## Tech Stack

### Frontend

- React 18
- Tailwind CSS
- Vite
- YouTube IFrame API
- Axios for API calls

### Backend

- Node.js
- Express.js
- PostgreSQL
- YouTube Data API v3

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- YouTube API Key
- npm or yarn

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/swaminarayan-live-tv.git
cd swaminarayan-live-tv
```

2. Set up the backend:

```bash
cd back-end
npm install
# Create .env file and add required environment variables
npm run dev
```

3. Set up the frontend:

```bash
cd front-end
npm install
# Create .env file and add required environment variables
npm run dev
```

## Environment Variables

### Backend (.env)

```
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
YOUTUBE_API_KEY=your_youtube_api_key
```

### Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Project Structure

```
├── front-end/          # React frontend application
│   ├── src/           # Source files
│   │   ├── components/  # React components
│   │   │   ├── CategoryPlayer.jsx  # Video player component
│   │   │   └── Admin.jsx          # Admin interface
│   │   ├── assets/    # Static assets
│   │   ├── App.jsx    # Main application component
│   │   ├── main.jsx   # Application entry point
│   │   └── index.css  # Global styles
│   ├── public/        # Public assets
│   ├── index.html     # Entry HTML file
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── postcss.config.js  # PostCSS configuration
│   └── vite.config.js     # Vite configuration
├── back-end/          # Node.js backend server
│   ├── config/        # Database configuration
│   ├── utils/         # Utility functions
│   │   ├── youtube.js # YouTube API integration
│   │   └── db-operations.js # Database operations
│   ├── server.js      # Main application file
│   └── schema.sql     # Database schema
└── README.md         # This file
```

## Development

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3000`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- YouTube API for video streaming
- React for frontend framework
- Node.js for backend server
- PostgreSQL for database
- Tailwind CSS for styling
