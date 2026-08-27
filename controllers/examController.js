import { db } from "../config/firebase.js";

/* ✅ SAVE RESULT */
export const submitExam = async (req, res) => {
    try {
        const { name, email, score, total, timeUsed } = req.body;

        console.log(name, email, score, total, timeUsed)

        if (!name || !email) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const percent = Math.round((score / total) * 100);

        // Find if this student already has a record in the database
        const userQuery = await db.collection("results").where("email", "==", email).limit(1).get();

        let docId;

        if (!userQuery.empty) {
            const existingDoc = userQuery.docs[0];
            const existingData = existingDoc.data();
            docId = existingDoc.id;

            // update score whether high or low.
            if (percent > existingData.percent || percent < existingData.percent || timeUsed > existingData.timeUsed || timeUsed < existingData.timeUsed) 
                {
                    await db.collection("results").doc(docId).update({
                        name,
                        score,
                        total,
                        percent,
                        timeUsed,
                        updatedAt: new Date(),
                    });
                }
            } else {
                // User doesn't exist, create a completely brand new record
                const docRef = await db.collection("results").add({
                    name,
                    email,
                    score,
                    total,
                    percent,
                    timeUsed,
                    createdAt: new Date(),
                });
                docId = docRef.id;
            }

            res.json({ success: true, id: docId });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    };

    /* ✅ GET LEADERBOARD */
    export const getScores = async (req, res) => {
        try {
            const snapshot = await db
                .collection("results")
                .orderBy("percent", "desc")
                .orderBy("timeUsed", "asc")
                .limit(50)
                .get();

            const data = snapshot.docs.map((doc, i) => ({
                id: doc.id,
                rank: i + 1,
                ...doc.data(),
            }));

            res.json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Error fetching leaderboard" });
        }
    };




/* const getScores = async (req, res) => {
    try {
        const snapshot = await db
            .collection("results")
            .orderBy("percent", "desc")
            .orderBy("timeUsed", "asc")
            .limit(50)
            .get();

        const data = snapshot.docs.map((doc, i) => ({
            id: doc.id,
            rank: i + 1,
            ...doc.data(),
        }));

        res.json(data);
    } catch (err) {
        console.log(err); // 👈 IMPORTANT
        res.status(500).json({ message: "Error fetching leaderboard" });
    }
}; */
/* export const getScores = async (req, res) => {
  try {
    const snapshot = await db
      .collection("results")
      .orderBy("percent", "desc")
      .orderBy("timeUsed", "asc")
      .limit(3)
      .get();

    const data = snapshot.docs.map((doc, i) => ({
      id: doc.id,
      rank: i + 1,
      ...doc.data(),
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
}
 */