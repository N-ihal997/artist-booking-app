const express = require("express");
const { supabase } = require("../db");
const verifyToken = require("../middleware/auth");
const router = express.Router();

// Create booking request
router.post("/", verifyToken, async (req, res) => {
  const { artist_id, event_date, event_type, location, amount } = req.body;

  if (!artist_id || !event_date || !event_type || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      client_id: req.user.userId,
      artist_id,
      event_date,
      event_type,
      location,
      amount,
      status: "pending"
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: "Could not create booking", error });

  res.status(201).json({ booking: data });
});

// Get my bookings (for client)
router.get("/my", verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, artist_profiles(*)")
    .eq("client_id", req.user.userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: "Could not fetch bookings" });

  res.json({ bookings: data });
});

// Get booking requests (for artist manager)
router.get("/requests", verifyToken, async (req, res) => {
  const { data: profile } = await supabase
    .from("artist_profiles")
    .select("id")
    .eq("user_id", req.user.userId)
    .single();

  if (!profile) return res.status(404).json({ message: "Profile not found" });

  const { data, error } = await supabase
    .from("bookings")
    .select("*, users(*)")
    .eq("artist_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: "Could not fetch requests" });

  res.json({ bookings: data });
});

// Accept or reject booking
router.patch("/:id/status", verifyToken, async (req, res) => {
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ message: "Could not update booking" });

  res.json({ booking: data });
});

module.exports = router;