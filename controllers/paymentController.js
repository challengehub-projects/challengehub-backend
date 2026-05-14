const axios = require("axios");
const admin = require("firebase-admin");

// INIT PAYMENT
exports.initializePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack uses kobo
        callback_url: "http://localhost:5173/verify"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_kEY}`,
          "Content-Type": "application/json",
        },
      }
    );


    return res.json({
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment init failed" });
  }
};



// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const { reference, uid } = req.body;

    console.log(reference, uid);

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;


    if (data.status === "ongoing" || data.status === "false") {
      // ✅ Update Firebase
      await admin.firestore().collection("users").doc(uid).update({
        paymentStatus: "unpaid",
        paymentReference: reference,
      });

      return res.json({ success: true,  message: "Payment verified & updated" });
    }

    return res.status(400).json({ error: "Payment not successful" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Verification failed" });
  }
};