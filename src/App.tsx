import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ImageConverter from "./components/ImageConverter";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/image-converter" element={<ImageConverter />} />
      </Routes>
    </Router>
  );
};

export default App;
