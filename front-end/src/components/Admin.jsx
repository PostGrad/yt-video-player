import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

      const response = await fetch(`${API_BASE_URL}/videos/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videos: videoArray }),
      });

      if (!response.ok) {
        throw new Error("Failed to store videos");
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
    <div className="bg-white rounded-lg shadow-lg p-6 font-mono">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <p className="text-gray-600">
            Enter videos in the format: URL, category (one per line)
            <br />
            <br />
            Example:
            <br />
            https://youtube.com/watch?v=video1, kirtan
            <br />
            https://youtube.com/watch?v=video2, dhun
          </p>
          <textarea
            placeholder="Enter video URLs and categories"
            value={videos}
            onChange={(e) => setVideos(e.target.value)}
            rows={10}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            "Store in DB"
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-bold">Success</p>
          <p>Videos stored successfully!</p>
        </div>
      )}
    </div>
  );
};

export default Admin;
