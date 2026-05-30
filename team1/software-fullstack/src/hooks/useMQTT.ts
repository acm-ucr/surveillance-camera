"use client";

import { useEffect, useState } from "react";
import mqtt from "mqtt";
import {
  DetectionPayload,
  surveillanceConfig,
} from "@/config/surveillance";

type UseMQTTReturn = {
  connected: boolean;
  latest: DetectionPayload | null;
  messages: string[];
};

function parsePayload(raw: string): DetectionPayload | null {
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data.detections)) {
      return null;
    }

    return {
      count: typeof data.count === "number" ? data.count : data.detections.length,
      detections: data.detections.map(
        (det: { label?: string; confidence?: number }) => ({
          label: String(det.label ?? "unknown"),
          confidence: Number(det.confidence ?? 0),
        }),
      ),
    };
  } catch {
    return null;
  }
}

export default function useMQTT(): UseMQTTReturn {
  const [connected, setConnected] = useState(false);
  const [latest, setLatest] = useState<DetectionPayload | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const { mqttBrokerUrl, mqttTopic, maxLogEntries } = surveillanceConfig;

    console.log(`Connecting to MQTT broker at ${mqttBrokerUrl}`);
    const client = mqtt.connect(mqttBrokerUrl, {
      reconnectPeriod: 3000,
      connectTimeout: 10000,
    });

    client.on("connect", () => {
      setConnected(true);
      console.log("Connected to MQTT broker");

      client.subscribe(mqttTopic, (err) => {
        if (err) {
          console.error("Subscription error:", err);
        } else {
          console.log(`Successfully subscribed to topic: ${mqttTopic}`);
        }
      });
    });

    client.on("message", (_topic, payload) => {
      const msg = payload.toString();
      const parsed = parsePayload(msg);

      console.log("MQTT message received:", msg);

      if (parsed) {
        setLatest(parsed);
      }

      setMessages((prev) => [...prev, msg].slice(-maxLogEntries));
    });

    client.on("error", (err) => {
      setConnected(false);
      console.error("MQTT connection error:", err);
    });

    client.on("close", () => {
      setConnected(false);
    });

    return () => {
      console.log(`Disconnecting from MQTT topic: ${mqttTopic}`);
      client.end();
    };
  }, []);

  return { connected, latest, messages };
}
