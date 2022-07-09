require("dotenv").config({ path: "./config/.env" });

// Node inbuilt modules
const fs = require("fs");
const path = require("path");

const puppeteer = require("puppeteer");

const baseURL = "https://www.instagram.com/";

// Global objects to access in helper functions
let page, browser;

// Helper function to search button with text and then click it
const searchBtn = async (txt) => {
  try {
    const [button] = await page.$x(`//button[contains(., '${txt}')]`);
    if (button) {
      // if button found click it
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
    // wait for input
    await page.waitForSelector("input");
    // Input credentials
    await page.type('input[name="username"]', process.env.USER);
    await page.type('input[name="password"]', process.env.PASS);
    await searchBtn("Log In");
    await page.waitForNavigation();
    // Get cookies and store them in config/cookies.js
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
      // If cookies found load them and reload the page
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
    // set headless:true or use puppeteer.launch() to avoid opening chromium
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
    // take screenshot of logged in page comment out if not needed
    await page.screenshot({ path: "screenshot.png" });
  } catch (err) {
    console.log(err);
  } finally {
    // after 3sec of complete execution or if error encountered close the browser
    setTimeout(() => browser.close(), 3000);
  }
};
