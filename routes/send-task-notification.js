app.post('/assign-task', async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ error: 'Title and userId required' });
    }

    const taskRef = db.collection('tasks').doc();
    await taskRef.set({
      title,
      description: description || '',
      assignedTo: userId,
      status: 'Pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const fcmToken = userDoc.data().fcmToken;
      if (fcmToken) {
        await admin.messaging().send({
          notification: {
            title: 'New Task Assigned',
            body: `Task: ${title}`,
          },
          token: fcmToken,
        });
      }
    }

    return res.status(200).json({ message: 'Task assigned successfully' });
  } catch (error) {
    console.error('Assign Task Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
