
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

const connectDb = async ()=>{
    try{

       const connect = await mongoose.connect(process.env.CONNECTION_STRING);
      console.log("database got connected")

    }
    catch(err){
console.log(err);
process.exit(1);

    }
}

module.exports = connectDb;