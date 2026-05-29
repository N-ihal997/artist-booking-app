import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51Tc1eqDcKsIq3AQOrs1nbluobQlNLzoPInxTxrc0MfC4iUshEa7Nb2CSwSnyAeyJMxEhYSCt9viz4lopitFdtrnV005tWH0bTp");

function CheckoutForm({ bookingId, amount, artistName }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");

  useEffect(() => {
    createPaymentIntent();
  }, []);

  async function createPaymentIntent() {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/payments/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ bookingId })
    });
    const data = await res.json();
    if (res.ok) {
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.clientSecret.split("_secret_")[0]);
    } else {
      setError(data.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setLoading(true);
    setError("");

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else if (result.paymentIntent.status === "succeeded") {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({
          bookingId,
          paymentIntentId: result.paymentIntent.id
        })
      });
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-semibold text-green-800 mb-2">Payment successful!</h2>
        <p className="text-gray-500 text-sm mb-6">Your booking with {artistName} is confirmed.</p>
        <button
          onClick={() => window.location.href = "/my-bookings"}
          className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition"
        >
          View my bookings
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-xs text-gray-500 mb-1">Paying for</p>
        <p className="font-medium text-gray-900">{artistName}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">
          Rs. {amount?.toLocaleString()}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Card details
        </label>
        <div className="border border-gray-200 rounded-xl px-4 py-3">
          <CardElement options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1a1a1a",
                "::placeholder": { color: "#9ca3af" }
              }
            }
          }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Test card: 4242 4242 4242 4242 - any future date - any 3 digits
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Rs. " + amount?.toLocaleString()}
      </button>
    </form>
  );
}

export default function Payment() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("bookingId");
  const amount = parseInt(params.get("amount"));
  const artistName = params.get("artistName");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6">Complete payment</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            bookingId={bookingId}
            amount={amount}
            artistName={artistName}
          />
        </Elements>
      </div>
    </div>
  );
}