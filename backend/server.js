const app = require("./app")
const dotenv = require("dotenv")
const cloudinary = require('cloudinary')
const connectDatabase = require("./config/database");

// Handle Uncaught Exception Error ex- console.log(undefined_variable) then got error
process.on("uncaughtException",(err)=>{
    console.log(`Error : ${err.message}`)
    console.log(`Shutting down the server due to Uncaught Exception Error`);
    process.exit(1);
})

// config
dotenv.config({ path: "./config/config.env" });

// connect database
connectDatabase();

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET
})


const server = app.listen(process.env.PORT,()=>{
    console.log(`Severe is working.........${process.env.PORT}`);
})


// Unhandled Promise rejection
process.on("unhandledRejection",(err)=>{
   console.log(`Error : ${err.message}`);
   console.log(`Shutting down the server due to unhandled promise rejection`);
   server.close(()=>{
    process.exit(1)
   })
});