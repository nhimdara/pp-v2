import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// pages/index.js
export { default as HomePage } from "./components/pages/HomePage";
export { default as LessonsPage } from "./components/pages/LessonsPage";
export { default as ProjectsPage } from "./components/pages/ProjectsPage";
export { default as CalendarPage } from "./components/pages/CalendarPage";
export { default as Profile } from "./components/pages/Profile/Profile";
export { default as MyCourses } from "./components/pages/Profile/MyCourses";
export { default as Certificates } from "./components/pages/Profile/Certificates";
export { default as Schedule } from "./components/pages/Profile/Schedule";
export { default as ProgressTracker } from "./components/pages/Profile/ProgressTracker";
export { default as Settings } from "./components/pages/Profile/Settings";
export { default as Dashboard } from "./components/pages/Profile/Dashboard";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
