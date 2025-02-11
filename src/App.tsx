import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VideoTools from "@/pages/VideoTools";
import Home from "@/pages/Home";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/video-tools" element={<VideoTools />} />
      </Routes>
    </Router>
  );
};

export default App;
