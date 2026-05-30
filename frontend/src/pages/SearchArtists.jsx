import { useState, useEffect } from "react";

const GENRES = [
  "All", "Classical Music", "Folk Music", "Carnatic Music",
  "Bollywood", "Jazz", "Rock", "Pop", "Dance",
  "Comedy", "Magic", "DJ", "Band"
];

export default function SearchArtists() {
  const [artists, setArtists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState("All");
  const [location, setLocation] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [genre, location, budgetMax, artists]);

  async function fetchArtists() {
    const token = localStorage.getItem("token");
    const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/artists/all", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    setArtists(data.artists || []);
    setFiltered(data.artists || []);
    setLoading(false);
  }

  function applyFilters() {
    let result = [...artists];
    if (genre !== "All") {
      result = result.filter(a => a.genre && a.genre.includes(genre));
    }
    if (location.trim()) {
      result = result.filter(a =>
        a.location && a.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    if (budgetMax) {
      result = result.filter(a => a.budget_min <= parseInt(budgetMax));
    }
    setFiltered(result);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-1">Find artists</h1>
          <p className="text-gray-500 text-sm">Browse and book artists for your event</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. Kozhikode"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max budget (Rs.)</label>
              <input
                type="number"
                placeholder="e.g. 20000"
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Genre</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              >
                {GENRES.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading artists...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No artists found. Try changing filters.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(artist => (
              <div
                key={artist.id}
                onClick={() => window.location.href = "/artist/" + artist.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition"
              >
                <div className="h-40 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  {artist.photos && artist.photos[0] ? (
                    <img src={artist.photos[0]} alt={artist.stage_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-purple-300">
                      {artist.stage_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{artist.stage_name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{artist.location}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {artist.genre && artist.genre.slice(0, 2).map(g => (
                      <span key={g} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                        {g}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Rs. {artist.budget_min?.toLocaleString()} - {artist.budget_max?.toLocaleString()}
                    </span>
                    <span className="text-xs text-blue-600 font-medium">View profile</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}