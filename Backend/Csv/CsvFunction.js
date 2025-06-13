const fs = require("fs");
const csv = require("csv-parser");
require("../config/db");
const Quiz = require("../Models/Quiz");

const path = "D:/Game/Backend/Csv/QuizzyCSV.csv";

async function readCSVAndSaveToDB(filePath) {
  try {
    const questions = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          if (row["Question"] && row["Correct Answer"]) {
            questions.push({
              question: row["Question"],
              correctAnswer: row["Correct Answer"],
              options: [
                row["Option A"],
                row["Option B"],
                row["Option C"],
                row["Option D"]
              ]
            });
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const quiz = new Quiz({
      title: "General Knowledge Quiz",
      entryFee: 10,
      rewardPerQuestion: 10,
      questions: questions
    });

    console.log("📦 Total Questions:", questions.length);
    console.log("🧾 First Question Sample:", questions[0]);

    await quiz.save();
    console.log("✅ Quiz with questions saved successfully");
  } catch (err) {
    console.error("❌ Error saving quiz:", err.message);
  }
}

readCSVAndSaveToDB(path);
