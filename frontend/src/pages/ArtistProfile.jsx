import { useState, useEffect } from "react";

export default function ArtistProfile() {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    event_date: "",
    event_type: "",
    location: "",
    message: ""
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState("");

  const artistId = window.location.pathname.split("/").pop();

  useEffect(() => {
    fetchArtist();
  }, []);

  async function fetchArtist() {
    const token = localStorage.getItem("token");
    const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/artists/" + artistId, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    setArtist(data.artist);
    setLoading(false);
  }

  async function handleBooking(e) {
    e.preventDefault();
    if (!bookingForm.event_date || !bookingForm.event_type || !bookingForm.location) {
      setError("Please fill all fields");
      return;
    }
    const token = localStorage.getItem("token");
    const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        artist_id: artistId,
        event_date: bookingForm.event_date,
        event_type: bookingForm.event_type,
        location: bookingForm.location,
        amount: artist.budget_min
      })
    });
    const data = await res.json();
    if (res.ok) {
      setBookingSuccess(true);
    } else {
      setError(data.message);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  if (!artist) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Artist not found
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        <button
          onClick={() => window.location.href = "/search"}
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1"
        >
          Back to search
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
            {artist.photos && artist.photos[0] ? (
              <img src={artist.photos[0]} alt={artist.stage_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl font-bold text-purple-300">
                {artist.stage_name.charAt(0)}
              </span>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold mb-1">{artist.stage_name}</h1>
                <p className="text-gray-500 text-sm">{artist.location}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Budget</p>
                <p className="font-semibold text-gray-900">
                  Rs. {artist.budget_min?.toLocaleString()} - {artist.budget_max?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {artist.genre && artist.genre.map(g => (
                <span key={g} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                  {g}
                </span>
              ))}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">{artist.biography}</p>

            {artist.videos && artist.videos.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Videos</h3>
                <div className="space-y-1">
                  {artist.videos.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline block">
                      Watch video {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {bookingSuccess ? (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold text-green-800 mb-2">Booking request sent!</h2>
            <p className="text-green-600 text-sm mb-4">
              The artist manager will review and respond shortly.
            </p>
            <button
              onClick={() => window.location.href = "/search"}
              className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition"
            >
              Back to search
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Send booking request</h2>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Event date</label>
                <input
                  type="date"
                  value={bookingForm.event_date}
                  onChange={e => setBookingForm({ ...bookingForm, event_date: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Event type</label>
                <select
                  value={bookingForm.event_type}
                  onChange={e => setBookingForm({ ...bookingForm, event_type: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">Select event type</option>
                  <option>Wedding</option>
                  <option>Corporate event</option>
                  <option>Birthday party</option>
                  <option>Concert</option>
                  <option>Festival</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Event location</label>
                <input
                  type="text"
                  placeholder="e.g. Kozhikode, Kerala"
                  value={bookingForm.location}
                  onChange={e => setBookingForm({ ...bookingForm, location: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
              >
                Send booking request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}