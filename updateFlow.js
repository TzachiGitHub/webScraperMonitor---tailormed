const puppeteer = require('puppeteer')
const mongoose = require('mongoose');
const Programs = require('./connectMongo.js')
mongoose.set('useFindAndModify', false);

mongoose.connect('mongodb://localhost:27017/healthWebScraper', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
  console.log("Connection Open!")
})
.catch(err=>{
  console.log("Connection failed to open.")
  console.log(err)
})


//changing the a row of data manually
async function findAndUpdateManually(){
    randomDataToUpdate ={
        assistantProgramName: "Godly Program",
        status: "Finally approved!!",
        treatmentList: "I wish I knew",
        grantAmount: "10 million muhahaa"
    }
    console.log("programsToUpdate")
    console.log(randomDataToUpdate)
    myName =  "" + randomDataToUpdate.assistantProgramName + "";
    await Programs.findOneAndUpdate(
        // { assistantProgramName: myName},
        { "assistantProgramName": "Godly Program"},
        {
            "assistantProgramName": "Acromegaly",
            "status": "miss!",
            "treatmentList": "currently none",
            "grantAmount": "way too low"
        },
        (error,data)=>{
            if(error){
                console.log("error");
                console.log(error);
            }
            if(data){
                console.log("data")
                console.log(data)
            }
        }).then(console.log("end!"))
        console.log("end?")
}


//calling the function that updates the current fund programs
getNamesFromData = (data) => {
    assistantProgramName = []
    for(var i = 0; i < data.length; i++){
        assistantProgramName.push(data[i].assistantProgramName)
    }
    return updateProgramInfo(assistantProgramName);
}

async function updateProgramInfo(assistantProgramName){
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const url = 'https://www.healthwellfoundation.org/fund/'
    
    await page.setViewport({ width: 1536, height: 722 })
    await page.goto(url)

    programsToUpdate = [];
    
    for(i = 0; i < 5; i++){
        nameForURL = assistantProgramName[i].replace(/\s+/g, '-')
        // a. Assistance Program name (Disease Funds) == assistantProgramName[0]
        programsToUpdate.push(await getProgramInfo(assistantProgramName[i], url + nameForURL))        
    }

    for(i = 0; i < 5; i++){
        curName = "" + programsToUpdate[i].assistantProgramName + "";
        await Programs.findOneAndUpdate(
            { "assistantProgramName": curName},
            {
                "status": programsToUpdate[i].status,
                "treatmentList": programsToUpdate[i].treatmentList,
                "grantAmount": programsToUpdate[i].grantAmount
            },
            (error,data)=>{
                if(error){
                    console.log("error");
                    console.log(error);
                }
                if(data){
                    console.log("data")
                    console.log(data)
                }
            }
         )
    }

    await browser.close()
    await mongoose.connection.close()

    return programsToUpdate;    
}
        
//returns a single program's info
async function getProgramInfo(name, url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //go to the page with the current program name
    await page.goto(url);

    //b. Eligible treatments (Treatments Covered)
    await page.setViewport({ width: 1536, height: 722 })
    await page.waitForSelector('div > .treatments > div > ul')

    const fullTreatmentList = await (await page.$eval("div > .treatments > div > ul", el => el.textContent)).replace(/\s+/g, ' ');
    const treatmentList = fullTreatmentList.replace(/^\s+|\s+$/g, '')

    //c. status
    const [el] = await page.$x('//*[@id="fund-details"]/div[1]/div[1]/div[1]');
    await page.waitForSelector('div > #fund-details > .details > .row:nth-child(1) > div:nth-child(1)')
    const fullStatus = await (await page.$eval("div > #fund-details > .details > .row:nth-child(1) > div:nth-child(1)", el => el.textContent));
    const status = fullStatus.replace("Status","").replace(/^\s+|\s+$/g, '').substring(0,6);

    //d. Grant amount (Maximum Award Level)
    await page.waitForSelector('div > #fund-details > .details > .row:nth-child(2) > div:nth-child(1)')
    const fullGrantAmount = (await page.$eval("div > #fund-details > .details > .row:nth-child(2) > div:nth-child(1)", el => el.textContent)).replace(/\s+/g, ' ');;
    const grantAmount = fullGrantAmount.replace(/^\s+|\s+$/g, '')
    
    await browser.close(); 

    data= {
        "assistantProgramName": name,
        "status": status,
        "treatmentList": treatmentList,
        "grantAmount": grantAmount
    }
    return data;
}

module.exports = getNamesFromData;