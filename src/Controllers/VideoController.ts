import Video from '../Models/Video';
import VideoHostManager from '../Common/VideoHostManager.interface';
import IController from './IController.interface';
import { inject, injectable } from 'tsyringe';
import DatabaseManager from '../Common/DatabaseManager.interface';
import { DBCollections } from '../Common/DBCollections.enum';
import Logger from '../Common/Logger.interface'; 
import { LogLevel } from '../Common/LogLevel.enum';

@injectable()
export default class VideoController implements IController<Video, string> { 
  constructor(
    @inject("VideoHostManager") private videoHostManager: VideoHostManager,
    @inject("DatabaseManager") private databaseManager: DatabaseManager,
    @inject("Logger") private logger: Logger
  ) { }
  
  public create = async (video: Video) => {
    const uploadResult = await this.videoHostManager.upload(video);

    if (uploadResult) { 
      await this.databaseManager.save(video, DBCollections.VIDEOS);
      this.logger.logToBoth(
        `Uploaded video ${video.getId()}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to upload video ${video.getId()}`,
        LogLevel.ERROR
      );
    }
    
    return uploadResult;
  }

  public get = async (id: string) => {
    const serializedVideo = await this.databaseManager.get(id, DBCollections.VIDEOS);
    const deserializedVideo = Video.deserialize(serializedVideo);

    if (deserializedVideo) {
      this.logger.logToBoth(
        `Downloaded video ${id}`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to download video ${id}`,
        LogLevel.ERROR
      );
    }

    return deserializedVideo;
  }

  public async getWithFilter(filter: any): Promise<Video[]> {
    const serializedVideos = await this.databaseManager.getWithFilter(filter, DBCollections.VIDEOS);
    const deserializedVideos = serializedVideos.map(v => Video.deserialize(v));

    if (deserializedVideos) {
      this.logger.logToBoth(
        `Retrieved videos with filter`,
        LogLevel.INFO
      );
    } else {
      this.logger.logToBoth(
        `Failed to retrieve videos with filter`,
        LogLevel.ERROR
      );
    }

    return deserializedVideos;
  }

  public getAll = async () => {
    const videos = await this.videoHostManager.downloadAll();

    if (videos) {
      this.logger.logToBoth(
        `Downloaded all videos`,
        LogLevel.INFO
      );

      return videos;
    } else {
      this.logger.logToBoth(
        `Failed to download all videos`,
        LogLevel.ERROR
      );
    }

    return videos;
  }

  public update = async (oldModelObjectId: string, updatedModelObject: Video) => {
    throw new Error('Method not implemented.');
  }

  public delete = async (id: string) => {
    for (let i = 1; i <= 5; i++) {
      await this.videoHostManager.delete(id, i);
    }

    this.logger.logToBoth(
      `Deleted video ${id}`,
      LogLevel.INFO
    );

    return true;
  };
}
