const crypto = require("crypto");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      status: 0,
      message: "Method tidak diizinkan"
    });
  }

  try {
    const MERCHANT_ID = process.env.APIGAMES_MERCHANT_ID;
    const SECRET_KEY = process.env.APIGAMES_SECRET_KEY;

    if (!MERCHANT_ID || !SECRET_KEY) {
      return res.status(500).json({
        status: 0,
        message: "Merchant ID / Secret Key belum disetting"
      });
    }

    const { game_code, user_id } = req.body;

    if (!game_code || !user_id) {
      return res.status(400).json({
        status: 0,
        message: "game_code dan user_id wajib diisi"
      });
    }

    const allowedGames = ["mobilelegend", "freefire"];

    if (!allowedGames.includes(game_code)) {
      return res.status(400).json({
        status: 0,
        message: "Game belum didukung"
      });
    }

    const signature = crypto
      .createHash("md5")
      .update(MERCHANT_ID + SECRET_KEY)
      .digest("hex");

    const url =
      `https://v1.apigames.id/merchant/${MERCHANT_ID}/cek-username/${game_code}` +
      `?user_id=${encodeURIComponent(user_id)}` +
      `&signature=${signature}`;

    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 0,
      message: "Server error saat cek akun"
    });
  }
};
