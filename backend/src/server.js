import "dotenv/config";
import fs from "fs";
import http from "http";
import https from "https";
import app from "./app.js";

const PORT = process.env.PORT || 4000;
const { SSL_KEY_PATH, SSL_CERT_PATH } = process.env;

const useHttps = SSL_KEY_PATH && SSL_CERT_PATH && fs.existsSync(SSL_KEY_PATH) && fs.existsSync(SSL_CERT_PATH);

const server = useHttps
  ? https.createServer(
      { key: fs.readFileSync(SSL_KEY_PATH), cert: fs.readFileSync(SSL_CERT_PATH) },
      app
    )
  : http.createServer(app);

server.listen(PORT, () => {
  const protocol = useHttps ? "https" : "http";
  console.log(`PropView API listening on ${protocol}://localhost:${PORT}`);
});
