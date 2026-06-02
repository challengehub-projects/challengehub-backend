const axios = require("axios");
const admin = require("firebase-admin");

// INIT PAYMENT
exports.initializePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    console.log(email, amount);

    const payload = {
      "email": email,
      "amount": amount * 100, // convert Naira -> Kobo ONCE
      "callback_url": "http://localhost:5173/verify",
    }

    console.log(process.env.PAYSTACK_SECRET_KEY);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",

      payload,

      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(payload.callback_url)

    return res.json({
      authorization_url:
        response.data.data.authorization_url,
      reference:
        response.data.data.reference,
      response: response.data,
    });
  } catch (error) {
    console.error(
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Payment initialization failed",
    });
  }
};


// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const { reference, uid } = req.body;

    console.log("Verifying payment for reference:", reference, "and user ID:", uid);

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const payment =
      response.data.data;

    console.log(
      "Paystack Status:",
      payment.status
    );

    if (
      payment.status ===
      "success"
    ) {
      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .update({
          paymentStatus: "paid",
          paymentReference:
            reference,
        });

      return res.json({
        success: true,
        status: "success",
      });
    }

    await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .update({
        paymentStatus: "unpaid",
        paymentReference:
          reference,
      });

    return res.json({
      success: false,
      status:
        payment.status,
    });
  } catch (error) {
    console.error(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      error:
        "Verification failed",
    });
  }
};