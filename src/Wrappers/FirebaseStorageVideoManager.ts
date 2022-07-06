import Video, { VideoFactory } from '../Models/Video';
import VideoHostManager from '../Common/VideoHostManager.interface';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import SemanticError from '../Errors/SemanticError';
import { inject, injectable } from 'tsyringe';
import DatabaseManager from '../Common/DatabaseManager.interface';
import { DBCollections } from '../Common/DBCollections.enum';
import Logger from '../Common/Logger.interface';
import { LogLevel } from '../Common/LogLevel.enum';

@injectable()
export default class FirebaseStorageVideoManager implements VideoHostManager {
  private bucket = getStorage().bucket();

  constructor(
    @inject("VideoFactory") private videoFactory: VideoFactory,
    @inject("DatabaseManager") private databaseManager: DatabaseManager,
    @inject("Logger") private logger: Logger
  ) {
    this.bucket = getStorage().bucket();
  }

  public async upload(video: Video): Promise<boolean> { 
    const id = video.getId();
    fs.writeFileSync(`${id}.${video.getFileExtension()}`, video.getDataBuffer());

    const uploadResult = await this.bucket.upload(`${id}.${video.getFileExtension()}`);
    
    if (uploadResult) {
      fs.rmSync(`${id}.${video.getFileExtension()}`);

      return true;
    } else {
      return false;
    }
  }

  public async download(id: string): Promise<Video> {    
    const bucketFiles = await this.bucket.getFiles();
    if (!bucketFiles) throw new Error('An error occured while retrieving the files from the bucket');

    const videoFile = await this.findFileInBucketWithAllPossibleExtensions(id);
    if (videoFile) { 
      this.logger.logToBoth(
        `Downloading video with id ${id} from the bucket`,
        LogLevel.INFO
      );

      return await this.getVideoFromBucket(videoFile);
    } else {
      this.logger.logToBoth(
        `The video with id ${id} does not exist`,
        LogLevel.ERROR
      );

      throw new SemanticError(`The requested video with id ${id} does not exist`);
    }
  }

  public async downloadAll(): Promise<Video[]> { 
    let videos: Video[] = [];
    
    const bucketFiles = await this.bucket.getFiles();
    if (!bucketFiles) throw new Error('An error occured while retrieving the files from the bucket');

    const videoFiles = bucketFiles[0];
    if (videoFiles && videoFiles.length > 0) { 
      this.logger.logToBoth(
        `Downloading all videos from the bucket`,
        LogLevel.INFO
      );

      for (let i = 0; i < videoFiles.length; i++) { 
        videos.push(await this.getVideoFromBucket(videoFiles[i]));
      }

      return videos;
    } else {
      this.logger.logToBoth(
        `No videos exist in the bucket`,
        LogLevel.WARNING
      );
      throw new SemanticError(`No videos exist in the bucket`);
    }
  }

  public async delete(id: string): Promise<boolean> { 
    const bucketFiles = await this.bucket.getFiles();
    if (!bucketFiles) throw new Error('An error occured while retrieving the files from the bucket');

    const videoFile = await this.findFileInBucketWithAllPossibleExtensions(id);

    if (videoFile) { 
      const response = await this.bucket.file(videoFile.metadata.name).delete();
      if (response[0].statusCode >= 200 && response[0].statusCode < 300) { 
        this.logger.logToBoth(
          `Deleted video with id ${id} from the bucket`,
          LogLevel.INFO
        );

        return true;
      } else {
        this.logger.logToBoth(
          `An error occured while deleting the video with id ${id} from the bucket`,
          LogLevel.ERROR
        );

        throw new SemanticError(`The video with id ${id} could not be deleted`);
      }
    } else {
      this.logger.logToBoth(
        `The video with id ${id} does not exist, so it cannot be deleted`,
        LogLevel.ERROR
      );

      throw new SemanticError(`The video with id ${id} does not exist`);
    }
  }

  private getVideoFromBucket = async (file: any): Promise<Video> => { 
    try {
      const fileName: string = file.metadata.name;
      const fileNameWithoutExtension = fileName.split('.')[0];
      const fileExtension = fileName.split('.')[1];
      const bucketFile = this.bucket.file(fileName);
      
      if (fileExtension != 'webm') throw new Error('The video file is not in the correct format');
      
      const videoData = Video.deserialize(
        await this.databaseManager.get(fileNameWithoutExtension, DBCollections.VIDEOS)
      );

      if (!videoData) throw new Error('An error occured while deserializing the video');
        
      if (!fs.existsSync('./downloaded')) {
        fs.mkdirSync('./downloaded');
      };
  
      await bucketFile.download({
        destination: `./downloaded/${fileName}`
      });

      if (fs.existsSync(`./downloaded/${fileName}`)) { 
        
        const video = this.videoFactory.create(
          fs.readFileSync(`./downloaded/${fileName}`),
          fileExtension,
          videoData.getRecordingStartedTime(),
          videoData.getRecordingEndedTime(),
          videoData.getId()
        );

        fs.rmSync(`./downloaded/`, { recursive: true });

        return video;
      }
  
      throw new Error(`The file with id ${fileNameWithoutExtension} could not be downloaded`);
    } catch (error) {
      this.logger.logToBoth(
        `An error occured while downloading the video with id ${file.metadata.name} from the bucket`,
        LogLevel.ERROR
      );

      throw new Error(`The file with id ${file.metadata.name} could not be downloaded`);
    }
  }

  private findFileInBucketWithAllPossibleExtensions = async (id: string) => { 
    let resultFile;
    const bucketFiles = await this.bucket.getFiles();
    if (!bucketFiles) throw new Error('The bucket could not be retrieved');
    

    for (let extension of ['webm']) {
      if (!resultFile) {
        resultFile = bucketFiles[0].find((file) => file.metadata.name === `${id}.${extension}`);
      }
    }

    if (!resultFile) throw new Error('No file with the requested id and a vaild file extension was found'); 
    return resultFile;
  }
}
