const express = require("express");
const { supabase } = require("../db");
const verifyToken = require("../middleware/auth");
const router = express.Router();

// Create artist profile
router.post("/profile", verifyToken, async (req, res) => {
  const { stage_name, biography, genre, budget_min, budget_max, location } = req.body;

  if (!stage_name) {
    return res.status(400).json({ message: "Stage name is required" });
  }

  const { data, error } = await supabase
    .from("artist_profiles")
    .insert({
      user_id: req.user.userId,
      stage_name, biography, genre,
      budget_min, budget_max, location,
      photos: [], videos: []
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: "Could not create profile", error });

  res.status(201).json({ profile: data });
});

// Get my profile
router.get("/profile/me", verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from("artist_profiles")
    .select("*")
    .eq("user_id", req.user.userId)
    .single();

  if (error) return res.status(404).json({ message: "Profile not found" });

  res.json({ profile: data });
});

// Upload photo
router.post("/profile/upload-photo", verifyToken, async (req, res) => {
  const { base64, fileName } = req.body;

  // Convert base64 to buffer
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const filePath = `photos/${req.user.userId}/${Date.now()}_${fileName}`;

  // Upload to Supabase storage
  const { error: uploadError } = await supabase.storage
    .from("artist-media")
    .upload(filePath, buffer, { contentType: "image/jpeg" });

  if (uploadError) {
    return res.status(500).json({ message: "Upload failed", error: uploadError });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("artist-media")
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // Save URL to artist_profiles photos array
  const { data: profile } = await supabase
    .from("artist_profiles")
    .select("photos")
    .eq("user_id", req.user.userId)
    .single();

  const updatedPhotos = [...(profile.photos || []), publicUrl];

  await supabase
    .from("artist_profiles")
    .update({ photos: updatedPhotos })
    .eq("user_id", req.user.userId);

  res.json({ url: publicUrl, photos: updatedPhotos });
});

// Upload video URL (YouTube/Vimeo link)
router.post("/profile/add-video", verifyToken, async (req, res) => {
  const { videoUrl } = req.body;

  const { data: profile } = await supabase
    .from("artist_profiles")
    .select("videos")
    .eq("user_id", req.user.userId)
    .single();

  const updatedVideos = [...(profile.videos || []), videoUrl];

  await supabase
    .from("artist_profiles")
    .update({ videos: updatedVideos })
    .eq("user_id", req.user.userId);

  res.json({ videos: updatedVideos });
});

// Get all artists (for client search)
router.get("/all", verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from("artist_profiles")
    .select("*");

  if (error) return res.status(500).json({ message: "Could not fetch artists" });

  res.json({ artists: data });
});

// Get single artist by ID
router.get("/:id", verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from("artist_profiles")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) return res.status(404).json({ message: "Artist not found" });

  res.json({ artist: data });
});

module.exports = router;