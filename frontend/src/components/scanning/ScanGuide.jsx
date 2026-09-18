const MIN_RECOMMENDED = 12;

function getGuideMessage(captureCount, target) {
  if (captureCount === 0) {
    return "Stand at one corner of the room and capture your first shot.";
  }
  if (captureCount < target * 0.3) {
    return "Point the camera at the walls and major surfaces.";
  }
  if (captureCount < target * 0.6) {
    return "Move slowly to the left, then capture the next section.";
  }
  if (captureCount < MIN_RECOMMENDED) {
    return "Keep going — continue capturing around the room.";
  }
  if (captureCount < target) {
    return "Looking good. Make sure all major surfaces have been captured.";
  }
  return "Great coverage. Tap Finish when you're done, or keep capturing.";
}

function ScanGuide({ captureCount, target }) {
  return <p className="scan-guide">{getGuideMessage(captureCount, target)}</p>;
}

export default ScanGuide;
export { MIN_RECOMMENDED };
