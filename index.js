
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config();
const connectDb = require("./Configuration/dbConnection");
const User = require("./Routes/userRoute")
const Community = require("./Routes/communityRoute")
const Member = require("./Routes/memberRoute")
const Role = require("./Routes/roleRoute")
const app = express();
const port = 3000;


connectDb();  

// Use bodyParser middleware to parse JSON requests
app.use(bodyParser.json());



app.use("/v1/auth",User);
app.use("/v1/community",Community);
app.use("/v1/member",Member);
app.use("/v1/role",Role)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});