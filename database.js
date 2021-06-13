const mongoose = require('mongoose');
const Programs = require('./connectMongo.js');
mongoose.set('useFindAndModify', false);

async function getInfoFromDB(){
    await mongoose.connect('mongodb://localhost:27017/healthWebScraper', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
    console.log("Connection Open!")
    })
    .catch(err=>{
    console.log("Connection failed to open.")
    console.log(err)
    })

    data = await Programs.find({})
    await mongoose.connection.close()
    await (new Promise(resolve => setTimeout(resolve, 2000)));
    return data;
}

data = getInfoFromDB();

module.exports = getInfoFromDB();
