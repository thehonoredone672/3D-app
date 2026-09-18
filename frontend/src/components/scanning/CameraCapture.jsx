import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import "./CameraCapture.css";

const MIN_CAPTURE_BYTES = 5 * 1024;
const JPEG_QUALITY = 0.85;

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
      canvas.getContext("2d").drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Capture failed. Please try again.");
            return;
          }
          if (blob.size < MIN_CAPTURE_BYTES) {
            setError("That capture looked empty. Point the camera at the room and try again.");
            return;
          }
          setError(null);
          onCapture(blob, { width, height });
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
              <p>Camera access is needed to scan this property.</p>
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
                Camera access is required for mobile scanning.
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
