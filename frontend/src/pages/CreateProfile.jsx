import { useState } from "react";

const GENRES = [
  "Classical Music", "Folk Music", "Carnatic Music",
  "Bollywood", "Jazz", "Rock", "Pop", "Dance",
  "Comedy", "Magic", "DJ", "Band"
];

export default function CreateProfile() {
  const [form, setForm] = useState({
    stage_name: "",
    biography: "",
    genre: [],
    budget_min: "",
    budget_max: "",
    location: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function toggleGenre(g) {
    setForm(prev => ({
      ...prev,
      genre: prev.genre.includes(g)
        ? prev.genre.filter(x => x !== g)
        : [...prev.genre, g]
    }));
  }

  function validate() {
    const e = {};
    if (!form.stage_name.trim())   e.stage_name = "Stage name is required";
    if (!form.biography.trim())    e.biography = "Please write a short biography";
    if (form.genre.length === 0)   e.genre = "Select at least one genre";
    if (!form.budget_min)          e.budget_min = "Enter minimum budget";
    if (!form.budget_max)          e.budget_max = "Enter maximum budget";
    if (!form.location.trim())     e.location = "Enter your location";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/artists/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          budget_min: parseInt(form.budget_min),
          budget_max: parseInt(form.budget_max)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎵</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Profile created!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your artist profile is live. Clients can now find and book you.
          </p>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition"
          >
            Go to dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 border border-gray-100">

        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1 rounded-md mb-4">
          Step 2 of 2
        </span>
        <h1 className="text-2xl font-semibold mb-1">Set up artist profile</h1>
        <p className="text-gray-500 text-sm mb-6">
          This is what clients will see when they search for artists
        </p>

        {errors.api && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Stage name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Stage name / Artist name
            </label>
            <input
              type="text"
              placeholder="e.g. DJ Nihal, The Kerala Band"
              value={form.stage_name}
              onChange={e => setForm({ ...form, stage_name: e.target.value })}
              className={`w-full h-11 px-4 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-200
                ${errors.stage_name ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-purple-400"}`}
            />
            {errors.stage_name && <p className="text-red-500 text-xs mt-1">{errors.stage_name}</p>}
          </div>

          {/* Biography */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Biography
            </label>
            <textarea
              placeholder="Tell clients about the artist, experience, style..."
              value={form.biography}
              onChange={e => setForm({ ...form, biography: e.target.value })}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-200 resize-none
                ${errors.biography ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-purple-400"}`}
            />
            {errors.biography && <p className="text-red-500 text-xs mt-1">{errors.biography}</p>}
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Genre / Type of performance
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button
                  key={g} type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition
                    ${form.genre.includes(g)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-purple-400"}`}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.genre && <p className="text-red-500 text-xs mt-1">{errors.genre}</p>}
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Budget range (₹)
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min e.g. 5000"
                  value={form.budget_min}
                  onChange={e => setForm({ ...form, budget_min: e.target.value })}
                  className={`w-full h-11 px-4 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-200
                    ${errors.budget_min ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-purple-400"}`}
                />
                {errors.budget_min && <p className="text-red-500 text-xs mt-1">{errors.budget_min}</p>}
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max e.g. 50000"
                  value={form.budget_max}
                  onChange={e => setForm({ ...form, budget_max: e.target.value })}
                  className={`w-full h-11 px-4 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-200
                    ${errors.budget_max ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-purple-400"}`}
                />
                {errors.budget_max && <p className="text-red-500 text-xs mt-1">{errors.budget_max}</p>}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Kozhikode, Kerala"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className={`w-full h-11 px-4 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-purple-200
                ${errors.location ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-purple-400"}`}
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? "Saving profile..." : "Save artist profile"}
          </button>

        </form>
      </div>
    </div>
  );
}