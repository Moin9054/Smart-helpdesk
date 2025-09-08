import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
// import "./index.css"; // ← keep this commented for now

console.log("MAIN: loaded"); // debug

ReactDOM.createRoot(document.getElementById("root")).render(
  // Remove StrictMode to reduce noise while debugging
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
