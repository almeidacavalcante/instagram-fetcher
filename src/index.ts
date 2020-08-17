import dotenv from 'dotenv';
import MainManager from './main-manager';
import { IgApiClient } from 'instagram-private-api';
import { readFile } from 'fs';
import { promisify } from 'util';
const readFileAsync = promisify(readFile);

dotenv.config();

const mainManager = new MainManager();
const init = async () => {
  // await mainManager.instagramScrapperInit();
  // await mainManager.likeAndCommentPosts();
  // await mainManager.searchAndDownloadPhotos('mechanical-keyboards', 1);
  // await mainManager.downloadRandomPhotoByQuery('gamer-girl');
  await mainManager.instagramManagerInit();
  await mainManager.postRandomPhoto('mechanical-keyboards');
}

(async () => {
  await init();
})();