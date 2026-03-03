import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import "./App.css";
import { CAREER_DB } from "./data/careers";
import { COMPANY_LIST } from "./data/companies";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import LandingHero from "./components/Landing/LandingHero";
import CareerView from "./components/Career/CareerView";
import CompareView from "./components/Compare/CompareView";
import CompanyView from "./components/Company/CompanyView";
import AIChat from "./components/AI/AIChat";
import ShareCard from "./components/shared/ShareCard";
import PricingModal from "./components/shared/PricingModal";
import AdminOrders from "./components/Admin/AdminOrders";
import GaokaoView from "./components/Gaokao/GaokaoView";
import useAppStore from "./store/useAppStore";

function CareerRoute() {
  const params = useParams();
  const setCareerName = useAppStore((s) => s.setCareerName);
  const careerName = useAppStore((s) => s.careerName);
  const timeRange = useAppStore((s) => s.timeRange);
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const openPricing = useAppStore((s) => s.openPricing);
  const setShareOpen = useAppStore((s) => s.setShareOpen);
  const name = decodeURIComponent(params.name || "");
  const isValid = CAREER_DB.some((c) => c.career_name === name);
  useEffect(() => {
    if (isValid && name !== careerName) {
      setCareerName(name);
    }
  }, [isValid, name, setCareerName, careerName]);

  if (!isValid) {
    const fallback = CAREER_DB[0]?.career_name || "";
    return <Navigate to={`/career/${encodeURIComponent(fallback)}`} replace />;
  }

  return (
    <CareerView
      careerName={name}
      timeRange={timeRange}
      setTimeRange={setTimeRange}
      onShare={() => setShareOpen(true)}
      onOpenPricing={openPricing}
    />
  );
}

function CompanyRoute() {
  const params = useParams();
  const setCompanyName = useAppStore((s) => s.setCompanyName);
  const companyName = useAppStore((s) => s.companyName);
  const name = decodeURIComponent(params.name || "");
  const isValid = COMPANY_LIST.some((c) => c.company === name);
  useEffect(() => {
    if (isValid && name !== companyName) {
      setCompanyName(name);
    }
  }, [isValid, name, setCompanyName, companyName]);

  const fallback = COMPANY_LIST[0]?.company || "";
  if (!isValid) {
    return <Navigate to={`/company/${encodeURIComponent(fallback)}`} replace />;
  }
  return <CompanyView companyName={name} setCompanyName={setCompanyName} />;
}

export default function App() {
  const location = useLocation();
  const careerName = useAppStore((s) => s.careerName);
  const aiOpen = useAppStore((s) => s.aiOpen);
  const setAiOpen = useAppStore((s) => s.setAiOpen);
  const shareOpen = useAppStore((s) => s.shareOpen);
  const setShareOpen = useAppStore((s) => s.setShareOpen);
  const pricingOpen = useAppStore((s) => s.pricingOpen);
  const pricingTrigger = useAppStore((s) => s.pricingTrigger);
  const openPricing = useAppStore((s) => s.openPricing);
  const closePricing = useAppStore((s) => s.closePricing);

  const isAdmin = location.pathname.startsWith("/admin/orders");
  const isLanding = location.pathname === "/";
  const isGaokao = location.pathname.startsWith("/gaokao");
  const isSingleColumn = isLanding || isAdmin || isGaokao;
  const showSidebar = location.pathname.startsWith("/career")
    || location.pathname.startsWith("/compare")
    || location.pathname.startsWith("/company");

  useEffect(() => {
    if (isLanding) {
      document.title = "职业K线 - 用K线看懂你的职业未来";
      return;
    }
    if (location.pathname.startsWith("/career")) {
      document.title = `${careerName} 薪资趋势与AI风险分析 - 职业K线`;
      return;
    }
    if (isGaokao) {
      document.title = "高考选专业智能匹配 - 职业K线";
      return;
    }
    if (location.pathname.startsWith("/compare")) {
      document.title = "职业对比分析 - 职业K线";
      return;
    }
    if (location.pathname.startsWith("/company")) {
      document.title = "公司用工分析 - 职业K线";
      return;
    }
    document.title = "职业K线 - 用K线看懂你的职业未来";
  }, [isLanding, isGaokao, location.pathname, careerName]);

  return (
    <div className="app">
      {!isAdmin && <Header />}

      <div className={`content ${isLanding ? "content-landing" : ""} ${isSingleColumn ? "content-single" : ""}`}>
        {showSidebar && <Sidebar />}

        <main className="main">
          <Routes>
            <Route path="/" element={<LandingHero />} />
            <Route path="/career" element={<Navigate to={`/career/${encodeURIComponent(CAREER_DB[0]?.career_name || "")}`} replace />} />
            <Route path="/career/:name" element={<CareerRoute />} />
            <Route path="/compare" element={<CompareView />} />
            <Route path="/compare/:a/:b" element={<CompareView />} />
            <Route path="/company/:name" element={<CompanyRoute />} />
            <Route path="/gaokao" element={<GaokaoView />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {!isAdmin && (
            <footer className="footer">
              <div className="footer-links">
                <button className="footer-link" onClick={() => openPricing("ai")}>定价方案</button>
                <span className="footer-dot">·</span>
                <a className="footer-link" href="https://kevinkai.online" target="_blank" rel="noreferrer">博客</a>
                <span className="footer-dot">·</span>
                <a className="footer-link" href="https://7menquant.shop" target="_blank" rel="noreferrer">奇门量化</a>
              </div>
              <div className="footer-copy">
                数据基于公开信息与AI趋势模型 · 仅供参考 · Career K-Line © 2026
              </div>
            </footer>
          )}
        </main>
      </div>

      {!isAdmin && (
        <AIChat
          isOpen={aiOpen}
          onClose={() => setAiOpen(false)}
          careerName={careerName}
        />
      )}

      {!isAdmin && shareOpen && (
        <ShareCard careerName={careerName} onClose={() => setShareOpen(false)} />
      )}

      {!isAdmin && pricingOpen && (
        <PricingModal
          trigger={pricingTrigger}
          careerName={careerName}
          onClose={closePricing}
        />
      )}
    </div>
  );
}
