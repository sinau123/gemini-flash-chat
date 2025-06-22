import { ContentListUnion, GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import config from "./config";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { getAttachmentParameter } from "./libs/file";
import { AppError, errorHandler } from "./middleware/errorHandler";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: config.apiKey });
function useModel(contents: ContentListUnion) {
  return ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    },
    contents,
  });
}

const upload = multer({ dest: "./upload" });
const app = express();
app.use(express.json());
app.post(
  "/generate-text",
  async (req: Request<{}, {}, { prompt: string }>, res, next) => {
    const { prompt } = req.body;

    try {
      let result = await useModel(prompt);
      let response = result.text;

      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  "/generate-image",
  upload.single("image"),
  async (
    req: Request<{}, {}, { prompt: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { prompt } = req.body;
    const reqFile = req.file;

    if (!reqFile) {
      throw new AppError("file not found", 400);
    }

    const filePath = reqFile.path;
    const file = getAttachmentParameter(filePath, reqFile.mimetype);

    try {
      let result = await useModel([
        { text: prompt || "Please describe this image" },
        file,
      ]);
      let response = result.text;

      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    } finally {
      fs.unlinkSync(filePath);
    }
  }
);

app.post(
  "/generate-from-document",
  upload.single("document"),
  async (
    req: Request<{}, {}, { prompt: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { prompt } = req.body;
    const reqFile = req.file;

    if (!reqFile) {
      throw new AppError("file not found", 400);
    }

    const filePath = reqFile.path;
    const file = getAttachmentParameter(filePath, reqFile.mimetype);

    try {
      let result = await useModel([
        { text: prompt || "Please describe this document" },
        file,
      ]);
      let response = result.text;

      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    } finally {
      fs.unlinkSync(filePath);
    }
  }
);

app.post(
  "/generate-from-audio",
  upload.single("audio"),
  async (
    req: Request<{}, {}, { prompt: string }>,
    res: Response,
    next: NextFunction
  ) => {
    const { prompt } = req.body;
    const reqFile = req.file;

    if (!reqFile) {
      throw new AppError("file not found", 400);
    }

    const filePath = reqFile.path;
    const file = getAttachmentParameter(filePath, reqFile.mimetype);

    try {
      let result = await useModel([
        { text: prompt || "Please describe this audio" },
        file,
      ]);
      let response = result.text;

      res.status(200).json({ data: response });
    } catch (error) {
      next(error);
    } finally {
      fs.unlinkSync(filePath);
    }
  }
);

app.use(errorHandler);
app.listen(config.port, () => {
  console.log(`this apps run on port ${config.port}`);
});
