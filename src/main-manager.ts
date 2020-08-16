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

  instagramScrapperInit = async () => {
    if (process.env.USERNAME && process.env.PASSWORD) {
      this.instagramScrapper = new InstagramScrapper(process.env.USERNAME, process.env.PASSWORD);
      await this.instagramScrapper.initialize();
      await this.instagramScrapper.login();
      await this.instagramScrapper.deactivateNotifications();
    } else {
      throw new Error('As variáveis de ambiente não foram setadas. Crie o arquivo .env na raiz do projeto');
    }
  }

  likeAndCommentPosts = async () => {
    if (this.instagramScrapper) {
      await this.likePostsOnTags(this.instagramScrapper);
      await this.instagramScrapper.close();
    }
  };

  searchAndDownloadPhotos = (tag: string, pages: number) => {
    const mediaManager = new MediaManager();
    mediaManager.searchAndDownload(tag, pages);
  }

  private likePostsOnTags = async (instagram: InstagramScrapper) => {
    return new Promise( async (res, rej) => {
      for (const page of PAGES) {
        await instagram.goTo(page);
        await instagram.likeThePost();
      }
      res();
    })
  }



}

export default MainManager;