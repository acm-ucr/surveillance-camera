"use client";

import { DetectionPayload, surveillanceConfig } from "@/config/surveillance";

type YOLOStreamProps = {
  connected: boolean;
  latest: DetectionPayload | null;
};

export default function YOLOStream({ connected, latest }: YOLOStreamProps) {
  const counts =
    latest?.detections.reduce<Record<string, number>>((acc, det) => {
      acc[det.label] = (acc[det.label] ?? 0) + 1;
      return acc;
    }, {}) ?? {};

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Live Detections
        </h2>
        <span
          className={`inline-flex shrink-0 items-center gap-1 text-xs ${
            connected ? "text-green-600" : "text-amber-600"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              connected ? "bg-green-500" : "animate-pulse bg-amber-500"
            }`}
          />
          {connected ? "MQTT connected" : "Connecting..."}
        </span>
      </div>

      {latest ? (
        latest.count > 0 ? (
          <div className="space-y-1 text-sm">
            {Object.entries(counts).map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-gray-100 py-1"
              >
                <span>{label}</span>
                <span className="font-mono text-gray-600">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-gray-500">No objects in frame.</p>
        )
      ) : (
        <p className="text-sm italic text-gray-500">
          {connected
            ? `Listening on ${surveillanceConfig.mqttTopic} — waiting for CV server...`
            : "Connecting to MQTT..."}
        </p>
      )}
    </div>
  );
}
