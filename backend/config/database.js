const mongoose = require("mongoose");



const createDatabase =async ()=>{
  // console.log(process.env.PORT)
   mongoose.connect(process.env.DB_URL,
    {
        useUnifiedTopology:true,
        useNewUrlParser: true,
    }).then((data)=>{
        console.log(`Connecting ${data} .......`)
    })
}

module.exports = createDatabase