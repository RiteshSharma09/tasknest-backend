import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";

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

    // TODO: Add your Firebase or database logic here
    // Example placeholder:
    // await firestore.collection("tasks").add({
    //   taskTitle,
    //   taskDescription,
    //   userId,
    //   status: "pending",
    //   createdAt: new Date(),
    // });

    console.log(`Task assigned: ${taskTitle} -> User: ${userId}`);

    // Optionally, you can send a push notification after assigning
    // await axios.post(`${BACKEND_URL}/send-notification`, {
    //   token: userPushToken,
    //   title: "New Task Assigned",
    //   body: taskTitle,
    // });

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
