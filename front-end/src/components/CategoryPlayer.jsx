import { useState, useEffect, useRef } from "react";
import ReactPlayer from "react-player";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CategoryPlayer = ({ category }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [playbackError, setPlaybackError] = useState(false);
  const playerRef = useRef(null);
  const nextVideoTimeoutRef = useRef(null);

  const fetchVideo = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/videos/next?category=${category}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch video");
      }
      const video = await response.json();
      return video;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const markVideoAsPrivate = async (videoId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/videos/${videoId}/private`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) {
        console.error("Failed to mark video as private");
      }
    } catch (err) {
      console.error("Error marking video as private:", err);
    }
  };

  const switchToNextVideo = async () => {
    console.log("Switching to next video");
    setLoading(true);
    setPlaybackError(false);

    try {
      const video = await fetchVideo();
      if (video) {
        setCurrentVideo(video);
        setPlaying(true);
      } else {
        setError("No more videos available");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePlayer = async () => {
      setLoading(true);
      setPlaying(false);
      setPlaybackError(false);

      const video = await fetchVideo();
      if (video) {
        setCurrentVideo(video);
        setPlaying(true);
      }
      setLoading(false);
    };

    initializePlayer();

    return () => {
      if (nextVideoTimeoutRef.current) {
        clearTimeout(nextVideoTimeoutRef.current);
      }
    };
  }, [category]);

  const handleReady = () => {
    console.log("Player ready");
    setPlaying(true);
    setPlaybackError(false);
  };

  const handlePlay = () => {
    console.log("Video playing");
    setPlaybackError(false);
    if (currentVideo?.length) {
      if (nextVideoTimeoutRef.current) {
        clearTimeout(nextVideoTimeoutRef.current);
      }

      const timeUntilNext = Math.max((currentVideo.length - 5) * 1000, 1000);
      console.log(`Setting next video timeout for ${timeUntilNext}ms`);
      nextVideoTimeoutRef.current = setTimeout(
        switchToNextVideo,
        timeUntilNext
      );
    }
  };

  const handleEnded = () => {
    console.log("Video ended");
    switchToNextVideo();
  };

  const handleError = async (error) => {
    console.error("Playback error:", error);
    setPlaybackError(true);

    // Mark current video as private if it exists
    if (currentVideo?.id) {
      await markVideoAsPrivate(currentVideo.id);
    }

    // Switch to next video
    switchToNextVideo();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 font-mono">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <p className="text-red-600 text-center font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (playbackError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <p className="text-red-600 text-center font-mono">
            Error playing video. Switching to next video...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-2 font-mono">
      <div className="container mx-auto px-2">
        <h1 className="text-xl font-bold text-center text-gray-800 mb-1 font-mono">
          Swaminarayan {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
          Live TV
        </h1>
        {currentVideo ? (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="relative pt-[56.25%]">
              <ReactPlayer
                ref={playerRef}
                url={currentVideo.url}
                className="absolute top-0 left-0"
                width="100%"
                height="100%"
                playing={playing}
                controls={true}
                playsinline
                onReady={handleReady}
                onPlay={handlePlay}
                onEnded={handleEnded}
                onError={handleError}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 1,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      iv_load_policy: 3,
                      playsinline: 1,
                      origin: window.location.origin,
                    },
                  },
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 font-mono">No videos available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPlayer;
