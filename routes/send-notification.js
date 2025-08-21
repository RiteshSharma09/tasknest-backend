app.post("/send-notification", async (req, res) => {
  try {
    const { token, title, body } = req.body;
    if (!token) return res.status(400).json({ error: "Missing push token" });

    const response = await axios.post(EXPO_PUSH_URL, { to: token, sound: "default", title, body });
    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error("Notification error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
