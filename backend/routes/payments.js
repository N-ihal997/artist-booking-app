const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { supabase } = require("../db");
const verifyToken = require("../middleware/auth");
const router = express.Router();

// Create payment intent
router.post("/create-payment-intent", verifyToken, async (req, res) => {
  const { bookingId } = req.body;

  // Get booking details
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, artist_profiles(*)")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.status !== "accepted") {
    return res.status(400).json({ message: "Booking must be accepted before payment" });
  }

  if (booking.client_id !== req.user.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.amount * 100, // Stripe uses paise for INR
      currency: "inr",
      metadata: {
        bookingId: booking.id,
        clientId: booking.client_id,
        artistId: booking.artist_id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: booking.amount,
      artistName: booking.artist_profiles.stage_name
    });
  } catch (err) {
    res.status(500).json({ message: "Payment setup failed", error: err.message });
  }
});

// Confirm payment success
router.post("/confirm", verifyToken, async (req, res) => {
  const { bookingId, paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      await supabase
        .from("bookings")
        .update({
          status: "completed",
          stripe_payment_id: paymentIntentId
        })
        .eq("id", bookingId);

      res.json({ message: "Payment confirmed", status: "completed" });
    } else {
      res.status(400).json({ message: "Payment not completed" });
    }
  } catch (err) {
    res.status(500).json({ message: "Confirmation failed", error: err.message });
  }
});

// Get client bookings with payment status
router.get("/my-bookings", verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, artist_profiles(*)")
    .eq("client_id", req.user.userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ message: "Could not fetch bookings" });

  res.json({ bookings: data });
});

module.exports = router;