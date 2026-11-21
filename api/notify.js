const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL,
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { receiverUid, payload } = req.body;
    if (!receiverUid || !payload) {
      return res.status(400).json({ error: "receiverUid and payload required" });
    }

    const tokenSnap = await admin
      .database()
      .ref(`users/${receiverUid}/fcmToken`)
      .once("value");
    const fcmToken = tokenSnap.val();

    if (!fcmToken) {
      return res.status(200).json({ success: false, message: "No FCM token" });
    }

    const response = await admin.messaging().send({
      token: fcmToken,
      android: { priority: "high" },
      data: payload,
    });

    return res.status(200).json({ success: true, messageId: response });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
