import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/LandingPage.jsx";
import Dash from "./pages/DashBoard.jsx";
import Render from "./pages/Render.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dash />} />
      <Route path="/render" element={<Render />} />
    </Routes>
  </BrowserRouter>,
);
