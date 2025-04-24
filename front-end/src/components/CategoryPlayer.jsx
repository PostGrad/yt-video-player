import { useState, useEffect } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

const CategoryPlayer = ({ category }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNextVideo = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/videos/next?category=${category}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch video");
      }
      const video = await response.json();
      setCurrentVideo(video);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextVideo();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <p className="text-red-600 text-center">Error: {error}</p>
        </div>
      </div>
    );
  }

  const plyrProps = {
    source: {
      type: "video",
      sources: [
        {
          src: currentVideo?.url,
          provider: "youtube",
        },
      ],
    },
    options: {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "fullscreen",
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {category.charAt(0).toUpperCase() + category.slice(1)} Videos
        </h1>
        {currentVideo ? (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <Plyr {...plyrProps} />
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {currentVideo.title}
              </h2>
              <p className="text-sm text-gray-600">
                {currentVideo.channelTitle}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">No videos available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPlayer;
