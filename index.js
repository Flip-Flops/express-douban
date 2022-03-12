const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 以下区域用于测试
const https = require("https");
// app.post("/api/douban", async (req, res) => {
//   https.get('https://api.douban.com/v2/book/search?q=蛤蟆先生&start=0&count=20&apikey=0ac44ae016490db2204ce0a042db2916', (response) => {
//     let body = [];
//     response.on("data", (chunk) => {
//       body.push(chunk);
//     });
//     response.on("end", function () {
//       body = Buffer.concat(body);
//       res.send({
//         code: 0,
//         data: body.toString(),
//       });
//     });
//   });
// });

app.post("/api/douban", async (req, res) => {
  const { url } = req.body;
  https.get(url, (response) => {
    let body = [];
    response.on("data", (chunk) => {
      body.push(chunk);
    });
    response.on("end", function () {
      body = Buffer.concat(body);
      res.send({
        code: 0,
        data: body.toString(),
      });
    });
  });
});

// 以上区域用于测试

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
