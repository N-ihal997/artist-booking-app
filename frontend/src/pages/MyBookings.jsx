import { useState, useEffect } from "react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    const token = localStorage.getItem("token");
    const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/payments/my-bookings", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    setBookings(data.bookings || []);
    setLoading(false);
  }

  function statusColor(status) {
    if (status === "pending") return "bg-yellow-50 text-yellow-700";
    if (status === "accepted") return "bg-green-50 text-green-700";
    if (status === "rejected") return "bg-red-50 text-red-600";
    if (status === "completed") return "bg-blue-50 text-blue-700";
    return "bg-gray-50 text-gray-600";
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">My bookings</h1>
            <p className="text-gray-500 text-sm">Track your event bookings</p>
          </div>
          <button
            onClick={() => window.location.href = "/search"}
            className="text-sm text-blue-600 hover:underline"
          >
            Find more artists
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No bookings yet. Search for artists to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {booking.artist_profiles?.stage_name}
                    </h3>
                    <p className="text-sm text-gray-500">{booking.artist_profiles?.location}</p>
                  </div>
                  <span className={"text-xs font-medium px-2 py-1 rounded-full " + statusColor(booking.status)}>
                    {booking.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Event date</p>
                    <p className="text-sm font-medium">{booking.event_date}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Event type</p>
                    <p className="text-sm font-medium">{booking.event_type}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                    <p className="text-sm font-medium">Rs. {booking.amount?.toLocaleString()}</p>
                  </div>
                </div>

                {booking.status === "accepted" && !booking.stripe_payment_id && (
                  <button
                    onClick={() => window.location.href =
                      "/payment?bookingId=" + booking.id +
                      "&amount=" + booking.amount +
                      "&artistName=" + booking.artist_profiles?.stage_name
                    }
                    className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition"
                  >
                    Pay now — Rs. {booking.amount?.toLocaleString()}
                  </button>
                )}

                 {booking.status === "accepted" && (
                  <button
                    onClick={() => window.location.href = "/chat?bookingId=" + booking.id}
                    className="w-full h-10 border border-purple-200 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-50 transition mb-2"
                >
                   Chat with artist manager
                  </button>
                )}

                {booking.stripe_payment_id && (
                   <div className="space-y-2">
                   <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-xl text-center">
                      Payment complete
                    </div>
                   <button
                     onClick={() => window.location.href = "/chat?bookingId=" + booking.id}
                     className="w-full h-10 border border-purple-200 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-50 transition"
                   >
                     Chat with artist manager
                    </button>
                  </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}