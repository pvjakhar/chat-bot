import React, { useState, useEffect, useRef, useTransition } from "react";
import axios from "axios";
import "./ChatStyles.css";
import logo from "./assets/section31.png";
import ReactMarkdown from "react-markdown";
import { LuCircleUser } from "react-icons/lu";
import { FaTimes } from "react-icons/fa";
import { VscRobot } from "react-icons/vsc";
import remarkGfm from "remark-gfm";

export function Chatbot({ chatOpen, setChatOpen }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Welcome to alt.f. Ask me anything about our workspaces. 
I'm in beta, so forgive me if I fumble a little.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWrapperRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isPending, startTransition] = useTransition();

  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  // Add platform-specific class
  useEffect(() => {
    if (chatOpen && chatWrapperRef.current) {
      if (isIOS) chatWrapperRef.current.classList.add("ios");
      if (isAndroid) chatWrapperRef.current.classList.add("android");
    }
  }, [chatOpen]);

  // Lock initial height and keyboard handling
  useEffect(() => {
    const setViewportHeight = () => {
      const initialHeight = window.innerHeight;
      document.documentElement.style.setProperty(
        "--chat-height",
        `${initialHeight}px`
      );
      document.documentElement.style.setProperty(
        "--vh",
        `${initialHeight * 0.01}px`
      );
    };

    setViewportHeight();

    const handleViewportResize = () => {
      const keyboardHeight =
        window.innerHeight -
        (window.visualViewport?.height || window.innerHeight);

      document.documentElement.style.setProperty(
        "--keyboard-height",
        `${Math.max(keyboardHeight, 0)}px`
      );
      document.documentElement.style.setProperty(
        "--keyboard-open",
        keyboardHeight > 150 ? "1" : "0"
      );
      setViewportHeight();
    };

    window.addEventListener("resize", handleViewportResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
    }

    return () => {
      window.removeEventListener("resize", handleViewportResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportResize
        );
      }
    };
  }, []);

  // Lock/unlock body scroll
  useEffect(() => {
    if (chatOpen) {
      document.body.classList.add("chatbot-open");
    } else {
      document.body.classList.remove("chatbot-open");
    }
  }, [chatOpen]);

  // Scroll and focus handling on input
  useEffect(() => {
    const handleFocus = () => {
      if (window.innerWidth <= 750) {
        document.documentElement.style.setProperty("--input-focused", "1");
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 400);
      }
    };

    const handleBlur = () => {
      document.documentElement.style.setProperty("--input-focused", "0");
      document.documentElement.style.setProperty("--keyboard-open", "0");
      document.documentElement.style.setProperty("--keyboard-height", "0px");
    };

    const inputEl = inputRef.current;
    if (inputEl) {
      inputEl.addEventListener("focus", handleFocus);
      inputEl.addEventListener("blur", handleBlur);
      return () => {
        inputEl.removeEventListener("focus", handleFocus);
        inputEl.removeEventListener("blur", handleBlur);
      };
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Hide tooltip after 10s
  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 10000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    startTransition(() => {
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    });

    const tempInput = input;
    setInput("");

    setIsLoading(true);

    const payload = { message: trimmed };
    if (localStorage.getItem("profileComplete") === "true") {
      payload.skipProfile = true;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/chat",
        payload
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
      if (data.content.match(/All set,|How can I help/)) {
        localStorage.setItem("profileComplete", "true");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Oops! There was an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      const currentInput = inputRef.current;
      if (currentInput) {
        currentInput.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Icon */}
      {!chatOpen && (
        <div
          className="chatbot-icon-container"
          onClick={() => setChatOpen(true)}
        >
          {showTooltip && (
            <span className="chatbot-tooltip">Ask me anything about alt.f</span>
          )}
          <VscRobot className="chatbot-icon-bot" size={48} />
        </div>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <div className="chatbot-wrapper" ref={chatWrapperRef}>
          <header className="chatbot-header">
            <img src={logo} alt="alt.f logo" className="chatbot-header-icon" />
            <h2 className="chatbot-header-title">
              Rahi — Realtime alt.f Help Interface
            </h2>
            <FaTimes
              className="chatbot-close-icon"
              onClick={() => setChatOpen(false)}
            />
          </header>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-message-row chatbot-${m.role}`}>
                {m.role === "assistant" ? (
                  <img
                    src={logo}
                    alt="bot avatar"
                    className="chatbot-avatar-icon chatbot-avatar-assistant"
                  />
                ) : (
                  <LuCircleUser className="chatbot-avatar-icon chatbot-avatar-user" />
                )}
                <div className="chatbot-message-bubble">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message-row chatbot-assistant">
                <VscRobot className="chatbot-avatar-icon chatbot-avatar-assistant" />
                <div className="chatbot-message-bubble">
                  <div className="typing-indicator">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              className="chatbot-input-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message…"
              rows={1}
            />

            <button
              className="chatbot-input-button"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Embed in parent layout
function DemoLp() {
  const [chatOpen, setChatOpen] = useState(false);
  return <Chatbot chatOpen={chatOpen} setChatOpen={setChatOpen} />;
}

export default DemoLp;
