'use client';
import { useEffect, useRef, useState } from 'react';
import mqtt from 'mqtt';

type Detection = {
  timestamp: string;
  class: string;
  confidence: number;
  box: { x1: number; y1: number; x2: number; y2: number };
};

const HOST = '192.168.1.42';
const BROKER = 'ws://broker.emqx.io:8083/mqtt';
const TOPIC = 'surveillance/yolo/detections';
const WINDOW_MS = 2000;

export default function YOLOStream() {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<Detection[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);

  // MQTT
  useEffect(() => {
    const client = mqtt.connect(BROKER);
    client.on('connect', () => client.subscribe(TOPIC));
    client.on('message', (_, msg) => {
      const d: Detection = JSON.parse(msg.toString());
      bufferRef.current = [...bufferRef.current, d];
      setDetections([...bufferRef.current]);
    });

    const timer = setInterval(() => {
      const cutoff = Date.now() - WINDOW_MS;
      bufferRef.current = bufferRef.current.filter(
        d => new Date(d.timestamp).getTime() > cutoff
      );
      setDetections([...bufferRef.current]);
    }, 50);

    return () => { client.end(); clearInterval(timer); };
  }, []);

  // Canvas
  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sx = img.clientWidth / (img.naturalWidth || 640);
    const sy = img.clientHeight / (img.naturalHeight || 480);
    detections.forEach(({ class: label, confidence, box }) => {
      const x = box.x1 * sx, y = box.y1 * sy;
      const w = (box.x2 - box.x1) * sx, h = (box.y2 - box.y1) * sy;
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#00ff00';
      ctx.font = '13px monospace';
      ctx.fillText(`${label} ${(confidence * 100).toFixed(0)}%`, x + 4, y - 6);
    });
  }, [detections]);

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <img ref={imgRef} src={`http://${HOST}:5000/video_feed`}
          style={{ display: 'block', width: '100%' }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0,
          width: '100%', height: '100%', pointerEvents: 'none' }} />
      </div>
      <div style={{ width: 160, fontSize: 13 }}>
        {Object.entries(
          detections.reduce((acc, d) => ({ ...acc, [d.class]: (acc[d.class] ?? 0) + 1 }), {} as Record<string, number>)
        ).map(([label, count]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0',
            borderBottom: '0.5px solid #eee' }}>
            <span>{label}</span><span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}