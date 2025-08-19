// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Expo push endpoint
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// Notification API
app.post("/send-notification", async (req, res) => {
  try {
    const { token, title, body } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Missing push token" });
    }

    const response = await axios.post(EXPO_PUSH_URL, {
      to: token,
      sound: "default",
      title,
      body,
    });

    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error("Notification error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});
