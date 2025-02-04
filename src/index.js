require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  GoogleAIFileManager,
  FileState,
} = require("@google/generative-ai/server");

const app = express();
const port = 7001;
const mediaPath = path.join(__dirname, "public");

// Secure API Key
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing API key. Set GEMINI_API_KEY in .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/public", express.static(mediaPath));

function fileToGenerativePart(filePath, mimeType) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }
  return {
    inlineData: {
      data: fs.readFileSync(filePath).toString("base64"),
      mimeType,
    },
  };
}

app.post("/generate-text", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const model = genAI.getGenerativeModel("gemini-1.5-flash");
    const result = await model.generateText({ prompt });

    if (!result || !result.output?.text) {
      throw new Error("No text output received");
    }

    res.status(200).json({ text: result.output.text });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).json({ error: "Error generating text" });
  }
});

app.post("/generate-text-streaming", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const model = genAI.getGenerativeModel("gemini-1.5-flash");
    const result = await model.generateTextStream({ prompt });

    res.setHeader("Content-Type", "text/plain");

    for await (const chunk of result) {
      res.write(chunk.output.text);
    }
    res.end();
  } catch (error) {
    console.error("Error streaming text:", error);
    res.status(500).json({ error: "Error streaming text" });
  }
});

app.post("/generate-with-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const model = genAI.getGenerativeModel("gemini-1.5-flash");
    const imagePart = fileToGenerativePart(path.join(mediaPath, "jetpack.jpg"), "image/jpeg");

    if (!imagePart) return res.status(400).json({ error: "Image file not found" });

    const result = await model.generateContent([prompt, imagePart]);

    res.status(200).json({ text: result.output?.text || "No text output received" });
  } catch (error) {
    console.error("Error generating with image:", error);
    res.status(500).json({ error: "Error generating with image" });
  }
});

app.post("/generate-with-images", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const model = genAI.getGenerativeModel("gemini-1.5-flash");
    const imageFiles = ["jetpack.jpg", "piranha.jpg", "firefighter.jpg"];

    const imageParts = imageFiles
      .map((file) => fileToGenerativePart(path.join(mediaPath, file), "image/jpeg"))
      .filter(Boolean);

    if (imageParts.length === 0) return res.status(400).json({ error: "No valid image files found" });

    const result = await model.generateContent([prompt, ...imageParts]);

    res.status(200).json({ text: result.output?.text || "No text output received" });
  } catch (error) {
    console.error("Error generating with multiple images:", error);
    res.status(500).json({ error: "Error generating with multiple images" });
  }
});

app.post("/generate-with-audio", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const model = genAI.getGenerativeModel("gemini-1.5-flash");
    const audioPart = fileToGenerativePart(path.join(mediaPath, "samplesmall.mp3"), "audio/mp3");

    if (!audioPart) return res.status(400).json({ error: "Audio file not found" });

    const result = await model.generateContent([prompt, audioPart]);

    res.status(200).json({ text: result.output?.text || "No text output received" });
  } catch (error) {
    console.error("Error generating with audio:", error);
    res.status(500).json({ error: "Error generating with audio" });
  }
});

app.post("/generate-with-video", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const model = genAI.getGenerativeModel("gemini-1.5-flash");
    const fileManager = new GoogleAIFileManager(API_KEY);
    const videoPath = path.join(mediaPath, "Big_Buck_Bunny.mp4");

    if (!fs.existsSync(videoPath)) return res.status(400).json({ error: "Video file not found" });

    const uploadResult = await fileManager.uploadFile(videoPath, { mimeType: "video/mp4" });

    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state === FileState.FAILED) throw new Error("Video processing failed");

    const videoPart = { fileData: { fileUri: uploadResult.file.uri, mimeType: uploadResult.file.mimeType } };

    const result = await model.generateContent([prompt, videoPart]);

    res.status(200).json({ text: result.output?.text || "No text output received" });

    await fileManager.deleteFile(uploadResult.file.name);
  } catch (error) {
    console.error("Error generating with video:", error);
    res.status(500).json({ error: "Error generating with video" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
