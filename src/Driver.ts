import puppeteer, { Browser, Page } from "puppeteer"
import { DriverInterface } from "./Types";
export class Driver {
    browser?: Browser
    page?: Page
    debuging?= false

    constructor(options: DriverInterface) {
        this.debuging = options.debuging
    }

    private debug(msg: string, error?: boolean) {
        if (this.debuging == true) {
            if (error) {
                console.log('\x1b[36m%s\x1b[0m', (new Date().toDateString()) + ' ' + (new Date().toTimeString()) + ': ' + msg);
            } else {
                console.log('\x1b[36m%s\x1b[31m', (new Date().toDateString()) + ': ' + msg);
            }
        }
    }

    async connect() {
        this.debug('launching browser')
        this.browser = await puppeteer.launch({ headless: true });
        this.debug('connecting browser')
        this.page = await this.browser.newPage();
    }
    async openPage(site: string) {
        if (this.page != null) {
            await this.page.goto(site);
            this.debug('page loaded : ' + site)
        } else {
            this.debug('Failed to connect page. call driver.connect()', true)
        }
    }
    async typeIntoInput(x_path: string, text: string) {
        this.debug('detecting element : ' + x_path)
        if (this.page != null) {
            let element = await this.page.waitForXPath(x_path, { timeout: 1000 * 60 })
            this.debug('element detected : ' + x_path)
            await element?.click()
            await element?.type(text)
            this.debug(`typed text ${text} to XPATH : ${x_path}`)
        } else {
            this.debug('Failed to connect page. call driver.connect()', true)
        }
    }
    async clickButton(x_path: string) {
        if (this.page != null) {
            this.debug('detecting element: ' + x_path)
            let element = await this.page.waitForXPath(x_path, { timeout: 1000 * 60 })
            await element?.click()
            this.debug('button clicked successfully')
        } else {
            this.debug('Failed to connect page. call driver.connect()', true)
        }
    }
    async awaitForElementLoaded(x_path: string, timeout_seconds: number) {
        if (this.page != null) {
            this.debug('detecting element : ' + x_path)
            await this.page.waitForXPath(x_path, { timeout: 1000 * timeout_seconds })
            this.debug('element detected')
        } else {
            this.debug('Failed to connect page. call driver.connect()', true)
        }
    }
    async getValueOfInput(x_path: string) {
        if (this.page != null) {
            this.debug("detecting element : " + x_path)
            let element = await this.page.waitForXPath(x_path, { timeout: 1000 * 60 })
            return this.page.evaluate(x => x.value, element)
        } else {
            this.debug('Failed to connect page. call driver.connect()', true)
        }
        return new Promise((res) => {
            res('')
        })

    }
    async getAllElementTextWithSelector(selector: string): Promise<string[]> {
        if (this.page != null) {
            this.debug("searching element : " + selector)
            const element = await this.page.$(selector)
            this.debug("Extracting data : " + selector)
            return await this.page.evaluate(el => el.textContent, element)
        } else {
            this.debug('Failed to connect page. call driver.connect()', true)
        }
        return new Promise((r) => {
            r([])
        })
    }
    async exitBrowser() {
        if (this.browser != null) {
            await this.browser.close()
        }
    }

}

