import { useState } from "react";
import { Title, Text, Button, Textarea, Alert } from "@mantine/core";

const Admin = () => {
  const [videos, setVideos] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Parse the textarea content into an array of videos
      const videoLines = videos.split("\n").filter((line) => line.trim());
      const videoArray = videoLines.map((line) => {
        const [url, category] = line.split(",").map((item) => item.trim());
        return { url, category };
      });

      const response = await fetch("http://localhost:3000/api/videos/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videos: videoArray }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload videos");
      }

      setSuccess(true);
      setVideos("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <Title order={1} className="text-2xl font-bold text-gray-800 mb-6">
        Admin Dashboard
      </Title>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Text className="text-gray-600">
            Enter videos in the format: URL, category (one per line)
            <br />
            Example:
            <br />
            https://youtube.com/watch?v=video1, kirtan
            <br />
            https://youtube.com/watch?v=video2, dhun
          </Text>
          <Textarea
            label="Videos"
            placeholder="Enter video URLs and categories"
            value={videos}
            onChange={(e) => setVideos(e.target.value)}
            minRows={10}
            required
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          loading={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Upload Videos
        </Button>
      </form>

      {error && (
        <Alert color="red" title="Error" className="mt-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="green" title="Success" className="mt-4">
          Videos uploaded successfully!
        </Alert>
      )}
    </div>
  );
};

export default Admin;
