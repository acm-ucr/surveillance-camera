"use client";

import Image from "next/image";
import gearIcon from "../../public/gear-icon.svg";
import YOLOStream from "@/components/YOLOStream";
import useMQTT from "@/hooks/useMQTT";
import {
  formatDetectionPayload,
  surveillanceConfig,
} from "@/config/surveillance";

const Home = () => {
  const { connected, latest, messages } = useMQTT();

  const renderMessage = (msg: string) => {
    try {
      const parsed = JSON.parse(msg);
      if (parsed.detections && Array.isArray(parsed.detections)) {
        return formatDetectionPayload(parsed);
      }
    } catch {
      // fall through
    }
    return msg;
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-black">
      <header className="flex items-center justify-between bg-[#ced4da] px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-900">
          ACM Forge Surveillance Camera Spring 2026 Team 1
        </h1>

        <div className="h-10 w-10 cursor-pointer transition-opacity hover:opacity-80">
          <Image src={gearIcon} alt="Settings" className="h-full w-full" />
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-3">
        <div className="col-span-2 flex min-h-[600px] items-center justify-center overflow-hidden rounded-md border border-gray-400 bg-white shadow-sm">
          <img
            src={surveillanceConfig.videoFeedUrl}
            alt="Live Stream"
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="flex min-h-[600px] flex-col gap-3 overflow-y-auto rounded-md border border-gray-400 bg-white p-4 shadow-sm">
          <YOLOStream connected={connected} latest={latest} />

          <div className="mt-4 flex-1 overflow-y-auto border-t border-gray-200 pt-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Live Detection Logs
            </h2>

            {messages.length > 0 ? (
              messages
                .slice()
                .reverse()
                .map((msg, index) => (
                  <div
                    key={index}
                    className="mb-2 rounded border-l-4 border-blue-500 bg-gray-100 p-2 font-mono text-sm text-gray-800"
                  >
                    {renderMessage(msg)}
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="mb-2 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                <p className="text-sm italic text-gray-500">
                  {connected
                    ? `Connected — waiting for CV to publish on ${surveillanceConfig.mqttTopic}`
                    : "Connecting to MQTT..."}
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
