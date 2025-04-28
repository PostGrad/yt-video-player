const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const { extractVideoId, getVideoDetails } = require("./utils/youtube");
const { bulkInsertVideos } = require("./utils/db-operations");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Get next video to play
app.get("/api/videos/next", async (req, res) => {
  try {
    const { category } = req.query;

    // Validate category
    if (category && !["kirtan", "dhun", "katha"].includes(category)) {
      return res.status(400).json({
        message: "Invalid category. Must be one of: kirtan, dhun, katha",
      });
    }
    const oldestVideo = await pool.query(
      `SELECT * FROM videos 
       WHERE category = $1 
       AND type = 'public'
       ORDER BY "updatedAt" ASC
       LIMIT 1`,
      [category]
    );
    if (oldestVideo.rows.length === 0) {
      return res.status(404).json({
        message: `No ${category} videos available`,
      });
    }

    const video = oldestVideo.rows[0];
    // Update lastPlayedAt
    await pool.query(
      `UPDATE videos 
       SET "lastPlayedAt" = CURRENT_TIMESTAMP,
       "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [video.id]
    );
    return res.json(video);
    // // First check if there are any videos with lastPlayedAt
    // const hasPlayedVideos = await pool.query(
    //   `SELECT EXISTS (
    //     SELECT 1 FROM videos
    //     WHERE type = 'public'
    //     AND category = $1
    //     AND "lastPlayedAt" IS NOT NULL
    //   )`,
    //   [category]
    // );
    // // If no videos have been played yet, get the oldest public video by updatedAt
    // if (!hasPlayedVideos.rows[0].exists) {
    //   const oldestVideo = await pool.query(
    //     `SELECT * FROM videos
    //      WHERE category = $1
    //      ORDER BY "updatedAt" ASC
    //      LIMIT 1`,
    //     [category]
    //   );
    //   if (oldestVideo.rows.length === 0) {
    //     return res.status(404).json({
    //       message: `No ${category} videos available`,
    //     });
    //   }

    //   const video = oldestVideo.rows[0];
    //   // Update lastPlayedAt
    //   await pool.query(
    //     `UPDATE videos
    //      SET "lastPlayedAt" = CURRENT_TIMESTAMP
    //      WHERE id = $1`,
    //     [video.id]
    //   );
    //   return res.json(video);
    // }

    // // Get the least recently played video
    // const leastRecentlyPlayed = await pool.query(
    //   `SELECT *,
    //           EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "lastPlayedAt")) as seconds_since_played
    //    FROM videos
    //    WHERE type = 'public'
    //    AND category = $1
    //    AND "lastPlayedAt" IS NOT NULL
    //    ORDER BY "lastPlayedAt" ASC, "createdAt" ASC
    //    LIMIT 1`,
    //   [category]
    // );

    // // If the least recently played video was played within last 70 seconds
    // // try to find an unplayed video
    // if (leastRecentlyPlayed.rows[0].seconds_since_played <= 70) {
    //   // Look for unplayed public videos
    //   const unplayedVideo = await pool.query(
    //     `SELECT * FROM videos
    //      WHERE type = 'public'
    //      AND category = $1
    //      AND "lastPlayedAt" IS NULL
    //      ORDER BY "updatedAt" ASC, "createdAt" ASC
    //      LIMIT 1`,
    //     [category]
    //   );

    //   if (unplayedVideo.rows.length > 0) {
    //     const video = unplayedVideo.rows[0];
    //     // Update lastPlayedAt
    //     await pool.query(
    //       `UPDATE videos
    //        SET "lastPlayedAt" = CURRENT_TIMESTAMP
    //        WHERE id = $1`,
    //       [video.id]
    //     );
    //     return res.json(video);
    //   }

    //   // If no unplayed videos, get the oldest updated video
    //   const oldestUpdatedVideo = await pool.query(
    //     `SELECT * FROM videos
    //      WHERE type = 'public'
    //      AND category = $1
    //      ORDER BY "updatedAt" ASC, "createdAt" ASC
    //      LIMIT 1`,
    //     [category]
    //   );

    //   const video = oldestUpdatedVideo.rows[0];
    //   // Update lastPlayedAt
    //   await pool.query(
    //     `UPDATE videos
    //      SET "lastPlayedAt" = CURRENT_TIMESTAMP
    //      WHERE id = $1`,
    //     [video.id]
    //   );
    //   return res.json(video);
    // }

    // // If the least recently played video was played more than 70 seconds ago
    // // use it as the next video
    // const video = leastRecentlyPlayed.rows[0];
    // // Update lastPlayedAt
    // await pool.query(
    //   `UPDATE videos
    //    SET "lastPlayedAt" = CURRENT_TIMESTAMP
    //    WHERE id = $1`,
    //   [video.id]
    // );
    // return res.json(video);
  } catch (error) {
    console.error("Error fetching next video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Bulk insert videos
app.post("/api/videos/bulkInsert", async (req, res) => {
  const { videos } = req.body;
  if (!Array.isArray(videos) || videos.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid input: videos array required" });
  }

  try {
    // Validate and extract video IDs
    for (const video of videos) {
      if (!video.url || !video.category) {
        throw new Error(
          `Each video must have url and category. Invalid video: ${
            video.url || "No URL"
          }`
        );
      }

      try {
        video.videoId = extractVideoId(video.url);
        if (!video.videoId) {
          throw new Error(`Invalid YouTube URL: ${video.url}`);
        }
      } catch (error) {
        throw new Error(
          `Error extracting video ID from URL: ${video.url}. ${error.message}`
        );
      }
    }

    // Get video details from YouTube
    try {
      await getVideoDetails(videos, process.env.YOUTUBE_API_KEY);
    } catch (error) {
      const failedVideos = videos.filter((v) => !v.title).map((v) => v.url);
      throw new Error(
        `Failed to get details for videos: ${failedVideos.join(", ")}  ${
          error.message
        }`
      );
    }

    // Store videos in database
    try {
      await bulkInsertVideos(videos);
    } catch (error) {
      const failedVideos = videos.filter((v) => !v.id).map((v) => v.url);
      throw new Error(
        `Failed to store videos in database: ${failedVideos.join(", ")} ${
          error.message
        }`
      );
    }

    res.status(201).json({ message: "Videos added successfully" });
  } catch (error) {
    console.error("Error adding videos:", error?.message);
    res.status(500).json({
      message: error.message || "Internal server error",
      error: error.message,
    });
  }
});

// Mark video as private
app.put("/api/videos/:id/private", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE videos 
       SET type = 'private', "updatedAt" = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error marking video as private:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/videos/periodicVideoTypeCheck", async (req, res) => {});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
