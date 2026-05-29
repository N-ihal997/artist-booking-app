const express = require("express");
const { supabase } = require("../db");
const verifyToken = require("../middleware/auth");
const router = express.Router();

// Send a message
router.post("/", verifyToken, async (req, res) => {
  const { booking_id, content } = req.body;

  if (!booking_id || !content) {
    return res.status(400).json({ message: "booking_id and content are required" });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      booking_id,
      sender_id: req.user.userId,
      content
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: "Could not send message" });

  res.status(201).json({ message: data });
});

// Get messages for a booking
router.get("/:bookingId", verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*, users(name, role)")
    .eq("booking_id", req.params.bookingId)
    .order("sent_at", { ascending: true });

  if (error) return res.status(500).json({ message: "Could not fetch messages" });

  res.json({ messages: data });
});

module.exports = router;