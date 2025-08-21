import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// ----------------------
// Firebase Admin setup
// ----------------------
const serviceAccountPath = path.resolve("./serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----------------------
// Expo push endpoint
// ----------------------
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// ----------------------
// /send-notification route
// ----------------------
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

// ----------------------
// /assign-task route
// ----------------------
app.post("/assign-task", async (req, res) => {
  try {
    const { taskTitle, taskDescription, userId } = req.body;

    if (!taskTitle || !taskDescription || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Firestore se user push token get karo
    const userDoc = await admin.firestore().collection("users").doc(userId).get();
    const userPushToken = userDoc.exists ? userDoc.data().expoPushToken : null;

    console.log(`Task assigned: ${taskTitle} -> User: ${userId}`);

    if (userPushToken) {
      const expoResponse = await axios.post(EXPO_PUSH_URL, {
        to: userPushToken,
        sound: "default",
        title: "New Task Assigned",
        body: taskTitle,
      });
      console.log("✅ Notification sent:", expoResponse.data);
    } else {
      console.warn("⚠️ No push token for user:", userId);
    }

    // TODO: Firestore me task add karna agar chahte ho
    // await admin.firestore().collection("tasks").add({ taskTitle, taskDescription, userId, status: "Pending", createdAt: new Date() });

    res.status(200).json({ success: true, message: "Task assigned successfully" });
  } catch (err) {
    console.error("Assign task error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
