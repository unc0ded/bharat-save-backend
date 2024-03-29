const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const http = require("http");
const dotenv = require("dotenv");
const logger = require("morgan");
const agentRoutes = require("./agentAPI/routes/agentRoutes");
const augmontRoutes = require("./api/routes/augmontRoute");
const userRoutes = require("./api/routes/userRoute");
const receiveMsgs = require("./Whatsapp/receiveMessages");
const paytmRoutes = require("./api/routes/paytmRoute");
const Bree = require("bree");
const { SHARE_ENV } = require("worker_threads");

dotenv.config();

// var options = {
//   key: fs.readFileSync(process.env.PRIV_KEY),
//   cert: fs.readFileSync(process.env.CERT),
//   ca: fs.readFileSync(process.env.CHAIN),
// };

// require db
require("./config/mongoose.js");

const bree = new Bree({
  jobs: [
    {
      name: "auth",
      interval: "25d",
      timeout: 0
    }
  ],
  worker: {
    env: SHARE_ENV
  }
});

bree.start();

// require("./jobs/auth.js");

const app = express();

app.use(express.json());
app.use(logger("dev"));
//handled CORS
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "*");
  res.set("Access-Control-Allow-Methods", "*");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

// set up routes
app.use("/augmont", augmontRoutes);
app.use("/paytm", paytmRoutes);
app.use("/user", userRoutes);
app.use("/webhook", receiveMsgs.receiveMsg);
app.use("/agent", agentRoutes);

// var httpServer = http.createServer(app);
// var httpsServer = https.createServer(options, app);

// httpsServer.listen(443);
app.listen(process.env.PORT || 8000, function () {
  console.log(`server started on port ${process.env.PORT}`);
});
