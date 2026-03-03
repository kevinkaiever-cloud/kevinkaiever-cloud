import { create } from "zustand";
import { CAREER_DB } from "../data/careers";
import { COMPANY_LIST } from "../data/companies";

const initialCareer = CAREER_DB[0]?.career_name || "";
const initialCompany = COMPANY_LIST[0]?.company || "";

const useAppStore = create((set) => ({
  // ── Navigation ──
  view: "landing",
  setView: (view) => set({ view }),

  // ── UI panels ──
  sidebarOpen: false,
  aiOpen: false,
  shareOpen: false,
  pricingOpen: false,
  pricingTrigger: "ai",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleAI: () => set((s) => ({ aiOpen: !s.aiOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setAiOpen: (aiOpen) => set({ aiOpen }),
  setShareOpen: (shareOpen) => set({ shareOpen }),
  openPricing: (trigger = "ai") => set({ pricingOpen: true, pricingTrigger: trigger }),
  closePricing: () => set({ pricingOpen: false }),

  // ── Career filter ──
  search: "",
  category: "全部",
  subCategory: "全部",
  careerName: initialCareer,
  timeRange: "ALL",
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setSubCategory: (subCategory) => set({ subCategory }),
  setCareerName: (careerName) => set({ careerName }),
  setTimeRange: (timeRange) => set({ timeRange }),
  selectCareer: (careerName) => set({ careerName, view: "career" }),

  // ── Company ──
  companyName: initialCompany,
  setCompanyName: (companyName) => set({ companyName }),
}));

export default useAppStore;
