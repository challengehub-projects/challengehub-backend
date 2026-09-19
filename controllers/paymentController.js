const axios = require("axios");
const admin = require("firebase-admin");
const crypto = require("crypto"); // Built-in Node.js module

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

// PAYSTACK WEBHOOK
exports.paystackWebhook = async (req, res) => {
  try {
    // 1. Validate signature to ensure request came from Paystack
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.warn("Unauthorized webhook attempt caught.");
      return res.status(401).send("Invalid signature");
    }

    // 2. Acknowledge receipt of the webhook quickly (Paystack expects a 200 OK)
    res.status(200).send("Webhook received");

    // 3. Process the event payload safely
    const event = req.body;

    if (event.event === "charge.success") {
      const { reference, customer } = event.data;
      const userEmail = customer.email;

      console.log(`Webhook: Payment successful for ${userEmail} (Ref: ${reference})`);

      // 4. Find the user in Firestore using their email address
      const usersRef = admin.firestore().collection("users");
      const snapshot = await usersRef.where("email", "==", userEmail).limit(1).get();

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        
        await userDoc.ref.update({
          paymentStatus: "paid",
          paymentReference: reference,
        });
        
        console.log(`Webhook: Successfully updated Firestore for user UID: ${userDoc.id}`);
      } else {
        console.error(`Webhook Error: User with email ${userEmail} not found in Firestore.`);
      }
    }
  } catch (error) {
    console.error("Error handling Paystack webhook:", error.message);
    // Don't crash the server, just log the error since response was already sent
  }
};
