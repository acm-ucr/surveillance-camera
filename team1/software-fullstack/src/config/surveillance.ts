export type Detection = {
  label: string;
  confidence: number;
};

export type DetectionPayload = {
  count: number;
  detections: Detection[];
};

const cvHost = process.env.NEXT_PUBLIC_CV_HOST ?? "10.13.244.89";
const cvPort = process.env.NEXT_PUBLIC_CV_PORT ?? "5000";

export const surveillanceConfig = {
  videoFeedUrl: `http://${cvHost}:${cvPort}/video_feed`,
  mqttBrokerUrl:
    process.env.NEXT_PUBLIC_MQTT_BROKER ?? "ws://broker.emqx.io:8000/mqtt",
  mqttTopic: process.env.NEXT_PUBLIC_MQTT_TOPIC ?? "yolo/detections",
  maxLogEntries: 50,
} as const;

export function formatDetectionPayload(payload: DetectionPayload): string {
  if (payload.count === 0) {
    return "No detections";
  }

  return payload.detections
    .map((det) => `${det.label} (${(det.confidence * 100).toFixed(1)}%)`)
    .join(", ");
}
