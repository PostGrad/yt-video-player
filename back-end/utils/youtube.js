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
async function getVideoDetails(videos, apiKey) {
  try {
    const response = await youtube.videos.list({
      key: apiKey,
      part: ["contentDetails", "status"],
      id: [videos.map((video) => video.videoId)],
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("Video not found");
    }

    response.data.items.forEach((video, index) => {
      // Get video length in seconds
      const duration = video.contentDetails.duration;
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const seconds = match[3] ? parseInt(match[3]) : 0;
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;

      videos[index].type = video.status.privacyStatus;
      videos[index].length = totalSeconds;
    });
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw error;
  }
}

module.exports = {
  extractVideoId,
  getVideoDetails,
};
