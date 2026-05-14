import { db } from "../config/firebase.js";

/* ✅ SAVE RESULT */
export const submitExam = async (req, res) => {
    try {
        const { name, email, score, total, timeUsed } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Missing fields" });
        }

         console.log(name, email, score, total, timeUsed); 

        const percent = Math.round((score / total) * 100);

        const docRef = await db.collection("results").add({
            name,
            email,
            score,
            total,
            percent,
            timeUsed,
            createdAt: new Date(),
        });

        res.json({ success: true, id: docRef.id });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

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
        console.log(err); // 👈 IMPORTANT
        res.status(500).json({ message: "Error fetching leaderboard" });
    }
};
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