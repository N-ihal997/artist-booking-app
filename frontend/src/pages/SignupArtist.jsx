import { useState } from "react";

export default function SignupArtist() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim())                    e.name = "Please enter your name";
    if (!/\S+@\S+\.\S+/.test(form.email))     e.email = "Enter a valid email";
    if (form.phone.length < 7)                e.phone = "Enter a valid phone number";
    if (form.password.length < 8)             e.password = "Min. 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: "artist_manager"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess(true);
    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Account created!</h2>
          <p className="text-gray-500 text-sm mb-6">
            You're signed up as an artist manager. Next, set up your artist profile.
          </p>
          <button
            onClick={() => window.location.href = "/artist/create-profile"}
            className="w-full bg-purple-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition"
          >
            Set up artist profile →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md border border-gray-100">

        <span className="inline-block bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1 rounded-md mb-4">
          Artist manager account
        </span>
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-6">List your artists and start getting bookings</p>

        {errors.api && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {errors.api}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full name",        name: "name",            type: "text",     placeholder: "Your name" },
            { label: "Email address",    name: "email",           type: "email",    placeholder: "you@example.com" },
            { label: "Phone number",     name: "phone",           type: "tel",      placeholder: "+91 98765 43210" },
            { label: "Password",         name: "password",        type: "password", placeholder: "Min. 8 characters" },
            { label: "Confirm password", name: "confirmPassword", type: "password", placeholder: "Repeat password" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
              <input
                type={type} name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className={`w-full h-11 px-4 rounded-xl border text-sm outline-none transition
                  focus:ring-2 focus:ring-purple-200
                  ${errors[name] ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-purple-400"}`}
              />
              {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 mt-2"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}