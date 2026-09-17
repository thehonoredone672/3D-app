function ErrorMessage({ message = "Something went wrong." }) {
  return <p className="state-message state-message-error">{message}</p>;
}

export default ErrorMessage;
