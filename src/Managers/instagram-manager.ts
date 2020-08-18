import { IgApiClient } from 'instagram-private-api';
import { readFileSync } from 'fs';

class InstagramManager {
  instagramApi: IgApiClient;

  constructor() {
    this.instagramApi = new IgApiClient();
  }

  login = async () => {
    if (process.env.USERNAME && process.env.PASSWORD) {
      await this.instagramApi.state.generateDevice(process.env.USERNAME);
      await this.instagramApi.account.login(process.env.USERNAME, process.env.PASSWORD);
    }
  }

  postPicture = async (caption: string, path: string, location: string = '') => {
    const { latitude, longitude, searchQuery } = {
      latitude: 0.0,
      longitude: 0.0,
      searchQuery: location,
    };
  
    const locations = await this.instagramApi.search.location(latitude, longitude, searchQuery);
    const mediaLocation = locations[0];
    console.log(mediaLocation);
    
    try {
      const file = readFileSync(path);
      console.log(file);
      console.log(path);
      console.log(__dirname);
      
      const publishResult = await this.instagramApi.publish.photo({
        file,
        caption: caption,
        location: mediaLocation,
      });
    
      console.log(publishResult);
    } catch (err) {
      console.log('************', err);
      
    }
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