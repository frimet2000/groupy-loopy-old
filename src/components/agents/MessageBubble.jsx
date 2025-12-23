import React from "react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-1`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm border ${
          isUser
            ? "bg-emerald-600 text-white border-emerald-700"
            : "bg-white text-gray-800 border-gray-200"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
            {message.content || ""}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}