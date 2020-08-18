require('es6-promise').polyfill();
require('isomorphic-fetch');
import https from 'https';
import fs from 'fs';
import Unsplash, { toJson } from "unsplash-js"; 
var Jimp = require('jimp');

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
          const filename = `image-${Date.now()}.jpg`;
          await this.saveImageToDisk(urls.regular, filename);
          res(filename);
        })
        
      } catch (err) {
        console.log('***** ERROR *****');
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
            const { raw } = result.urls;
            await this.saveImageToDisk(raw, `${tag}-${Date.now()}.jpg`)
          }
      });
    }
  }

  async saveImageToDisk(url:string, filename:string) {
    return new Promise<string>( async (res, rej) => {
      const file = await fs.createWriteStream(filename);
      https.get(url, async response => {
        await response.pipe(file);
      });

      setTimeout(() => {
        Jimp.read(filename)
        .then((image: any) => {
          const resizedFilename = 'resized_'+filename;
          image
            .quality(100)
            .crop(0,0,700,700)
            .write(resizedFilename);
  
          res(filename);
        })
        .catch((err: Error) => {
          console.error(err);
          rej(err);
        });
      }, 4000);

    })
  }
}

export default MediaManager;
