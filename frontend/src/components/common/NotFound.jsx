import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="state-message">
      <p>Page not found.</p>
      <Link to="/">Back to home</Link>
    </div>
  );
}

export default NotFound;
