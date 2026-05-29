const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const { supabase } = require("../db");
const router   = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ message: "All fields are required" });

  if (password.length < 8)
    return res.status(400).json({ message: "Password too short" });

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing)
    return res.status(409).json({ message: "Email already registered" });

  const password_hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("users")
    .insert({ name, email, phone, password_hash, role })
    .select()
    .single();

  if (error)
    return res.status(500).json({ message: "Could not create account" });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({ token, user: { id: user.id, name, email, role } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user)
    return res.status(401).json({ message: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
});

module.exports = router;