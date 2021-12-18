            
const puppeteer=require("puppeteer");
(async () => {

const browser = await puppeteer.launch({
	        product:'firefox',
        
                executablePath:'/usr/bin/firefox',
		args:[
		'--no-sandbox',
		'--disable-setuid-sandbox',
		],
		headless:true,
		});

const page = await browser.newPage()

await page.goto('https://google.com')

const data = await page.pdf({ path: '../test/api.pdf', format: 'A4' })

console.log(data.toString())
await browser.close()
process.exit()
})()







  




