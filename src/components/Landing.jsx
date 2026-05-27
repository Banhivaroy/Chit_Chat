import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Welcome from "./Welcome";
function Landing() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="main">
        <Welcome username= "username" />
      </main>
    </div>
  );
}

export default Landing;
