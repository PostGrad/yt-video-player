const { google } = require("googleapis");

// Initialize YouTube API client
const youtube = google.youtube("v3");

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Function to get video details from YouTube API
async function getVideoDetails(videoId, apiKey) {
  try {
    const response = await youtube.videos.list({
      key: apiKey,
      part: ["snippet", "contentDetails", "status"],
      id: [videoId],
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = response.data.items[0];

    // Check if video is public
    const isPublic = video.status.privacyStatus === "public";

    // Get video length in seconds
    const duration = video.contentDetails.duration;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const seconds = match[3] ? parseInt(match[3]) : 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    return {
      isPublic,
      length: totalSeconds,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
    };
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw error;
  }
}

module.exports = {
  extractVideoId,
  getVideoDetails,
};
