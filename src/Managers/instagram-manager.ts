import { IgApiClient } from 'instagram-private-api';
import { readFile } from 'fs';
import { promisify } from 'util';
const readFileAsync = promisify(readFile);

class InstagramManager {
  instagramApi: IgApiClient;

  constructor() {
    this.instagramApi = new IgApiClient();
  }

  async login() {
    if (process.env.USERNAME && process.env.PASSWORD) {
      this.instagramApi.state.generateDevice(process.env.USERNAME);
      await this.instagramApi.account.login(process.env.USERNAME, process.env.PASSWORD);
    }
  }

  async postPicture(caption: string, location?: string) {
    const path = './mkb.jpg';
    const { latitude, longitude, searchQuery } = {
      latitude: 0.0,
      longitude: 0.0,
      searchQuery: location,
    };
  
    const locations = await this.instagramApi.search.location(latitude, longitude, searchQuery);
    const mediaLocation = locations[0];
    console.log(mediaLocation);
  
    const publishResult = await this.instagramApi.publish.photo({
      file: await readFileAsync(path),
      caption: caption,
      location: mediaLocation,
      usertags: {
        in: [
          await this.generateUsertagFromName('instagram', 0.5, 0.5),
        ],
      },
    });
  
    console.log(publishResult);
  };

  async generateUsertagFromName(name: string, x: number, y: number): Promise<{ user_id: number, position: [number, number] }> {
    x = this.clamp(x, 0.0001, 0.9999);
    y = this.clamp(y, 0.0001, 0.9999);
    const { pk } = await this.instagramApi.user.searchExact(name);
    return {
      user_id: pk,
      position: [x, y],
    };
  }

  clamp = (value: number, min: number, max: number) => Math.max(Math.min(value, max), min);
}

export default InstagramManager;