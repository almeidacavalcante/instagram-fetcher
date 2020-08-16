import puppeteer, { Browser, Page, ElementHandle } from "puppeteer";
import fs from "fs";
import https from "https";

export const PAGES = [
  "https://www.instagram.com/explore/tags/customkeycaps/",
  "https://www.instagram.com/explore/tags/customkeyboard/",
];

export const COMMENTS = [
  "Ohh! I like that one!",
  "interesting one, great!",
  "pretty good",
  "good!",
  "Wow, I think this is actually amazing",
  "amazing!!!",
  "not bad at all, have a nice day!",
  "hmmm... what a nice job",
  "good job! very good indeed!",
  "keep it up!",
  "omg, how did you do that?",
  "fantastic!",
  "sensational!",
  "a very good job right there",
  "impressive!!",
];

export const EMOJI = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "☺️",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
];

class InstagramScrapper {
  username = "";
  password = "";
  page?: Page;
  oldPage?: Page;
  browser?: Browser;

  BASE_URL = "https://www.instagram.com/";

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  async initialize() {
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
    await this.page?.goto(this.BASE_URL);
  }

  async comment(commentary: string) {
    return new Promise(async (resolve, reject) => {
      const textAreaSelector =
        "body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > section.sH9wk._JgwE > div > form > textarea";
      const publishButtonSelector =
        "body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > section.sH9wk._JgwE > div > form > button.sqdOP.yWX7d.y3zKF[type=submit]";
      await this.page?.type(textAreaSelector, commentary, { delay: 200 });
      await this.page?.click(publishButtonSelector, { delay: 200 });
      await this.wait(2500);
      resolve();
    });
  }

  async login() {
    await this.page?.goto(this.BASE_URL, { waitUntil: "networkidle2" });
    await this.wait();

    await this.page?.type(
      "#loginForm > div > div:nth-child(1) > div > label > input",
      this.username,
      { delay: 50 }
    );

    await this.page?.type(
      "#loginForm > div > div:nth-child(2) > div > label > input",
      this.password,
      { delay: 50 }
    );

    await this.page?.click("#loginForm > div > div:nth-child(3) > button", {
      delay: 25,
    });
  }

  async deactivateNotifications() {
    await this.wait(4000);
    const notificationElement = await this.page?.$(
      "#react-root > section > main > article > div.EZdmt > div > div > div:nth-child(1)"
    );
    if (notificationElement) {
      await this.page?.click(
        "body > div.RnEpo.Yx5HN > div > div > div > div.mt3GC > button.aOOlW.bIiDR",
        { delay: 50 }
      );
    }
  }

  async goTo(url: string) {
    await this.page?.goto(url);
    await this.wait();
  }

  async likeThePost() {
    const selector =
      "#react-root > section > main > article > div.EZdmt > div > div > div:nth-child(1)";
    const postsParent = await this.page?.$(selector);

    const posts = await postsParent?.$$("div");

    if (posts) {
      for (const post of posts) {
        await this.executeLikeAndGoToNextPost(post);
      }
    }
  }

  getRandomComment() {
    return (
      COMMENTS[Math.floor(Math.random() * COMMENTS.length)] +
      " " +
      EMOJI[Math.floor(Math.random() * EMOJI.length)] +
      " " +
      EMOJI[Math.floor(Math.random() * EMOJI.length)]);
  }

  async executeLikeAndGoToNextPost(post: ElementHandle<Element>) {
    return new Promise(async (resolve, reject) => {
      try {
        await post.click();
        await this.wait(2500);
        const heartButton = await this.page?.$(
          'body > div._2dDPU.CkGkG > div.zZYga > div > article > div.eo2As > section.ltpMr.Slqrh > span.fr66n > button > div > span > svg[aria-label="Curtir"]'
        );
        await this.comment(this.getRandomComment());
        if (heartButton) {
          await heartButton?.click();
          await this.nextPost();
          resolve(true);
        } else {
          await this.nextPost();
          resolve(false);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async nextPost() {
    const arrowNext = await this.page?.$(
      "body > div._2dDPU.CkGkG > div.EfHg9 > div > div > a._65Bje.coreSpriteRightPaginationArrow"
    );
    await arrowNext?.click();
  }

  async wait(time = 300) {
    await this.page?.waitFor(time);
  }

  async getImageListFromPage(page?: Page) {
    const localPage = page ? page : this.page;

    return await localPage?.evaluate(() => {
      const nodeList: NodeListOf<HTMLImageElement> = document.querySelectorAll(
        "article img"
      );
      const images = [...nodeList];
      const list = images.map((image: HTMLImageElement) => ({
        src: image.src,
      }));
      return list;
    });
  }

  async seveToFile(imageList: Array<HTMLImageElement>, filename: string) {
    await fs.writeFile(filename, JSON.stringify(imageList, null, 2), (err) => {
      if (err) throw err;

      console.log("well done!");
    });
  }

  async download(url: string, destination: string) {
    const file = fs.createWriteStream(destination);

    await https.get(url, (response) => {
      file.on("finish", () => {
        console.log("onFinish??");
        file.close();
      });
      file.on("error", () => {
        throw new Error("not possible to download");
      });
      file.on("end", () => {
        console.log("on END");
      });
    });
  }

  async close() {
    this.browser?.close();
  }
}

export default InstagramScrapper;
