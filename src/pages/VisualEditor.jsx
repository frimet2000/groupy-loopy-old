import React from 'react';

export default function VisualEditor() {
  const editorUrl = "https://app.base44.com/apps/693c3ab4048a1e3a31fffd66/editor/preview";
  
  return (
    <div className="w-full h-[calc(100vh-64px)] bg-white">
      <iframe 
        src={editorUrl}
        className="w-full h-full border-none"
        title="Base44 Visual Editor"
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write"
      />
    </div>
  );
}
