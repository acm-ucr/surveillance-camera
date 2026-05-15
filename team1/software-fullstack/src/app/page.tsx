"use client";

import Image from "next/image";
import gearIcon from "../../public/gear-icon.svg";
import YOLOStream from "@/components/YOLOStream";
import useMQTT from "@/hooks/useMQTT";

const Home = () => {
  const messages = useMQTT("yolo/detections");

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-black">
      <header className="flex items-center justify-between bg-[#ced4da] px-6 py-4">
        <h1 className="text-3xl text-gray-900">
          ACM Forge Surveillance Camera Spring 2026 Team 1
        </h1>

        <div className="h-10 w-10 cursor-pointer">
          <Image src={gearIcon} alt="Settings" className="h-full w-full" />
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-3">
        <div className="col-span-2 min-h-[600px] rounded-md border border-gray-400 bg-white shadow-sm">
          <img
            src="http://10.13.7.181:5000/videofeed"
            alt="Live Stream"
            style={{ width: "100%" }}
          />
        </div>

        <div className="flex min-h-[600px] flex-col gap-3 rounded-md border border-gray-400 bg-white p-4 shadow-sm overflow-y-auto">
          <YOLOStream />

          <div className="mt-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className="mb-2 rounded bg-gray-100 p-2 text-sm"
              >
                {msg}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;