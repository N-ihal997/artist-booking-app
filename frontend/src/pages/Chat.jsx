import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://artist-booking-app-h66r.onrender.com");

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("bookingId");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!bookingId) return;
    socket.emit("join_room", bookingId);
    fetchMessages();

    socket.on("receive_message", (data) => {
      setMessages(prev => {
        const exists = prev.find(m => m.id === data.id);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    return () => {
      socket.off("receive_message");
    };
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    const token = localStorage.getItem("token");
    const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/messages/" + bookingId, {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem("token");
    const res = await fetch("https://artist-booking-app-h66r.onrender.com/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ booking_id: bookingId, content: newMessage })
    });

    const data = await res.json();
    if (res.ok) {
      const messageData = {
        ...data.message,
        users: { name: user.name, role: user.role },
        bookingId
      };
      socket.emit("send_message", messageData);
      setMessages(prev => [...prev, messageData]);
      setNewMessage("");
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading chat...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-gray-600"
        >
          Back
        </button>
        <div>
          <h1 className="text-base font-semibold text-gray-900">Booking chat</h1>
          <p className="text-xs text-gray-500">Booking ID: {bookingId?.slice(0, 8)}...</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={i} className={"flex " + (isMe ? "justify-end" : "justify-start")}>
                  <div className={"max-w-xs lg:max-w-md " + (isMe ? "items-end" : "items-start") + " flex flex-col"}>
                    <p className="text-xs text-gray-400 mb-1 px-1">
                      {msg.users?.name || "Unknown"}
                    </p>
                    <div className={"px-4 py-2.5 rounded-2xl text-sm " +
                      (isMe
                        ? "bg-purple-600 text-white rounded-tr-sm"
                        : "bg-white text-gray-900 border border-gray-100 rounded-tl-sm")}>
                      {msg.content}
                    </div>
                    <p className="text-xs text-gray-300 mt-1 px-1">
                      {msg.sent_at ? new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-5 h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}