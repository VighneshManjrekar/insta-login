require("dotenv").config({ path: "./config/.env" });

const fs = require("fs");
const path = require("path");

const puppeteer = require("puppeteer");

const baseURL = "https://www.instagram.com/";

let page, browser;

// Helper function to search button with text and then click it
const searchBtn = async (txt) => {
  try {
    const [button] = await page.$x(`//button[contains(., '${txt}')]`);
    if (button) {
      await button.click();
    }
  } catch (err) {
    console.log(err)
    browser.close()
  }
};

// Helper function to save cookies after login
const writeCookie = async () => {
  try {
    await page.waitForSelector("input");
    await page.type('input[name="username"]', process.env.USER);
    await page.type('input[name="password"]', process.env.PASS);
    await searchBtn("Log In");
    await page.waitForNavigation();
    const cookies = await page.cookies();
    fs.writeFileSync(
      path.join(__dirname, "config", "cookies.json"),
      JSON.stringify(cookies)
    );
  } catch (err) {
    console.log(err);
    browser.close()
  }
};

// Helper function to check cookies already exists if yes then use them
const loadCookie = async () => {
  try {
    const cookies = JSON.parse(
      fs.readFileSync(path.join(__dirname, "config", "cookies.json"))
    );
    if (cookies.length > 0) {
      await page.setCookie(...cookies);
      await page.reload({
        waitUntil: ["networkidle0", "domcontentloaded"],
      });
    } else {
      await writeCookie();
    }
  } catch (err) {
    console.log(err);
    browser.close()
  }
};

// Initialize puppeteer
exports.init = async () => {
  try {
    // use puppeteer.launch() to avoid opening chromium
    browser = await puppeteer.launch({
      headless: false,
    });
    page = await browser.newPage();
  } catch (err) {
    console.log(err);
    if (browser) {
      browser.close();
    }
  }
};

// login function
exports.login = async () => {
  try {
    await page.goto(baseURL, { waitUntil: "networkidle2" });
    await loadCookie();
    await page.screenshot({ path: "screenshot.png" });
  } catch (err) {
    console.log(err);
  } finally {
    setTimeout(() => browser.close(), 3000);
  }
};
