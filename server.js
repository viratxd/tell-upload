const express = require("express");
const multipart = require("connect-multiparty");
const FileReader = require("filereader");
const bot = require(".");
const { Input } = require("telegraf");
const axios = require("axios").default;

const multipartMiddleware = multipart();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// upload
app.post("/upload", multipartMiddleware, async (req, res, next) => {
  const file = req.files.file;
  const filereader = new FileReader();

  filereader.readAsArrayBuffer(file);

  filereader.addEventListener("load", function (ev) {
    bot.telegram
      .sendPhoto(1436937738, Input.fromBuffer(filereader.result))
      .then((data) => {
        res.send({ link: `${process.env.HOST}/${data.photo.slice(-1)[0].file_id}` });
      });
  });
});

// download
app.get("/:fileId", async (req, res, next) => {
  const fileId = req.params.fileId;

  bot.telegram.getFileLink(fileId).then(async ({ href }) => {
    try {
      const response = await axios.get(href, { responseType: "stream" });
      response.data.pipe(res);
    } catch (error) {
      console.log(error);
    }
  });
});

app.listen(3000, () => {
  console.log("app is listening to port 3000");
});
