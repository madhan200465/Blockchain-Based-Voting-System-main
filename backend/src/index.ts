import { createConnection } from "typeorm";
import app from "./server";
import "dotenv/config";

const port = Number(process.env.PORT) || 8000;

console.log("🚀 Starting backend initialization...");

createConnection()
  .then(async (connection) => {
    console.log("✔️  Database connected successfully.");
    app.listen(port, "0.0.0.0", () => {
      console.log(`
============================================================
🚀 SERVER IS READY AND LISTENING ON PORT ${port}
🏠 Local:    http://localhost:${port}
🌍 Network:  http://127.0.0.1:${port}
============================================================
      `);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed!");
    console.error("Details:", error.message || error);
    console.error("Please ensure that you have initialized the database or that the file is not locked.");
    process.exit(1);
  });
