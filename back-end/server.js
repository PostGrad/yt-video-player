const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const { extractVideoId, getVideoDetails } = require("./utils/youtube");
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

    // First, try to get the last played public video of the specified category
    const lastPlayedResult = await pool.query(
      `SELECT * FROM videos 
       WHERE type = 'public' 
       ${category ? "AND category = $1" : ""}
       ORDER BY "lastPlayedAt" DESC 
       LIMIT 1`,
      category ? [category] : []
    );

    if (lastPlayedResult.rows.length > 0) {
      const video = lastPlayedResult.rows[0];
      // Update lastPlayedAt
      await pool.query(
        `UPDATE videos 
         SET "lastPlayedAt" = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [video.id]
      );
      return res.json(video);
    }

    // If no last played video, get any unprocessed video of the specified category
    const nextVideoResult = await pool.query(
      `SELECT * FROM videos 
       WHERE type IS NULL 
       ${category ? "AND category = $1" : ""}
       ORDER BY "createdAt" ASC 
       LIMIT 1`,
      category ? [category] : []
    );

    if (nextVideoResult.rows.length === 0) {
      return res.status(404).json({
        message: category
          ? `No ${category} videos available`
          : "No videos available",
      });
    }

    const video = nextVideoResult.rows[0];

    // Extract video ID from URL
    const videoId = extractVideoId(video.url);
    if (!videoId) {
      // If invalid URL, mark as private and get next video
      await pool.query(
        `UPDATE videos 
         SET type = 'private', 
             "updatedAt" = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [video.id]
      );
      return app.get("/api/videos/next", req, res);
    }

    try {
      // Get video details from YouTube API
      const videoDetails = await getVideoDetails(
        videoId,
        process.env.YOUTUBE_API_KEY
      );

      // Update video with type, length, and lastPlayedAt
      await pool.query(
        `UPDATE videos 
         SET type = $1, 
             length = $2, 
             "lastPlayedAt" = CURRENT_TIMESTAMP,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [
          videoDetails.isPublic ? "public" : "private",
          videoDetails.length,
          video.id,
        ]
      );

      // If video is private, get next video
      if (!videoDetails.isPublic) {
        return app.get("/api/videos/next", req, res);
      }

      // Return video with updated details
      res.json({
        ...video,
        type: videoDetails.isPublic ? "public" : "private",
        length: videoDetails.length,
        title: videoDetails.title,
        description: videoDetails.description,
        channelTitle: videoDetails.channelTitle,
      });
    } catch (error) {
      console.error("Error processing video:", error);
      // If there's an error, mark as private and get next video
      await pool.query(
        `UPDATE videos 
         SET type = 'private', 
             "updatedAt" = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [video.id]
      );
      return app.get("/api/videos/next", req, res);
    }
  } catch (error) {
    console.error("Error fetching next video:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Bulk insert videos
app.post("/api/videos/bulk", async (req, res) => {
  const { videos } = req.body;

  if (!Array.isArray(videos) || videos.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid input: videos array required" });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const video of videos) {
        if (!video.url || !video.category) {
          throw new Error("Each video must have url and category");
        }

        await client.query(
          `INSERT INTO videos (url, category, "createdAt", "updatedAt") 
           VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [video.url, video.category]
        );
      }

      await client.query("COMMIT");
      res.status(201).json({ message: "Videos added successfully" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error adding videos:", error);
    res.status(500).json({ message: "Internal server error" });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
