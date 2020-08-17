require('es6-promise').polyfill();
require('isomorphic-fetch');
import https from 'https';
import fs from 'fs';
import Unsplash, { toJson } from "unsplash-js"; 
import Clipper from 'image-clipper';

class MediaManager {
  unsplash?: Unsplash;

  constructor() {
    if (process.env.UNSPLASH_ACCESS_KEY && process.env.UNSPLASH_SECRET_KEY) {
      this.unsplash = new Unsplash({
        accessKey: process.env.UNSPLASH_ACCESS_KEY,
        secret: process.env.UNSPLASH_SECRET_KEY,
      });
    }
  }

  downloadRandomPhotoByQuery = async (query: string): Promise<string> => {
    return new Promise( async (res, rej) => {
      try {
        this.unsplash?.photos.getRandomPhoto({query}).then(toJson).then( async ({urls}) => {
          console.log(urls);
          const filename = `chama.jpg`;
          await this.saveImageToDisk(urls.regular, filename);
          res(`./resized.jpg`);
        })
        
      } catch (err) {
        console.log('********** ERROR *****');
        throw new err;
      }
    })
  }

  async listPhotos() {
    return this.unsplash?.photos.listPhotos(2, 15, "latest").then(toJson).then(
      json => json
    );
  }

  async searchAndDownload(tag: string, howManyPages: number) {
    for (let page = 0; page < howManyPages; page++) {
      this.unsplash?.search.photos(tag, page)
      .then(toJson)
      .then( async json => {
          const results = json.results;
          for (const result of results) {
            const { regular } = result.urls;
            await this.saveImageToDisk(regular, `${tag}-${Date.now()}.jpg`)
          }
      });
    }
  }

  async saveImageToDisk(url:string, localPath:string) {
    const file = fs.createWriteStream(localPath);
    Clipper(localPath, () => {
      Clipper.crop(20, 20, 100, 100)
      .quality(100)
      .toFile('resized.jpg', () => {
        console.log('saved!');
      });
    });
    const request = https.get(url, async response => {
      await response.pipe(file);
    });
  }
}

export default MediaManager;
