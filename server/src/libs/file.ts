import fs from "fs";
import mimeTypes from "mime-types";

export const getAttachmentParameter = (filePath: string, mimeType?: string) => {
  return {
    inlineData: {
      data: fs.readFileSync(filePath).toString("base64"),
      mimeType: mimeType || mimeTypes.lookup(filePath) || "image/png",
    },
  };
};
