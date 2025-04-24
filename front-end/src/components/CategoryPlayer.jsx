import { useState, useEffect, useRef } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

const CategoryPlayer = ({ category }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef(null);

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

  // Load YouTube IFrame API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };

    if (!window.YT) {
      loadYouTubeAPI();
    }
  }, []);

  const handleReady = (player) => {
    setPlayerReady(true);
    if (player && player.play) {
      try {
        player.play().catch(() => {
          console.log("Playback failed, trying again...");
          setTimeout(() => {
            player.play().catch(console.error);
          }, 1000);
        });
      } catch (error) {
        console.error("Error during play:", error);
      }
    }
  };

  const handlePlaying = (player) => {
    if (!player || !playerReady) return;

    try {
      const playerElement = player.elements.container;
      if (playerElement && document.fullscreenElement !== playerElement) {
        setTimeout(() => {
          if (playerElement.requestFullscreen) {
            playerElement.requestFullscreen().catch(console.error);
          } else if (playerElement.webkitRequestFullscreen) {
            playerElement.webkitRequestFullscreen().catch(console.error);
          } else if (playerElement.msRequestFullscreen) {
            playerElement.msRequestFullscreen().catch(console.error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error);
    }
  };

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
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        autoplay: 1,
      },
      autoplay: true,
      clickToPlay: false,
      hideControls: true,
    },
    eventListeners: {
      ready: handleReady,
      playing: handlePlaying,
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 py-2 font-mono">
      <div className="container mx-auto px-2">
        <h1 className="text-xl font-bold text-center text-gray-800 mb-1 font-mono">
          Swaminarayan {category.charAt(0).toUpperCase() + category.slice(1)}{" "}
          Live TV
        </h1>
        {currentVideo ? (
          <div className="bg-white rounded-lg shadow-lg">
            <Plyr ref={playerRef} {...plyrProps} />
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 font-mono">
                {currentVideo.title}
              </h2>
              <p className="text-sm text-gray-600 font-mono">
                {currentVideo.channelTitle}
              </p>
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
