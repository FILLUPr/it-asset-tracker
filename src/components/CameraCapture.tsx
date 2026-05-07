'use client';

import { useRef, useState, useCallback } from 'react';

interface Props {
  onCapture: (file: File, previewUrl: string) => void;
}

export default function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch {
      fileInputRef.current?.click();
    }
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      onCapture(file, url);
      const tracks = (video.srcObject as MediaStream)?.getTracks();
      tracks?.forEach((t) => t.stop());
      setStreaming(false);
    }, 'image/jpeg', 0.85);
  }, [onCapture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onCapture(file, url);
  };

  const reset = () => {
    setPreview(null);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
    }
    setStreaming(false);
  };

  if (preview) {
    return (
      <div className="space-y-4">
        <img src={preview} alt="preview" className="w-full rounded-lg border"
          style={{ borderColor: 'var(--border)' }} />
        <button onClick={reset} className="text-sm px-4 py-2 rounded-lg"
          style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
          ถ่ายใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <video ref={videoRef} playsInline muted
        className="w-full rounded-lg border"
        style={{
          borderColor: 'var(--border)',
          display: streaming ? 'block' : 'none',
          maxHeight: '400px',
          objectFit: 'cover',
        }}
      />
      <canvas ref={canvasRef} className="hidden" />
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleFileChange} />

      {!streaming && (
        <div className="flex gap-3">
          <button onClick={startCamera}
            className="flex-1 py-3 rounded-lg font-medium transition hover:opacity-90"
            style={{ background: 'var(--accent)', color: '#000' }}>
            เปิดกล้อง
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3 rounded-lg font-medium"
            style={{ background: 'var(--surface)', color: 'var(--text-primary)' }}>
            เลือกรูป
          </button>
        </div>
      )}

      {streaming && (
        <button onClick={capture}
          className="w-full py-4 rounded-lg font-bold text-lg transition hover:opacity-90"
          style={{ background: 'var(--accent)', color: '#000' }}>
          ถ่ายรูป
        </button>
      )}
    </div>
  );
}
