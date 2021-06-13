const express = require('express');
const app = express();
const path = require('path');
data = require('./database');
getNamesFromData = require('./updateFlow.js');

app.set('view engine','ejs')
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req,res)=>{
    newData = JSON.stringify(data)
    res.render("app.html", {data: newData})
})

app.get('/update', (req, res)=>{
    data = getNamesFromData(data);
    console.log(data)
    res.render("app.html", {data: newData})
})


app.listen('3001', ()=>{
    console.log("listening on port 3001!")
})