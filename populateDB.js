const puppeteer = require('puppeteer')
const mongoose = require('mongoose');
const Programs = require('./connectMongo.js')

mongoose.connect('mongodb://localhost:27017/healthWebScraper', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
  console.log("Connection Open!")
})
.catch(err=>{
  console.log("Connection failed to open.")
  console.log(err)
})

addProgramsInfo();

async function addProgramsInfo(){
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  
  await page.goto('https://www.healthwellfoundation.org/disease-funds/')  
  await page.setViewport({ width: 1536, height: 722 })

  await page.waitForSelector('.section > div > .subsection > .funds')

  initialPrograms = [];
  for(i = 1; i < 6; i++){
      // a. Assistance Program name (Disease Funds) == programName[0]
      // link == programName[1]
    programName = await page.$eval(".section > div > .subsection > .funds > li:nth-child(" + i + ") > a", (el) => [el.textContent, el.href]);
    
    //getting the full data needed to be shown
    initialPrograms.push(await getProgramInfo(programName[0], programName[1]))
  }
  
  //updates the database
  await Programs.insertMany(initialPrograms, (err, result)=>{
    console.log("err");
    console.log(err);
    console.log("result");
    console.log(result);
  });

  await browser.close()
  await mongoose.connection.close()
}

async function getProgramInfo(name, url){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
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