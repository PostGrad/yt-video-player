const pool = require("../config/db");

async function bulkInsertVideos(videos) {
  const client = await pool.connect();

  try {
    const values = [];
    const placeholders = videos.map((video, i) => {
      const baseIndex = i * 4;
      values.push(video.url, video.category, video.type, video.length);
      return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${
        baseIndex + 4
      })`;
    });

    const query = `
        INSERT INTO videos (url, category, type, length)
        VALUES ${placeholders.join(", ")}
        ON CONFLICT (url) DO NOTHING
      `;

    await client.query(query, values);
    console.log("Bulk insert completed successfully.");
  } catch (error) {
    console.error("Error during bulk insert:", error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  bulkInsertVideos,
};
