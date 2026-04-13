import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT ?? 3000;

async function start() {
  await connectDB();   
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();