import fs from "fs";
import InstagramManager from "./Managers/instagram-manager";
import MediaManager from "./Managers/media-manager";
import InstagramScrapper, { PAGES } from "./instagram-scrapper";

class MainManager {
  instagramManager: InstagramManager;
  mediaManager: MediaManager;
  instagramScrapper?: InstagramScrapper;

  constructor() {
    this.instagramManager = new InstagramManager();
    this.mediaManager = new MediaManager();
  }

  instagramManagerInit = async () => {
    await this.instagramManager.login();
    console.log("after login");
  };

  instagramScrapperInit = async () => {
    if (process.env.USERNAME && process.env.PASSWORD) {
      this.instagramScrapper = new InstagramScrapper(
        process.env.USERNAME,
        process.env.PASSWORD
      );
      await this.instagramScrapper.initialize();
      await this.instagramScrapper.login();
      await this.instagramScrapper.deactivateNotifications();
    } else {
      throw new Error(
        "As variáveis de ambiente não foram setadas. Crie o arquivo .env na raiz do projeto"
      );
    }
  };

  async postRandomPhoto(query: string) {
    const filePath = await this.mediaManager.downloadRandomPhotoByQuery(query);
    console.log("after get file", filePath);
    if (filePath) {
      await this.instagramManager.postPicture(
        "#keyboardist #keyboards #keyboardplayer #keyboardprotector #keyboardandmouse #keyboardgaming #keyboardcover #keyboardwarrior #keyboardcat #keyboardmurah #keyboarder #keyboardsolo #keyboardwarriors #keyboardistindonesia #keyboarding #keyboardlaptop #keyboardplayers #keyboardis #keyboardyamaha",
        filePath
      );
      // await fs.unlink(filePath, () => {});
    }
  }

  likeAndCommentPosts = async () => {
    if (this.instagramScrapper) {
      await this.likePostsOnTags(this.instagramScrapper);
      await this.instagramScrapper.close();
    }
  };

  searchAndDownloadPhotos = (tag: string, pages: number) => {
    this.mediaManager.searchAndDownload(tag, pages);
  };

  downloadRandomPhotoByQuery = (query: string) => {
    this.mediaManager.downloadRandomPhotoByQuery(query);
  };

  private likePostsOnTags = async (instagram: InstagramScrapper) => {
    return new Promise(async (res, rej) => {
      for (const page of PAGES) {
        await instagram.goTo(page);
        await instagram.likeThePost();
      }
      res();
    });
  };
}

export default MainManager;
