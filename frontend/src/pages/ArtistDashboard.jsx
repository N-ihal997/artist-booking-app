import { useState, useEffect } from "react";

export default function ArtistDashboard() {
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: "Bearer " + token };

    const [profileRes, bookingsRes] = await Promise.all([
      fetch("https://artist-booking-app-h66r.onrender.com/api/artists/profile/me", { headers }),
      fetch("https://artist-booking-app-h66r.onrender.com/api/bookings/requests", { headers })
    ]);

    const profileData = await profileRes.json();
    const bookingsData = await bookingsRes.json();

    setProfile(profileData.profile);
    setBookings(bookingsData.bookings || []);
    setLoading(false);
  }

  async function updateStatus(bookingId, status) {
    setUpdating(bookingId);
    const token = localStorage.getItem("token");
    const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/bookings/" + bookingId + "/status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status } : b)
      );
    }
    setUpdating(null);
  }

  const filtered = bookings.filter(b => b.status === activeTab);

  const counts = {
    pending: bookings.filter(b => b.status === "pending").length,
    accepted: bookings.filter(b => b.status === "accepted").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Artist Manager Dashboard</h1>
          {profile && (
            <p className="text-sm text-gray-500">{profile.stage_name}</p>
          )}
        </div>
        <button
          onClick={() => { localStorage.clear(); window.location.href = "/"; }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-yellow-500">{counts.pending}</p>
            <p className="text-sm text-gray-500 mt-1">Pending</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-green-500">{counts.accepted}</p>
            <p className="text-sm text-gray-500 mt-1">Accepted</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
            <p className="text-3xl font-bold text-red-400">{counts.rejected}</p>
            <p className="text-sm text-gray-500 mt-1">Rejected</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {["pending", "accepted", "rejected"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={"flex-1 py-3 text-sm font-medium capitalize transition " +
                  (activeTab === tab
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                    : "text-gray-500 hover:text-gray-700")}
              >
                {tab} ({counts[tab]})
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                No {activeTab} bookings
              </div>
            ) : (
              filtered.map(booking => (
                <div key={booking.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.users?.name || "Client"}
                      </p>
                      <p className="text-sm text-gray-500">{booking.users?.email}</p>
                    </div>
                    <span className={"text-xs font-medium px-2 py-1 rounded-full " +
                      (booking.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                       booking.status === "accepted" ? "bg-green-50 text-green-700" :
                       "bg-red-50 text-red-600")}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Event date</p>
                      <p className="text-sm font-medium text-gray-900">{booking.event_date}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Event type</p>
                      <p className="text-sm font-medium text-gray-900">{booking.event_type}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Location</p>
                      <p className="text-sm font-medium text-gray-900">{booking.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                     Rs. {booking.amount?.toLocaleString()}
                    </p>
                   {(booking.status === "accepted" || booking.status === "completed") && (
                    <button
                       onClick={() => window.location.href = "/chat?bookingId=" + booking.id}
                       className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition"
                    >
                      Chat 
                    </button>
                     )}
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(booking.id, "rejected")}
                          disabled={updating === booking.id}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "accepted")}
                          disabled={updating === booking.id}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {updating === booking.id ? "Updating..." : "Accept"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {profile && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Your artist profile</h3>
                <p className="text-sm text-gray-500">{profile.stage_name} - {profile.location}</p>
              </div>
              <button
                onClick={() => window.location.href = "/artist/create-profile"}
                className="text-sm text-purple-600 hover:underline"
              >
                Edit profile
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
