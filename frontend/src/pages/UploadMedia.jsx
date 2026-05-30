import { useState, useEffect } from "react";

export default function UploadMedia() {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const token = localStorage.getItem("token");
    const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/artists/profile/me", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    if (data.profile) {
      setPhotos(data.profile.photos || []);
      setVideos(data.profile.videos || []);
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setMessage("");
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      const token = localStorage.getItem("token");
      const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/artists/profile/upload-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ base64, fileName: file.name })
      });
      const data = await res.json();
      if (res.ok) {
        setPhotos(data.photos);
        setMessage("Photo uploaded!");
      } else {
        setMessage("Upload failed.");
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleAddVideo() {
    if (!videoUrl.trim()) return;
    const token = localStorage.getItem("token");
    const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/artists/profile/add-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ videoUrl })
    });
    const data = await res.json();
    if (res.ok) {
      setVideos(data.videos);
      setVideoUrl("");
      setMessage("Video added!");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 border border-gray-100">
        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1 rounded-md mb-4">
          Media Upload
        </span>
        <h1 className="text-2xl font-semibold mb-1">Add photos and videos</h1>
        <p className="text-gray-500 text-sm mb-6">Clients will see these on your profile</p>

        {message && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Photos</h2>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 transition">
            <span className="text-sm text-gray-500">
              {uploading ? "Uploading..." : "Click to upload photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={"photo " + (i + 1)}
                  className="w-full h-24 object-cover rounded-lg border border-gray-100"
                />
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Video links</h2>
          <p className="text-xs text-gray-400 mb-2">Paste a YouTube or Vimeo link</p>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
            />
            <button
              onClick={handleAddVideo}
              className="px-4 h-11 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition"
            >
              Add
            </button>
          </div>
          {videos.length > 0 && (
            <div className="mt-3 space-y-2">
              {videos.map((url, i) => (
                
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-purple-600 hover:underline block"
                >
                  Video {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => window.location.href = "/dashboard"}
          className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition"
        >
          Done - Go to dashboard
        </button>
      </div>
    </div>
  );
}