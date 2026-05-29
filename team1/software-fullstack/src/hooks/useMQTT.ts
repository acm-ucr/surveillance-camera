"use client";

import { useEffect, useState } from "react";
import mqtt, { MqttClient } from "mqtt";

// Pointing to your verified backend IP address on the broker's WebSocket port
const BROKER_URL = "ws://10.13.244.89:9001";

export default function useMQTT(topic: string): string[] {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    let client: MqttClient;

    console.log(`Attempting to connect to MQTT broker at: ${BROKER_URL}`);
    client = mqtt.connect(BROKER_URL);

    // Triggered when successfully connected to the broker via WebSockets
    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      client.subscribe(topic, (err) => {
        if (err) {
          console.error("Subscription error:", err);
        } else {
          console.log(`Successfully subscribed to topic: ${topic}`);
        }
      });
    });

    // Triggered whenever a new detection payload arrives
    client.on("message", (_topic, payload) => {
      const msg = payload.toString();

      setMessages((prev) => {
        const updated = [...prev, msg];
        // YOLO outputs frames very quickly. Keep only the 10 freshest logs
        // to prevent your Next.js application from leaking memory and crashing.
        if (updated.length > 10) {
          return updated.slice(updated.length - 10);
        }
        return updated;
      });
    });

    // Handle and log network connection drops or configuration faults
    client.on("error", (err) => {
      console.error("MQTT connection error:", err);
    });

    // Clean up the websocket channel when the component unmounts
    return () => {
      if (client) {
        console.log(`Disconnecting from MQTT topic: ${topic}`);
        client.end();
      }
    };
  }, [topic]);

  return messages;
}