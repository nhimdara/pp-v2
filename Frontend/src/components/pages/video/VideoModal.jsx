import React, { useEffect } from "react";
import { X, PlayCircle } from "lucide-react";

const VideoModal = ({ isOpen, onClose, videoLink, videoTitle }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-gray-950 rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: "vmFadeIn 0.25s ease-out both" }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes vmFadeIn {
            from { opacity:0; transform:scale(0.95) translateY(12px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <PlayCircle className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm truncate max-w-xs sm:max-w-md">
              {videoTitle || "Video Lesson"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Video */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {videoLink ? (
            <iframe
              src={videoLink}
              title={videoTitle || "Video Lesson"}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
              <PlayCircle className="h-16 w-16 mb-3" />
              <p className="text-sm">No video available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;