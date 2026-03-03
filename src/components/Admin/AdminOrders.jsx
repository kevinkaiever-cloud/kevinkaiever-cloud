import { useEffect, useState } from "react";

const STORAGE_KEY = "ckl_admin_token";

export default function AdminOrders() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchOrders() {
    if (!token) {
      setError("请输入后台令牌");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-token": token },
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload?.error || "加载失败");
        return;
      }
      setOrders(payload.orders || []);
      localStorage.setItem(STORAGE_KEY, token);
    } catch {
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, []);

  return (
    <section className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-title">订单管理</div>
          <div className="admin-subtitle">查看最新支付订单与用户信息</div>
        </div>
        <div className="admin-actions">
          <input
            className="admin-input"
            placeholder="输入 ADMIN_TOKEN"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button className="admin-btn" onClick={fetchOrders} disabled={loading}>
            {loading ? "加载中..." : "刷新"}
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-table">
        <div className="admin-row admin-row-head">
          <div>订单号</div>
          <div>金额</div>
          <div>状态</div>
          <div>职业</div>
          <div>用户</div>
          <div>渠道</div>
          <div>创建时间</div>
        </div>
        {orders.length === 0 && !loading && (
          <div className="admin-empty">暂无订单</div>
        )}
        {orders.map((order) => (
          <div className="admin-row" key={order.order_id}>
            <div className="admin-cell">{order.order_id}</div>
            <div className="admin-cell">¥{(order.amount / 100).toFixed(2)}</div>
            <div className={`admin-cell admin-status admin-status-${order.status}`}>
              {order.status}
            </div>
            <div className="admin-cell">{order.career_name || "-"}</div>
            <div className="admin-cell">
              {order.phone || order.wechat_id || "-"}
            </div>
            <div className="admin-cell">{order.provider}</div>
            <div className="admin-cell">{order.created_at}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
