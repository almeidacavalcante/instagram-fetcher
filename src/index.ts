
import dotenv from 'dotenv';
import MainManager from './main-manager';

dotenv.config();

const mainManager = new MainManager();
const init = async () => {
  await mainManager.instagramScrapperInit();
  await mainManager.likeAndCommentPosts();
  await mainManager.searchAndDownloadPhotos('mechanical-keyboards', 2);
}

init();

