"use client";

import Image from "next/image";
import gearIcon from "../../public/gear-icon.svg";
import YOLOStream from "@/components/YOLOStream";
import useMQTT from "@/hooks/useMQTT";

const Home = () => {
  // Hook fetches real-time YOLO detection messages from the MQTT broker
  const messages = useMQTT("yolo/detections");

  /**
   * Helper function to safely render MQTT messages.
   * If the message is a JSON object, it extracts the text or stringifies it.
   */
const renderMessage = (msg: any) => {
  if (typeof msg === "object" && msg !== null) {
    // If the message has our specific YOLO schema
    if (msg.detections && Array.isArray(msg.detections)) {
      if (msg.detections.length === 0) return "No objects detected";
      
      return msg.detections
        .map((d: any) => `${d.label} (${(d.confidence * 100).toFixed(1)}%)`)
        .join(", ");
    }
    return JSON.stringify(msg);
  }
  return String(msg);
};

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-black">
      {/* Header Bar */}
      <header className="flex items-center justify-between bg-[#ced4da] px-6 py-4">
        <h1 className="text-3xl text-gray-900 font-bold">
          ACM Forge Surveillance Camera Spring 2026 Team 1
        </h1>

        <div className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
          <Image src={gearIcon} alt="Settings" className="h-full w-full" />
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="grid flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-3">
        
        {/* Video Stream Panel (2/3 width on desktop) */}
        <div className="col-span-2 min-h-[600px] rounded-md border border-gray-400 bg-white shadow-sm overflow-hidden flex items-center justify-center">
          <img
            src="http://10.13.244.89:5000/video_feed"
            alt="Live Stream"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Sidebar: YOLO Stream Components & Live MQTT Logs (1/3 width) */}
        <div className="flex min-h-[600px] flex-col gap-3 rounded-md border border-gray-400 bg-white p-4 shadow-sm overflow-y-auto">
          <YOLOStream />

          {/* MQTT Detections Stream Feed */}
          <div className="mt-4 flex-1 overflow-y-auto border-t border-gray-200 pt-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Live Detection Logs
            </h2>
            
            {messages && messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className="mb-2 rounded bg-gray-100 p-2 text-sm font-mono border-l-4 border-blue-500 text-gray-800"
                >
                  {renderMessage(msg)}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-amber-500 mr-2 mb-2"></span>
                <p className="text-gray-500 text-sm italic">
                  Waiting for incoming MQTT data stream...
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Home;
