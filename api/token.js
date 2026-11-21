const { RtcTokenBuilder, RtcRole } = require("agora-token");

module.exports = async (req, res) => {
  try {
    const channelName = req.query.channelName || req.body?.channelName;
    if (!channelName) {
      return res.status(400).json({ error: "channelName is required" });
    }

    
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    // 1 hour validity token for uid 0 (allows any user uid in channel)
    const expirationInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      0,
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
