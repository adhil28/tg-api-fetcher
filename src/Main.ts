import { Driver } from "./Driver"
const driver = new Driver({ debuging: false })
var readline = require('readline');


function getInput(question: string): Promise<string> {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((res) => {
        rl.question(question, (ans: string) => {
            res(ans)
            rl.close()
        })
    })
}

export const getApiIdandHash = ({ debuging }: { debuging: boolean }) => {
    driver.setDebugging(debuging)
    return new Promise((res, rej) => {
        driver.connect().then(async () => {
            await driver.openPage('https://my.telegram.org/auth')

            //type number
            let phone = await getInput('Enter your phone number : ')
            await driver.typeIntoInput('//input[@type="text"][@class="form-control input-large"][@id="my_login_phone"]', phone)
            await driver.clickButton('//button[@type="submit"][@class="btn btn-primary btn-lg"]')

            //type password
            let password = await getInput('Enter password send by telegram : ')
            await driver.typeIntoInput('//input[@type="text"][@id="my_password"][@name="password"]', password + '\n')

            //wait until logged in
            await driver.awaitForElementLoaded('//a[@href="/apps"]', 60)
            await driver.openPage('https://my.telegram.org/apps')

            //check title and short name added
            let title = await driver.getValueOfInput('//input[@id="app_title"][@name="app_title"][@type="text"]')
            if (title != '') {
                //get apiId and apiHash
                let apiId = await driver.getAllElementTextWithSelector('#app_edit_form > div:nth-child(3) > div.col-md-7 > span > strong')
                let apiHash = await driver.getAllElementTextWithSelector('#app_edit_form > div:nth-child(4) > div.col-md-7 > span')
                res({ apiId, apiHash });
            } else {
                rej(new Error("ApiId and ApiHash do not exist. Go to my.telegram.org and save changes"));
            }
            await driver.exitBrowser()
        })
    })
}
