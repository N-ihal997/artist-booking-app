import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupArtist from "./pages/SignupArtist";
import SignupClient from "./pages/SignupClient";
import CreateProfile from "./pages/CreateProfile";
import SearchArtists from "./pages/SearchArtists";
import ArtistProfile from "./pages/ArtistProfile";
import ArtistDashboard from "./pages/ArtistDashboard";
import Login from "./pages/Login";
import Payment from "./pages/Payment";
import MyBookings from "./pages/MyBookings";
import Chat from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignupArtist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup/artist" element={<SignupArtist />} />
        <Route path="/signup/client" element={<SignupClient />} />
        <Route path="/artist/create-profile" element={<CreateProfile />} />
        <Route path="/search" element={<SearchArtists />} />
        <Route path="/artist/:id" element={<ArtistProfile />} />
        <Route path="/dashboard" element={<ArtistDashboard />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;