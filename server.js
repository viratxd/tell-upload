const express = require("express");
const multipart = require("connect-multiparty");
const bot = require(".");
const fs = require("fs");
const axios = require("axios").default;
const path = require("path");

const multipartMiddleware = multipart();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload endpoint
app.post("/upload", multipartMiddleware, async (req, res) => {
  const file = req.files.file;

  try {
    // Read file as buffer
    const buffer = fs.readFileSync(file.path);

    // Send the file as a document
    bot.telegram
      .sendDocument(5173085859, { source: buffer, filename: file.name })
      .then((data) => {
        const fileId = data.document.file_id; // Extract file_id
        res.send({ link: `http://localhost:3000/${fileId}` }); // Direct download link
      })
      .catch((err) => {
        console.error("Error sending document:", err);
        res.status(500).send({ error: "Failed to send document" });
      });
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).send({ error: "Failed to process file" });
  }
});

// Direct download endpoint
app.get("/:fileId", async (req, res) => {
  const fileId = req.params.fileId;

  try {
    // Get file metadata from Telegram
    const fileInfo = await bot.telegram.getFile(fileId);

    // Extract the file path and name
    const filePath = fileInfo.file_path;
    const fileName = path.basename(filePath);

    // Get the file download link
    const fileLink = await bot.telegram.getFileLink(fileId);

    // Fetch the file and send it as a direct download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    const response = await axios.get(fileLink.href, { responseType: "stream" });
    response.data.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send({ error: "Failed to download file" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("App is listening on port 3000");
});
