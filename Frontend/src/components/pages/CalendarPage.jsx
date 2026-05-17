// pages/CalendarPage.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  GraduationCap,
  BookOpen,
  Clock,
  Star,
  Users,
  PlayCircle,
  Award,
  Zap,
  Loader2,
} from "lucide-react";
import lessonBanner from "./../assets/image/lessonpage.jpeg";

// ─── API ─────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";

async function fetchLessons() {
  const res = await fetch(`${API_BASE}/lessons`);
  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return res.json();
}
// ─────────────────────────────────────────────────────────────

/* ─── curriculum map ─── */
const YEAR_TABS = ["Foundation", "Second Year", "Third Year", "Fourth Year"];

const YEAR_SEM_KEYS = {
  Foundation: { s1: "Year 1 Semester 1", s2: "Year 1 Semester 2" },
  "Second Year": { s1: "Year 2 Semester 1", s2: "Year 2 Semester 2" },
  "Third Year": { s1: "Year 3 Semester 1", s2: "Year 3 Semester 2" },
  "Fourth Year": { s1: "Year 4 Semester 1", s2: "Year 4 Semester 2" },
};

/* gradient per year */
const YEAR_STYLE = {
  Foundation: {
    grad: "from-indigo-600 to-violet-600",
    accent: "text-indigo-600",
    border: "border-indigo-300",
    rowHover: "hover:bg-indigo-50",
    tag: "bg-indigo-100 text-indigo-700",
  },
  "Second Year": {
    grad: "from-cyan-600 to-indigo-600",
    accent: "text-cyan-600",
    border: "border-cyan-300",
    rowHover: "hover:bg-cyan-50",
    tag: "bg-cyan-100 text-cyan-700",
  },
  "Third Year": {
    grad: "from-emerald-600 to-teal-600",
    accent: "text-emerald-600",
    border: "border-emerald-300",
    rowHover: "hover:bg-emerald-50",
    tag: "bg-emerald-100 text-emerald-700",
  },
  "Fourth Year": {
    grad: "from-amber-500 to-orange-600",
    accent: "text-amber-600",
    border: "border-amber-300",
    rowHover: "hover:bg-amber-50",
    tag: "bg-amber-100 text-amber-700",
  },
};

/* ─── Subject Row ─── */
const SubjectRow = ({ subj, style, onClick }) => (
  <tr
    className={`border-b border-gray-200 ${style.rowHover} transition-colors duration-150 cursor-pointer group`}
    onClick={() => onClick(subj)}
  >
    <td className="py-3.5 px-4 text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">{subj.icon}</span>
        <span className="font-medium">{subj.title}</span>
      </div>
    </td>
    <td className="py-3.5 px-4 text-center">
      <span className={`text-sm font-bold ${style.accent}`}>{subj.credit}</span>
    </td>
    <td className="py-3.5 px-4 text-center text-gray-500 text-sm font-mono">
      {subj.hours || "—"}
    </td>
  </tr>
);

/* ─── Semester Card ─── */
const SemesterCard = ({ semLabel, subjects, style, onSubjectClick }) => {
  const hasOptions = subjects.some((s) => s.option);
  const opt1 = hasOptions
    ? subjects.filter((s) => s.option === "Option 1")
    : [];
  const opt2 = hasOptions
    ? subjects.filter((s) => s.option === "Option 2")
    : [];
  const regular = hasOptions ? [] : subjects;
  const totalCredits = subjects.reduce(
    (a, s) => a + (parseFloat(s.credit) || 0),
    0,
  );

  return (
    <div
      className={`flex-1 min-w-0 rounded-2xl overflow-hidden border ${style.border} bg-white shadow-sm`}
      style={{ animation: "fadeUp .5s ease both" }}
    >
      {/* Card header */}
      <div
        className={`bg-gradient-to-r ${style.grad} px-5 py-4 flex items-center justify-between`}
      >
        <div>
          <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-0.5">
            ITE Programme
          </p>
          <h3 className="text-white text-lg font-extrabold tracking-tight italic">
            {semLabel}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-white/80 text-xs">
            {subjects.length} subjects
          </span>
          <span className="text-white font-bold text-sm">
            {totalCredits.toFixed(1)} cr total
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`border-b ${style.border} bg-gray-50`}>
              <th className="py-2.5 px-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                Subject
              </th>
              <th className="py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                Credit
              </th>
              <th className="py-2.5 px-4 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                Hours (L-P-S)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {regular.map((s) => (
              <SubjectRow
                key={s.id}
                subj={s}
                style={style}
                onClick={onSubjectClick}
              />
            ))}

            {/* Option 1 */}
            {opt1.length > 0 && (
              <>
                <tr>
                  <td colSpan={3} className="pt-4 pb-1 px-4 bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
                      ✦ Option 1
                    </span>
                  </td>
                </tr>
                {opt1.map((s) => (
                  <SubjectRow
                    key={s.id}
                    subj={s}
                    style={style}
                    onClick={onSubjectClick}
                  />
                ))}
              </>
            )}

            {/* Option 2 */}
            {opt2.length > 0 && (
              <>
                <tr>
                  <td colSpan={3} className="pt-4 pb-1 px-4 bg-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                      ✦ Option 2 — GPA &gt; 3.5
                    </span>
                  </td>
                </tr>
                {opt2.map((s) => (
                  <SubjectRow
                    key={s.id}
                    subj={s}
                    style={style}
                    onClick={onSubjectClick}
                  />
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const CalendarPage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeYear, setActiveYear] = useState("Foundation");
  const [searchTerm, setSearchTerm] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedSubject, setSelectedSubject] = useState(null);

  // ── Fetch lessons from API ──────────────────────────────
  useEffect(() => {
    fetchLessons()
      .then((data) => setLessons(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  // ────────────────────────────────────────────────────────

  const style = YEAR_STYLE[activeYear];
  const { s1: sem1Key, s2: sem2Key } = YEAR_SEM_KEYS[activeYear];

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    const onMouse = (e) =>
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 18,
        y: (e.clientY / window.innerHeight - 0.5) * 18,
      });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  /* filter by semester + search */
  const filterSubjects = (semKey) =>
    lessons.filter(
      (l) =>
        l.semester === semKey &&
        (searchTerm === "" ||
          l.title.toLowerCase().includes(searchTerm.toLowerCase())),
    );

  // ── Loading State ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading curriculum...</p>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800">
          Failed to load curriculum
        </h2>
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
        <p className="text-gray-400 text-sm">
          Make sure your backend is running on{" "}
          <code className="bg-gray-100 px-1 rounded">
            http://localhost:5000
          </code>
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
  // ────────────────────────────────────────────────────────

  const sem1Subjects = filterSubjects(sem1Key);
  const sem2Subjects = filterSubjects(sem2Key);

  return (
    <div className="min-h-screen bg-white relative">
      <style>{`
        @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes fadeInUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(.92)}       to{opacity:1;transform:none} }

        .animate-pulse-slow  { animation: slowPulse 4s ease-in-out infinite; }
        @keyframes slowPulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.55;transform:scale(1.1)} }

        .pulse-orb  { animation: orbPulse 4s ease-in-out infinite; }
        @keyframes orbPulse { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:.4;transform:scale(1.12)} }

        .bounce-ind { animation: indBounce 2s ease-in-out infinite; }
        @keyframes indBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

        .scroll-dot { animation: dotMove 1.5s ease-in-out infinite; }
        @keyframes dotMove { 0%{transform:translateY(0);opacity:1} 50%{transform:translateY(8px);opacity:.3} 100%{transform:translateY(0);opacity:1} }

        .tab-active { color: white; box-shadow:0 4px 20px rgba(99,102,241,0.35); }
        tr:last-child { border-bottom: none; }

        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>

      {/* Scroll bar */}
      <div
        className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${scrollProgress > 15 ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"}`}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-cyan-500 to-indigo-600 animate-spin-slow opacity-80" />
        <span className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center hover:from-indigo-500 hover:to-cyan-500 transition-all duration-300 hover:scale-110 group shadow-lg shadow-indigo-500/40">
          <ChevronDown className="h-5 w-5 text-white rotate-180 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </span>
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 opacity-0 hover:opacity-30 blur-md transition-opacity duration-300" />
      </button>

      {/* ── HERO ── */}
      <div className="relative w-full h-[580px] overflow-hidden">
        <img
          src={lessonBanner}
          alt="Calendar Banner"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.1)`,
            transition: "transform 0.3s ease-out",
            zIndex: 0,
          }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/60" style={{ zIndex: 1 }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 3 }}
        >
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div
          className="absolute inset-0 flex items-center pt-[66px]"
          style={{ zIndex: 10 }}
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
            <div
              className="max-w-3xl"
              style={{ animation: "fadeInUp 0.7s ease-out both" }}
            >
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <GraduationCap className="h-4 w-4 text-cyan-300" />
                <span className="text-xs font-semibold text-white uppercase tracking-widest">
                  ITE Programme
                </span>
              </div>

              <h1
                className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight tracking-tight"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
                  Curriculum
                </span>
              </h1>

              <p
                className="text-lg text-gray-200 max-w-xl"
                style={{
                  animation: "fadeInUp 0.7s 0.2s ease-out both",
                  textShadow: "0 1px 10px rgba(0,0,0,0.5)",
                }}
              >
                The curriculum of Information Technology Engineering Department
                is designed for our students with abilities to use new
                technologies and theories to design and develop computer
                software
              </p>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-7 left-1/2 -translate-x-1/2 bounce-ind"
          style={{ zIndex: 10 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 scroll-dot" />
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-12">
        {/* Year tabs */}
        <div
          className="flex justify-center mb-10"
          style={{ animation: "fadeUp .5s .05s ease both" }}
        >
          <div className="flex items-center gap-1 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
            {YEAR_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveYear(tab);
                  setSearchTerm("");
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  activeYear === tab
                    ? `tab-active bg-gradient-to-r ${YEAR_STYLE[tab].grad} text-white`
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Year label */}
        <div
          className="mb-6 flex items-center gap-3"
          style={{ animation: "fadeUp .5s .15s ease both" }}
        >
          <div
            className={`h-px flex-1 bg-gradient-to-r ${style.grad} opacity-30`}
          />
          <span
            className={`text-xs font-bold uppercase tracking-widest ${style.accent} flex items-center gap-2`}
          >
            <Award className="h-3.5 w-3.5" />
            {activeYear} — {sem1Subjects.length + sem2Subjects.length} subjects
          </span>
          <div
            className={`h-px flex-1 bg-gradient-to-l ${style.grad} opacity-30`}
          />
        </div>

        {/* ── SIDE-BY-SIDE SEMESTER CARDS ── */}
        <div
          className="flex flex-col lg:flex-row gap-6"
          style={{ animation: "fadeUp .5s .2s ease both" }}
        >
          {sem1Subjects.length > 0 ? (
            <SemesterCard
              semLabel="SEMESTER I"
              subjects={sem1Subjects}
              style={style}
              onSubjectClick={setSelectedSubject}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 py-16 text-gray-400 text-sm">
              No subjects found
            </div>
          )}

          {sem2Subjects.length > 0 ? (
            <SemesterCard
              semLabel="SEMESTER II"
              subjects={sem2Subjects}
              style={style}
              onSubjectClick={setSelectedSubject}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 py-16 text-gray-400 text-sm">
              No subjects found
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          className="mt-8 flex items-center gap-6 text-gray-500 text-xs"
          style={{ animation: "fadeUp .5s .3s ease both" }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> L
            = Lecture
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> P
            = Practice
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> S
            = Self Study
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
