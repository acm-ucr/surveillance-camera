"use client";

import { useEffect, useState } from "react";
import mqtt, { MqttClient } from "mqtt";

const BROKER_URL = "ws://10.13.7.181:9001"; 
// Example Mosquitto websocket port

export default function useMQTT(topic: string) {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    let client: MqttClient;

    client = mqtt.connect(BROKER_URL);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      client.subscribe(topic, (err) => {
        if (err) {
          console.error("Subscription error:", err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });

    client.on("message", (_topic, payload) => {
      const msg = payload.toString();

      setMessages((prev) => [...prev, msg]);
    });

    client.on("error", (err) => {
      console.error("MQTT error:", err);
    });

    return () => {
      client.end();
    };
  }, [topic]);

  return messages;
}