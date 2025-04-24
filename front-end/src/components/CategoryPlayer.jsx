import { useState, useEffect, useRef } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Load YouTube IFrame API once
if (!window.YT) {
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

const CategoryPlayer = ({ category }) => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [nextVideo, setNextVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
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

  const loadNextVideo = async () => {
    const video = await fetchVideo();
    setNextVideo(video);
  };

  const switchToNextVideo = () => {
    if (nextVideo) {
      setCurrentVideo(nextVideo);
      setNextVideo(null);
      loadNextVideo();
    } else {
      fetchVideo().then((video) => {
        if (video) {
          setCurrentVideo(video);
          loadNextVideo();
        }
      });
    }
  };

  useEffect(() => {
    const initializePlayer = async () => {
      setLoading(true);
      setPlayerReady(false);
      const video = await fetchVideo();
      if (video) {
        setCurrentVideo(video);
        loadNextVideo();
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

  const handleReady = (player) => {
    console.log("Player ready");
    setPlayerReady(true);
    if (player && player.play) {
      const attemptPlay = () => {
        player.play().catch((error) => {
          console.error("Play failed:", error);
          setTimeout(attemptPlay, 1000);
        });
      };

      setTimeout(attemptPlay, 500);
    }
  };

  const handlePlaying = (player) => {
    console.log("Video playing");
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

      if (currentVideo?.length) {
        if (nextVideoTimeoutRef.current) {
          clearTimeout(nextVideoTimeoutRef.current);
        }

        const timeUntilNext = Math.max((currentVideo.length - 60) * 1000, 1000);
        nextVideoTimeoutRef.current = setTimeout(
          switchToNextVideo,
          timeUntilNext
        );
      }
    } catch (error) {
      console.error("Error in playing handler:", error);
    }
  };

  const handleEnded = () => {
    console.log("Video ended");
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

  const plyrProps = {
    source: currentVideo
      ? {
          type: "video",
          sources: [
            {
              src: currentVideo.url,
              provider: "youtube",
            },
          ],
        }
      : null,
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
        noCookie: false,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        autoplay: 1,
        origin: window.location.origin,
        enablejsapi: 1,
      },
      autoplay: true,
      muted: false,
      clickToPlay: false,
      hideControls: true,
      resetOnEnd: false,
      debug: true,
    },
    eventListeners: {
      ready: handleReady,
      playing: handlePlaying,
      ended: handleEnded,
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
