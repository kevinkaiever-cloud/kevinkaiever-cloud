import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep a readable error in the console for debugging.
    console.error("App render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e2e8f0",
          background: "#0f172a",
          fontFamily: "system-ui, 'Segoe UI', Arial, sans-serif",
        }}>
          <div style={{ maxWidth: 680, padding: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>页面渲染出错</div>
            <div style={{ color: "#94a3b8", marginBottom: 12 }}>
              请打开控制台查看详细错误信息，然后发给我。
            </div>
            <pre style={{
              whiteSpace: "pre-wrap",
              background: "#111827",
              padding: 12,
              borderRadius: 6,
              border: "1px solid #1f2937",
              color: "#fca5a5",
            }}>
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
