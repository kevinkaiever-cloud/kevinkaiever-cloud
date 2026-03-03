import { useEffect, useState } from "react";

const STORAGE_KEY = "ckl_auth_token";

function safeGet(key) {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, val); } catch { /* private mode */ }
}

export default function PricingModal({ onClose, trigger = "ai", careerName = "" }) {
  const triggerText = {
    ai: "AI职业顾问深度分析",
    report: "完整职业K线报告",
    destiny: "天赋×趋势深度匹配",
    compare: "多维度职业对比报告",
  }[trigger] || "高级功能";

  const [phone, setPhone] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [authToken, setAuthToken] = useState(() => safeGet(STORAGE_KEY) || "");

  useEffect(() => {
    if (!authToken) return;
    fetch("/api/me", { headers: { Authorization: `Bearer ${authToken}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload?.user) {
          setUser(payload.user);
        }
      })
      .catch(() => {});
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    fetch(`/api/entitlements?career=${encodeURIComponent(careerName || "")}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload) {
          setEntitlements(payload);
        }
      })
      .catch(() => {});
  }, [authToken, careerName]);

  async function handlePhoneLogin() {
    const value = phone.trim();
    setAuthError("");
    if (!value) {
      setAuthError("请输入手机号");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: value }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setAuthError("手机号格式有误");
        return;
      }
      safeSet(STORAGE_KEY, payload.token);
      setAuthToken(payload.token);
      setUser(payload.user);
      refreshEntitlements(payload.token);
    } catch {
      setAuthError("登录失败，请稍后重试");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleWechatLogin() {
    const value = wechatId.trim();
    setAuthError("");
    if (!value) {
      setAuthError("请输入微信号");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/wechat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wechatId: value }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setAuthError("微信号格式有误");
        return;
      }
      safeSet(STORAGE_KEY, payload.token);
      setAuthToken(payload.token);
      setUser(payload.user);
      refreshEntitlements(payload.token);
    } catch {
      setAuthError("登录失败，请稍后重试");
    } finally {
      setAuthLoading(false);
    }
  }

  async function refreshEntitlements(nextToken) {
    const activeToken = nextToken || safeGet(STORAGE_KEY) || "";
    if (!activeToken) return;
    try {
      const res = await fetch(`/api/entitlements?career=${encodeURIComponent(careerName || "")}`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const payload = await res.json();
        setEntitlements(payload);
      }
    } catch {
      // ignore
    }
  }

  async function handlePurchaseSingleReport() {
    const activeToken = safeGet(STORAGE_KEY) || "";
    if (!activeToken) {
      setAuthError("请先绑定手机号或微信号");
      return;
    }
    setPurchaseLoading(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ product: "single_report", careerName }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setAuthError("下单失败，请稍后重试");
        return;
      }
      setOrder(payload);
      setOrderStatus("pending");
      if (payload.paymentUrl) {
        window.open(payload.paymentUrl, "_blank", "noopener");
      }
    } catch {
      setAuthError("下单失败，请稍后重试");
    } finally {
      setPurchaseLoading(false);
    }
  }

  async function handleConfirmPaid() {
    if (!order?.orderId) return;
    try {
      await fetch("/api/payments/mock/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });
      await refreshEntitlements();
    } catch {
      // ignore
    }
  }

  const hasSingleReport = Boolean(entitlements?.singleReport);

  useEffect(() => {
    if (!order?.orderId) return;
    if (!authToken) return;
    let alive = true;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.orderId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) return;
        const payload = await res.json();
        if (!alive) return;
        const status = payload?.order?.status;
        if (status) {
          setOrderStatus(status);
          if (status === "paid") {
            await refreshEntitlements(authToken);
            clearInterval(timer);
          }
        }
      } catch {
        // ignore
      }
    }, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [order?.orderId, authToken]);

  return (
    <div className="pricing-overlay" onClick={onClose}>
      <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pricing-close" onClick={onClose}>✕</button>

        <div className="pricing-header">
          <div className="pricing-lock">🔒</div>
          <h2 className="pricing-title">解锁{triggerText}</h2>
          <p className="pricing-desc">选择适合你的方案，用数据+AI做出更好的职业决策</p>
        </div>

        <div className="pricing-plans">
          {/* ── Free ── */}
          <div className="pricing-plan">
            <div className="pricing-plan-name">免费版</div>
            <div className="pricing-plan-price">
              <span className="pricing-amount">¥0</span>
            </div>
            <ul className="pricing-features">
              <li className="pricing-feature">✓ 浏览所有职业K线</li>
              <li className="pricing-feature">✓ 基础职业对比</li>
              <li className="pricing-feature">✓ 基础分析报告</li>
              <li className="pricing-feature pricing-feature-disabled">✗ AI深度对话（3次/天）</li>
              <li className="pricing-feature pricing-feature-disabled">✗ 完整报告下载</li>
              <li className="pricing-feature pricing-feature-disabled">✗ 天赋×趋势分析</li>
            </ul>
            <div className="pricing-plan-current">当前方案</div>
          </div>

          {/* ── Pro ── */}
          <div className="pricing-plan pricing-plan-popular">
            <div className="pricing-plan-badge">最受欢迎</div>
            <div className="pricing-plan-name">专业版</div>
            <div className="pricing-plan-price">
              <span className="pricing-amount">¥49</span>
              <span className="pricing-period">/月</span>
            </div>
            <ul className="pricing-features">
              <li className="pricing-feature">✓ 全部免费版功能</li>
              <li className="pricing-feature pricing-feature-highlight">✓ 无限AI职业顾问对话</li>
              <li className="pricing-feature pricing-feature-highlight">✓ 个人职业画像报告</li>
              <li className="pricing-feature pricing-feature-highlight">✓ PDF报告导出</li>
              <li className="pricing-feature pricing-feature-highlight">✓ 天赋×趋势分析</li>
              <li className="pricing-feature">✓ 优先使用新功能</li>
            </ul>
            <button className="pricing-btn pricing-btn-primary" disabled>
              即将上线
            </button>
          </div>

          {/* ── Single report ── */}
          <div className="pricing-plan">
            <div className="pricing-plan-name">单次报告</div>
            <div className="pricing-plan-price">
              <span className="pricing-amount">¥9.9</span>
              <span className="pricing-period">/次</span>
            </div>
            <ul className="pricing-features">
              <li className="pricing-feature">✓ 1份AI深度分析报告</li>
              <li className="pricing-feature">✓ 含PDF下载</li>
              <li className="pricing-feature">✓ 职业画像雷达图</li>
              <li className="pricing-feature">✓ 未来5年预测</li>
              <li className="pricing-feature pricing-feature-disabled">✗ AI对话功能</li>
              <li className="pricing-feature pricing-feature-disabled">✗ 天赋×趋势分析</li>
            </ul>
            {hasSingleReport ? (
              <div className="pricing-plan-current">已解锁单次报告</div>
            ) : (
              <button className="pricing-btn" onClick={handlePurchaseSingleReport} disabled={purchaseLoading}>
                {purchaseLoading ? "创建订单中..." : "购买单次报告"}
              </button>
            )}
            {order?.orderId && (
              <div className="pricing-order-meta">
                订单号：{order.orderId} · 状态：{orderStatus || "pending"}
              </div>
            )}
            {order?.provider === "mock" && !hasSingleReport && (
              <button className="pricing-btn pricing-btn-secondary" onClick={handleConfirmPaid}>
                我已完成支付
              </button>
            )}
            {order?.provider && order?.provider !== "mock" && !hasSingleReport && (
              <div className="pricing-order-hint">
                已打开支付页面，支付完成后系统将自动更新状态。
              </div>
            )}
          </div>
        </div>

        <div className="pricing-auth">
          <div className="pricing-auth-title">绑定账号（用于解锁付费权益）</div>
          <div className="pricing-auth-grid">
            <div className="pricing-auth-item">
              <label className="pricing-auth-label">手机号</label>
              <div className="pricing-auth-row">
                <input
                  className="pricing-auth-input"
                  placeholder="输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <button className="pricing-auth-btn" onClick={handlePhoneLogin} disabled={authLoading}>
                  绑定
                </button>
              </div>
            </div>
            <div className="pricing-auth-item">
              <label className="pricing-auth-label">微信号</label>
              <div className="pricing-auth-row">
                <input
                  className="pricing-auth-input"
                  placeholder="输入微信号"
                  value={wechatId}
                  onChange={(e) => setWechatId(e.target.value)}
                />
                <button className="pricing-auth-btn" onClick={handleWechatLogin} disabled={authLoading}>
                  绑定
                </button>
              </div>
            </div>
          </div>
          {user && (
            <div className="pricing-auth-status">
              已绑定：{user.phone ? `手机号 ${user.phone}` : ""}{user.phone && user.wechatId ? " / " : ""}{user.wechatId ? `微信 ${user.wechatId}` : ""}
            </div>
          )}
          {authError && <div className="pricing-auth-error">{authError}</div>}
        </div>

        <div className="pricing-footer">
          支持微信/支付宝 · 7天无理由退款 · 数据安全加密
        </div>
      </div>
    </div>
  );
}
