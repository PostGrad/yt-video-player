# Swaminarayan Live TV - Frontend

The frontend application for Swaminarayan Live TV built with React and Tailwind CSS.

## Features

- Modern, responsive UI with Tailwind CSS
- Automatic video playback with smooth transitions
- Category-based video organization (Kirtan, Dhun, Katha)
- YouTube video integration
- Admin interface for video management
- Error handling for private/unavailable videos

## Tech Stack

- React 18
- Tailwind CSS
- Vite
- YouTube IFrame API
- Axios for API calls

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the root directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
front-end/
├── src/
│   ├── components/     # React components
│   │   ├── CategoryPlayer.jsx  # Video player component
│   │   └── Admin.jsx          # Admin interface
│   ├── assets/        # Static assets
│   ├── App.jsx        # Main application component
│   ├── main.jsx       # Application entry point
│   └── index.css      # Global styles
├── public/            # Public assets
├── index.html         # Entry HTML file
├── tailwind.config.js # Tailwind CSS configuration
├── postcss.config.js  # PostCSS configuration
└── vite.config.js     # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Follow the coding style and conventions
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation if necessary

## License

This project is licensed under the MIT License.
