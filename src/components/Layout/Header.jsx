import { useLocation, useNavigate } from "react-router-dom";
import { VIEW_TABS } from "../../utils/constants";
import { CAREER_DB } from "../../data/careers";
import { COMPANY_LIST } from "../../data/companies";
import useAppStore from "../../store/useAppStore";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setAiOpen = useAppStore((s) => s.setAiOpen);
  const careerName = useAppStore((s) => s.careerName);
  const companyName = useAppStore((s) => s.companyName);

  const path = location.pathname;
  const isLanding = path === "/";
  const activeTab = path.startsWith("/compare")
    ? "compare"
    : path.startsWith("/company")
      ? "company"
      : path.startsWith("/gaokao")
        ? "gaokao"
        : path.startsWith("/career")
          ? "career"
          : "";

  return (
    <header className="app-header">
      <div className="brand">
        {!isLanding && (
          <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="菜单">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <button className="brand-btn" onClick={() => navigate("/")}>
          <div className="brand-logo">K</div>
          <div>
            <div className="brand-title">职业K线</div>
            <div className="brand-subtitle">Career K-Line</div>
          </div>
        </button>
      </div>
      <div className="header-actions">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`pill ${activeTab === tab.key ? "pill-active" : ""}`}
            onClick={() => {
              if (tab.key === "career") {
                const name = careerName || CAREER_DB[0]?.career_name || "";
                navigate(`/career/${encodeURIComponent(name)}`);
                return;
              }
              if (tab.key === "compare") {
                navigate("/compare");
                return;
              }
              if (tab.key === "company") {
                const name = companyName || COMPANY_LIST[0]?.company || "";
                navigate(`/company/${encodeURIComponent(name)}`);
                return;
              }
              if (tab.key === "gaokao") {
                navigate("/gaokao");
              }
            }}
          >
            <span className="pill-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
        <button className="pill pill-ai" onClick={() => {
          const name = careerName || CAREER_DB[0]?.career_name || "";
          navigate(`/career/${encodeURIComponent(name)}`);
          setAiOpen(true);
        }} title="AI职业顾问">
          <span className="pill-icon">🧠</span>
          <span>AI顾问</span>
        </button>
      </div>
    </header>
  );
}
