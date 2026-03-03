import { useState, useRef, useEffect } from "react";

const QUICK_PROMPTS = [
  "这个职业未来5年前景如何？",
  "银行柜员该不该转行到AI领域？",
  "我28岁，适合转行吗？",
  "这个职业的核心竞争力是什么？",
];

export default function AIChat({ isOpen, onClose, careerName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [careerName]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const token = localStorage.getItem("auth_token") || "";
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "请先在定价方案中登录/获取身份令牌后再使用 AI 顾问。" },
      ]);
      return;
    }
    const userMsg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          careerName,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "AI 服务暂时不可用，请稍后再试。" },
        ]);
        return;
      }
      if (data?.error === "rate_limited") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "今日免费次数已用完，升级 PRO 解锁无限对话。" },
        ]);
        return;
      }
      const assistantText = data.content
        ?.filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n") || "抱歉，暂时无法回答。请稍后再试。";

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "网络连接失败。请检查网络后重试，或者直接参考左侧的K线分析报告。" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <div className="ai-header-info">
          <span className="ai-header-icon">🧠</span>
          <div>
            <div className="ai-header-title">AI 职业顾问</div>
            <div className="ai-header-sub">正在分析：{careerName}</div>
          </div>
        </div>
        <button className="ai-close" onClick={onClose}>✕</button>
      </div>

      <div className="ai-messages">
        {messages.length === 0 && (
          <div className="ai-welcome">
            <div className="ai-welcome-icon">💬</div>
            <div className="ai-welcome-title">你好，我是AI职业顾问</div>
            <div className="ai-welcome-text">
              我正在分析 <strong>{careerName}</strong> 的趋势数据。你可以问我关于这个职业的任何问题，或者点击下面的快捷问题开始。
            </div>
            <div className="ai-quick-prompts">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="ai-quick-btn"
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ai-msg-${msg.role}`}>
            <div className="ai-msg-avatar">{msg.role === "user" ? "👤" : "🧠"}</div>
            <div className="ai-msg-content">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="ai-msg ai-msg-assistant">
            <div className="ai-msg-avatar">🧠</div>
            <div className="ai-msg-content ai-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-input-area">
        <textarea
          ref={inputRef}
          className="ai-input"
          placeholder="输入你的职业问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="ai-send"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
