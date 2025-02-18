const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyAT-0w15p-uUgO3liH1U1wI8Px3KsPoeP0");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

app.post('/api/generate-questions', async (req, res) => {
  const { examName,language, difficultyLevel } = req.body;
  // const apiKey = "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";

  if (!examName) {
    return res.status(400).send('Exam name is required');
  }

  try {
  //   const response = await axios.post(
  //     "https://openrouter.ai/api/v1/chat/completions",
  //     {
  //         model: "google/gemini-2.0-flash-lite-preview-02-05:free",
  //         messages: [
  //           {
  //             "role": "system",
  //             "content": `You are an AI quiz generator specializing in Indian government, banking, and private exams. Generate multiple-choice questions (MCQs) based on the user's request.

  //           Always return the response in the following strict JSON format:
  //           {
  //             "header": {
  //               "heading": "Exam Name, Language, Type",
  //               "desc": "Short description about the exam."
  //             },
  //             "questions": [
  //               {
  //                 "question": "<MCQ question in the requested language>",
  //                 "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  //                 "answer": "Correct option",
  //                 "explanation": "Short explanation for the answer."
  //               }
  //             ]
  //           }

  //           Rules:
  //           1. The response must always be valid JSON with the above structure.
  //           2. Use the exact key names: 'header', 'heading', 'desc', 'questions', 'question', 'options', 'answer', and 'explanation'.
  //           3. The 'header' object should include a meaningful 'heading' and a short 'desc' about the exam.
  //           4. Generate the requested number of MCQs in the requested language.
  //           5. The 'options' array must contain exactly 4 choices.
  //           6. The 'answer' field must exactly match one of the 'options'.
  //           7. Provide a concise and informative 'explanation'.
  //           `
  //           },            
  //           {
  //             "role": "user",
  //             "content": `Generate 10 multiple-choice questions for the ${examName} exam. The questions should be in ${language}. Provide 4 options for each question, include the correct answer, and a brief explanation in JSON format
  //             the level of questions should be ${difficultyLevel}.`
  //           }
  //           ],
  //     },
  //     {
  //         headers: {
  //             "Authorization": `Bearer ${apiKey}`,
  //             "Content-Type": "application/json",
  //         },
  //     }
  // );
    // Extract questions from the response
    // let rawData = response.data.choices[0].message.content;
    const prompt = `You are an AI quiz generator specializing in Indian government, banking, and private exams. Generate multiple-choice questions (MCQs) based on the user's request.
            Always return the response in the following strict JSON format:
            {
              "header": {
                "heading": "Exam Name, Language, Type",
                "desc": "Short description about the exam."
              },
              "questions": [
                {
                  "question": "<MCQ question in the requested language>",
                  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                  "answer": "Correct option",
                  "explanation": "Short explanation for the answer."
                }
              ]
            }

            Rules:
            1. The response must always be valid JSON with the above structure.
            2. Use the exact key names: 'header', 'heading', 'desc', 'questions', 'question', 'options', 'answer', and 'explanation'.
            3. The 'header' object should include a meaningful 'heading' and a short 'desc' about the exam.
            4. Generate the requested number of MCQs in the requested language.
            5. The 'options' array must contain exactly 4 choices.
            6. The 'answer' field must exactly match one of the 'options'.
            7. Provide a concise and informative 'explanation'.
            Generate 10 multiple-choice questions for the ${examName} exam. The questions should be in ${language}. Provide 4 options for each question, include the correct answer, and a brief explanation in JSON format
            the level of questions should be ${difficultyLevel}.
            ` 
    const result = await model.generateContent(prompt);
    // rawData = rawData.replace(/^```json/, "").replace(/```$/, "").trim();
      rawData = result.response.text();
      rawData = rawData.replace(/^```json/, "")
        let parsedData = JSON.parse(rawData);
        
        // Convert 'correct_answer' to 'answer' and wrap in an object
        let formattedData = {
            questions: parsedData?.questions?.map(q => ({
                question: q.question,
                options: q.options,
                answer: q.answer, // Renaming 'correct_answer' to 'answer'
                explanation: q.explanation
            })),
            heading: parsedData.header, // Add a heading
        };
        res.json(formattedData);
  } catch (error) {
    console.error('Error:', error);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      res.status(500).send('Error generating questions');
    }
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
