import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import "./CameraCapture.css";

const MIN_CAPTURE_BYTES = 5 * 1024;
const JPEG_QUALITY = 0.85;
const DARK_LUMINANCE_THRESHOLD = 25;

function sampleAverageLuminance(canvas, ctx) {
  const { width, height } = canvas;
  const sampleSize = 40;
  const stepX = Math.max(1, Math.floor(width / sampleSize));
  const stepY = Math.max(1, Math.floor(height / sampleSize));
  const { data } = ctx.getImageData(0, 0, width, height);
  let total = 0;
  let count = 0;
  for (let y = 0; y < height; y += stepY) {
    for (let x = 0; x < width; x += stepX) {
      const i = (y * width + x) * 4;
      total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      count++;
    }
  }
  return count ? total / count : 255;
}

const CameraCapture = forwardRef(function CameraCapture({ onCapture, disabled }, ref) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [permission, setPermission] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => stopStream();
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function requestCamera() {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermission("unsupported");
      return;
    }

    setPermission("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermission("granted");
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "SecurityError") {
        setPermission("denied");
      } else if (err.name === "NotFoundError") {
        setPermission("unsupported");
      } else {
        setPermission("error");
        setError(err.message || "Could not access the camera.");
      }
    }
  }

  useImperativeHandle(ref, () => ({
    capture() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || permission !== "granted") return;

      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) return;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, width, height);

      const avgLuminance = sampleAverageLuminance(canvas, ctx);
      const tooDark = avgLuminance < DARK_LUMINANCE_THRESHOLD;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Capture failed. Please try again.");
            return;
          }
          if (blob.size < MIN_CAPTURE_BYTES) {
            setError("That capture looked empty. Point the camera at the object and try again.");
            return;
          }
          setError(null);
          onCapture(blob, { width, height, tooDark, avgLuminance });
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    },
  }));

  return (
    <div className="camera-capture">
      {permission === "granted" && (
        <video ref={videoRef} className="camera-capture-video" playsInline muted autoPlay />
      )}
      <canvas ref={canvasRef} className="camera-capture-canvas" />

      {permission !== "granted" && (
        <div className="camera-capture-overlay">
          {(permission === "idle" || permission === "requesting") && (
            <>
              <p>Camera access is needed to create a 3D view.</p>
              <button
                className="btn"
                onClick={requestCamera}
                disabled={permission === "requesting" || disabled}
              >
                {permission === "requesting" ? "Requesting..." : "Enable Camera"}
              </button>
            </>
          )}

          {permission === "denied" && (
            <>
              <p>
                Camera access is required to scan an object.
                <br />
                Please enable camera access in your browser settings.
              </p>
              <button className="btn" onClick={requestCamera}>
                Retry
              </button>
            </>
          )}

          {permission === "unsupported" && (
            <p>
              No camera was found, or this browser doesn't support camera capture. Try a
              different device or browser.
            </p>
          )}

          {permission === "error" && (
            <>
              <p>{error || "Could not access the camera."}</p>
              <button className="btn" onClick={requestCamera}>
                Retry
              </button>
            </>
          )}
        </div>
      )}

      {permission === "granted" && error && <div className="camera-capture-warning">{error}</div>}
    </div>
  );
});

export default CameraCapture;
