import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CAREER_DB, CAREER_GROUPS } from "../../data/careers";
import { CATEGORY_TAGS, resolveSubcategory } from "../../utils/constants";
import useAppStore from "../../store/useAppStore";

export default function Sidebar() {
  const navigate = useNavigate();
  const search = useAppStore((s) => s.search);
  const setSearch = useAppStore((s) => s.setSearch);
  const category = useAppStore((s) => s.category);
  const setCategory = useAppStore((s) => s.setCategory);
  const subCategory = useAppStore((s) => s.subCategory);
  const setSubCategory = useAppStore((s) => s.setSubCategory);
  const careerName = useAppStore((s) => s.careerName);
  const setCareerName = useAppStore((s) => s.setCareerName);
  const isOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const onClose = () => setSidebarOpen(false);
  const categoryCounts = useMemo(() => {
    const counts = { 全部: CAREER_DB.length };
    Object.keys(CAREER_GROUPS).forEach((key) => {
      counts[key] = CAREER_GROUPS[key]?.length || 0;
    });
    return counts;
  }, []);

  const subCategoryOptions = useMemo(() => {
    if (category === "全部") return ["全部"];
    const items = CAREER_DB
      .filter((item) => item.category === category)
      .map((item) => resolveSubcategory(item));
    const uniq = Array.from(new Set(items));
    return ["全部", ...uniq];
  }, [category]);

  const filteredCareers = useMemo(() => {
    const keyword = search.trim();
    return CAREER_DB.filter((item) => {
      if (category !== "全部" && item.category !== category) return false;
      if (subCategory !== "全部" && resolveSubcategory(item) !== subCategory) return false;
      if (!keyword) return true;
      return item.career_name.includes(keyword);
    });
  }, [search, category, subCategory]);


  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "sidebar-overlay-visible" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="panel-title">职业数据库</div>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>
        <div className="panel-subtitle">{CAREER_DB.length}+ 职业趋势样本 · 模糊搜索</div>
        <input
          className="search-input"
          placeholder="搜索职业：厨师 / 银行 / 摄影..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="panel-title panel-title-sm">职业分类</div>
        <div className="filter-row">
          {CATEGORY_TAGS.map((item) => (
            <button
              key={item.key}
              className={`pill ${category === item.key ? "pill-active" : ""}`}
              onClick={() => { setCategory(item.key); setSubCategory("全部"); }}
            >
              <span className="pill-icon">{item.icon}</span>
              <span>{item.label}</span>
              <span className="pill-count">{categoryCounts[item.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {category !== "全部" && (
          <>
            <div className="panel-title panel-title-sm">细分方向</div>
            <div className="filter-row">
              {subCategoryOptions.map((item) => (
                <button
                  key={item}
                  className={`pill ${subCategory === item ? "pill-active" : ""}`}
                  onClick={() => setSubCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="panel-title panel-title-sm">
          职位列表
          <span className="career-count">{filteredCareers.length}</span>
        </div>
        <div className="career-list">
          {filteredCareers.map((item) => (
            <button
              key={item.career_name}
              className={`career-item ${careerName === item.career_name ? "career-item-active" : ""}`}
              onClick={() => {
                setCareerName(item.career_name);
                navigate(`/career/${encodeURIComponent(item.career_name)}`);
                onClose();
              }}
            >
              <span className="career-name">{item.career_name}</span>
              <span className={`career-tag tag-${item.category}`}>{item.category}</span>
            </button>
          ))}
          {filteredCareers.length === 0 && (
            <div className="career-empty">未找到匹配的职业</div>
          )}
        </div>
      </aside>
    </>
  );
}
