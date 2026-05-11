// pages/LessonsPage.jsx
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Star,
  Users,
  Filter,
  Search,
  ChevronDown,
  GraduationCap,
  Calendar,
  ListVideo,
  Film,
  Layers,
  Lock,
  Loader2,
} from "lucide-react";
import lessonImage from "./../assets/image/lessonpage.jpeg";
import VideoModal from "./video/VideoModal";
import VideoPlaylistModal from "./video/VideoPlaylistModal";

// ─── API ────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";

async function fetchLessons() {
  const [lessonsRes, videosRes] = await Promise.all([
    fetch(`${API_BASE}/lessons`),
    fetch(`${API_BASE}/videos`),
  ]);
  const lessonsData = await lessonsRes.json();
  const videosData = await videosRes.json();

  // Attach videos array to each lesson
  return lessonsData.map((lesson) => ({
    ...lesson,
    videos: videosData
      .filter((v) => v.lesson_id === lesson.id)
      .sort((a, b) => a.order_index - b.order_index),
  }));
}
// ────────────────────────────────────────────────────────────

// Constants
const FREE_VIDEO_LIMIT = 2;

// Group lessons by year + semester
const buildSemesters = (lessons) => {
  const map = {};
  lessons.forEach((l) => {
    const key = l.semester || "Year 1 Semester 1";
    if (!map[key]) map[key] = [];
    map[key].push(l);
  });

  const order = [];
  for (let y = 1; y <= 4; y++) {
    for (let s = 1; s <= 2; s++) {
      order.push(`Year ${y} Semester ${s}`);
    }
  }

  return order.filter((k) => map[k]).map((k) => ({ label: k, items: map[k] }));
};

// Semester color styles
const SEMESTER_STYLES = [
  {
    gradient: "from-indigo-500 to-violet-600",
    light: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    badge: "bg-indigo-600",
  },
  {
    gradient: "from-cyan-500 to-indigo-600",
    light: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    badge: "bg-cyan-600",
  },
  {
    gradient: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    badge: "bg-emerald-600",
  },
  {
    gradient: "from-amber-500 to-orange-600",
    light: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badge: "bg-amber-600",
  },
  {
    gradient: "from-rose-500 to-pink-600",
    light: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    badge: "bg-rose-600",
  },
  {
    gradient: "from-violet-500 to-purple-600",
    light: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    badge: "bg-violet-600",
  },
  {
    gradient: "from-sky-500 to-blue-600",
    light: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    badge: "bg-sky-600",
  },
  {
    gradient: "from-fuchsia-500 to-pink-600",
    light: "bg-fuchsia-50",
    text: "text-fuchsia-700",
    border: "border-fuchsia-200",
    badge: "bg-fuchsia-600",
  },
];

// Video Count Badge Component
const VideoCountBadge = ({ count }) => {
  if (!count) return null;
  return (
    <div className="absolute top-4 left-16 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
      <Film className="h-3 w-3" />
      {count} {count === 1 ? "Video" : "Videos"}
    </div>
  );
};

// Subscription Modal Component
const SubscriptionModal = ({ onClose, onSubscribe }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 px-8 pt-10 pb-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            ✕
          </button>
          <div className="text-5xl mb-3">🔓</div>
          <h2 className="text-2xl font-bold mb-1">Unlock Full Access</h2>
          <p className="text-indigo-200 text-sm">
            You've used your {FREE_VIDEO_LIMIT} free preview videos
          </p>
        </div>
        <div className="p-8">
          <div className="bg-indigo-50 rounded-2xl p-4 mb-6 text-center">
            <div className="text-3xl font-bold text-indigo-700">
              $9.99
              <span className="text-base font-normal text-indigo-400">
                /month
              </span>
            </div>
          </div>
          <button
            onClick={onSubscribe}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold py-3.5 rounded-2xl hover:from-indigo-700 hover:to-violet-700 transition-all"
          >
            Subscribe Now →
          </button>
        </div>
      </div>
    </div>
  );
};

// Lesson Card Component
const LessonCard = ({ lesson, isSubscribed, onSubscribeRequest }) => {
  const [hovered, setHovered] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const hasVideos = lesson.videos && lesson.videos.length > 0;
  const videoCount = hasVideos ? lesson.videos.length : 0;
  const cardGradient = lesson.color || "from-indigo-500 to-purple-600";

  const handlePlayVideo = () => {
    if (videoCount > 1) {
      setShowPlaylist(true);
    } else if (videoCount === 1) {
      if (!isSubscribed && 1 > FREE_VIDEO_LIMIT) {
        onSubscribeRequest();
        return;
      }
      setSelectedVideo(lesson.videos[0]);
      setIsVideoModalOpen(true);
    } else if (lesson.videoLink) {
      if (!isSubscribed && 1 > FREE_VIDEO_LIMIT) {
        onSubscribeRequest();
        return;
      }
      setSelectedVideo({
        title: lesson.videoTitle || lesson.title,
        link: lesson.videoLink,
        duration: lesson.videoDuration || 30,
      });
      setIsVideoModalOpen(true);
    }
  };

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
    setShowPlaylist(false);
  };

  const isDark = document.documentElement.classList.contains("dark-mode");

  return (
    <>
      <div
        className={`group rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border transform hover:-translate-y-2 ${
          isDark ? "bg-[#1a1a35] border-[#2a2a4a]" : "bg-white border-gray-100"
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Card Header */}
        <div
          className={`relative h-44 bg-gradient-to-br ${cardGradient} overflow-hidden cursor-pointer`}
          onClick={handlePlayVideo}
        >
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${hovered ? "opacity-40" : "opacity-0"}`}
          />

          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium">
              {lesson.category}
            </span>
          </div>

          {(hasVideos || lesson.videoLink) && (
            <VideoCountBadge count={videoCount || 1} />
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-lg font-bold text-white mb-1">
              {lesson.title}
            </h3>
            <div className="flex items-center gap-4 text-white/90 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.credit} credits
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400" />
                {lesson.rating}
              </span>
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          >
            <div className="bg-white/30 backdrop-blur-sm rounded-full p-3">
              {videoCount > 1 ? (
                <Layers className="h-10 w-10 text-white" />
              ) : (
                <PlayCircle className="h-10 w-10 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                lesson.level === "Beginner"
                  ? "bg-green-100 text-green-700"
                  : lesson.level === "Intermediate"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {lesson.level}
            </span>
            <span
              className={`flex items-center text-xs ${isDark ? "text-[#7777aa]" : "text-gray-500"}`}
            >
              <Users className="h-3.5 w-3.5 mr-1" />
              {lesson.students?.toLocaleString() || "0"}
            </span>
          </div>

          <p
            className={`text-sm mb-4 line-clamp-2 ${isDark ? "text-[#9999cc]" : "text-gray-600"}`}
          >
            {lesson.description}
          </p>

          {videoCount > 1 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-400 flex items-center gap-1 mb-1">
                <ListVideo className="h-3 w-3" /> Playlist:
              </div>
              <div className="flex flex-wrap gap-1">
                {lesson.videos.slice(0, 3).map((v, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                  >
                    {i + 1}. {v.title.substring(0, 12)}…
                  </span>
                ))}
                {videoCount > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    +{videoCount - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handlePlayVideo}
            className="w-full group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: isDark ? "#14142b" : "#f9fafb",
              color: isDark ? "#9999cc" : "#374151",
            }}
          >
            <span>
              {videoCount > 1
                ? `View ${videoCount} Videos`
                : hasVideos || lesson.videoLink
                  ? "Watch Video"
                  : "Start Learning"}
            </span>
            {videoCount > 1 ? (
              <Layers className="h-4 w-4" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedVideo(null);
        }}
        videoLink={selectedVideo?.link}
        videoTitle={selectedVideo?.title}
      />
      {showPlaylist && (
        <VideoPlaylistModal
          isOpen={showPlaylist}
          onClose={() => setShowPlaylist(false)}
          videos={lesson.videos}
          lessonTitle={lesson.title}
          onSelectVideo={handleVideoSelect}
          isSubscribed={isSubscribed}
          onSubscribeRequest={onSubscribeRequest}
        />
      )}
    </>
  );
};

// Semester Section Component
const SemesterSection = ({
  label,
  items,
  styleIndex,
  searchTerm,
  selectedCategory,
  selectedLevel,
  isSubscribed,
  onSubscribeRequest,
}) => {
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const style = SEMESTER_STYLES[styleIndex % SEMESTER_STYLES.length];
  const [, yearNum, , semNum] = label.split(" ");

  const filtered = items.filter((l) => {
    const matchSearch = l.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCategory =
      selectedCategory === "All" || l.category === selectedCategory;
    const matchLevel =
      selectedLevel === "All Levels" || l.level === selectedLevel;
    return matchSearch && matchCategory && matchLevel;
  });

  if (filtered.length === 0) return null;

  return (
    <div className="mb-14">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-gradient-to-r ${style.gradient} shadow-lg mb-6 hover:shadow-xl transition-all`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white/70 text-xs font-semibold uppercase">
              ITE Programme
            </p>
            <h2 className="text-white text-xl font-bold">
              Year {yearNum} — Semester {semNum}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-white text-xs">
            <BookOpen className="h-3 w-3" /> {filtered.length} subjects
          </span>
          <div
            className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <ChevronDown className="h-5 w-5 text-white" />
          </div>
        </div>
      </button>

      {open && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(0, visibleCount).map((l) => (
              <LessonCard
                key={l.id}
                lesson={l}
                isSubscribed={isSubscribed}
                onSubscribeRequest={onSubscribeRequest}
              />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleCount((v) => v + 3)}
                className="px-7 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all"
              >
                Show more <ChevronDown className="h-4 w-4 inline" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Main LessonsPage Component
const LessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // ── Fetch lessons + videos from API ──────────────────────
  useEffect(() => {
    fetchLessons()
      .then((data) => setLessons(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  // ─────────────────────────────────────────────────────────

  const categories = ["All", ...new Set(lessons.map((l) => l.category))];
  const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
  const semesters = buildSemesters(lessons);
  const isDark = document.documentElement.classList.contains("dark-mode");

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    const onMouse = (e) =>
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    window.addEventListener("scroll", onScroll);
    window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  // ── Loading State ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading lessons...</p>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800">
          Failed to load lessons
        </h2>
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
        <p className="text-gray-400 text-sm">
          Make sure your backend is running on{" "}
          <code>http://localhost:5000</code>
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchLessons()
              .then(setLessons)
              .catch((e) => setError(e.message))
              .finally(() => setLoading(false));
          }}
          className="mt-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────

  return (
    <div
      className={`min-h-screen ${isDark ? "bg-[#0d0d1a]" : "bg-gradient-to-b from-gray-50 to-white"}`}
    >
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease-out both; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      `}</style>

      {/* Scroll Progress */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Back to Top */}
      {scrollProgress > 20 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center"
        >
          ↑
        </button>
      )}

      {/* Subscription Badge */}
      <div className="fixed top-4 right-4 z-40">
        {isSubscribed ? (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
            ✅ Subscribed
          </div>
        ) : (
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:from-indigo-700 transition-all"
          >
            🔓 Subscribe
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[500px] overflow-hidden">
        <img
          src={lessonImage}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.05)`,
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-5 text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Expand Your Knowledge
            </h1>
            <p className="text-lg max-w-xl">
              Video lessons organised by year and semester. First{" "}
              {FREE_VIDEO_LIMIT} videos free.
            </p>
            {!isSubscribed && (
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="mt-6 bg-white text-indigo-700 font-bold px-6 py-3 rounded-2xl hover:bg-indigo-50 transition-all"
              >
                🔓 Unlock All — $9.99/mo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 py-12">
        {/* Free Preview Banner */}
        {!isSubscribed && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-amber-900">Free Preview Mode</p>
              <p className="text-amber-700 text-sm">
                Watch first {FREE_VIDEO_LIMIT} videos free. Subscribe to unlock
                all.
              </p>
            </div>
            <button
              onClick={() => setShowSubscriptionModal(true)}
              className="bg-amber-600 text-white px-5 py-2 rounded-xl hover:bg-amber-700"
            >
              Unlock All →
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div
            className={`flex rounded-2xl border shadow-sm ${isDark ? "bg-[#1a1a35] border-[#2a2a4a]" : "bg-white border-gray-200"}`}
          >
            <div className="flex-1 flex items-center px-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3 focus:outline-none"
              />
            </div>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 rounded-xl font-semibold">
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? "bg-indigo-600 text-white" : `bg-white border ${isDark ? "border-[#2a2a4a] text-gray-300" : "border-gray-200 text-gray-600"}`}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="rounded-lg px-4 py-2 text-sm border focus:outline-none"
            >
              {levels.map((lv) => (
                <option key={lv}>{lv}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Semester Sections */}
        {semesters.map((sem, idx) => (
          <SemesterSection
            key={sem.label}
            label={sem.label}
            items={sem.items}
            styleIndex={idx}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            selectedLevel={selectedLevel}
            isSubscribed={isSubscribed}
            onSubscribeRequest={() => setShowSubscriptionModal(true)}
          />
        ))}
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onSubscribe={() => {
            setIsSubscribed(true);
            setShowSubscriptionModal(false);
          }}
        />
      )}
    </div>
  );
};

export default LessonsPage;
