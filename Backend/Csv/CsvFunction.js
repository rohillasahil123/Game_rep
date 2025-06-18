const fs = require('fs').promises;
  require("../config/db");
const Quiz = require("../Models/QuizContest")

  const path = "D:/Game/Backend/Csv/QuizzyCSV.csv";

async function readCSVAndSaveToDB(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const lines = data.split('\n');
    const output = [];

    lines.forEach((line) => {
      const fields = line.split(',');
      output.push(fields);
    });

    for (let i = 0; i < output.length; i++) {  // Ensure we don't go out of bounds
      const row = output[i];
      const questionData = {
        question: row[0],
        correctAnswer: row[1],
        options: row.slice(2, 6),
        number: i + 1
      };

      const existingQuestion = await Quiz.findOne({ number: questionData.number });
      if (existingQuestion) {
        console.log(`Duplicate question number: ${questionData.number}, skipping...`);
        continue;
      }

      const question = new Quiz(questionData);

      try {
        await question.save();
        console.log(`Saved: ${question}`);
      } catch (err) {
        console.error("Error saving to DB:", err);
      }
    }
  } catch (err) {
    console.error("Error while reading the file:", err);
  }
}
(async () => {
  try {
    await readCSVAndSaveToDB(path);
  } catch (err) {
    console.error(err)
  }
})();
