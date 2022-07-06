import { Guid } from 'guid-typescript';
import { injectable } from 'tsyringe';
import Savable from '../Common/Savable.interface';
import validateGUID from '../Common/Util/GUIDValidator';
import DeserializationError from '../Errors/DeserializationError';

export interface IVideoFactory {
  create(data: Buffer, file_extension: '', recordingStartedTime: number, recordingEndedTime: number, id?: string): Video
}

@injectable()
export class VideoFactory implements IVideoFactory {
  public create = (data: Buffer, file_extension: '', recordingStartedTime: number, recordingEndedTime: number,  id?: string): Video => {
    return new Video(file_extension, data, recordingStartedTime, recordingEndedTime, id);
  }
} 

/**
 * Model class for a video. 
 * @param dataBuffer A buffer containing the video data.
 * @param file_extension The file extension of the video.
 * @param id the id of the video. The id is a GUID, which also serves as the filename.
 */
export default class Video implements Savable {
  private _id: string;
  private dataBuffer: Buffer;
  private file_extension: '';
  private recordingStartedTime: number;
  private recordingEndedTime: number;
  
  constructor(file_extension: '', dataBuffer: Buffer, recordingStartedTime: number, recordingEndedTime: number, id?: string) { 
    if (id && validateGUID(id)) {
      this._id = id
    } else {
      this._id = Guid.create().toString().toString();
    }
    this.file_extension = file_extension;
    this.dataBuffer = dataBuffer;
    this.recordingStartedTime = recordingStartedTime;
    this.recordingEndedTime = recordingEndedTime;
  }

  public getId() {
    return this._id;
  }

  public getFileExtension() { 
    return this.file_extension;
  }

  public getDataBuffer() {
    return this.dataBuffer;
  }

  public getRecordingStartedTime() {
    return this.recordingStartedTime;
  }

  public getRecordingEndedTime() {
    return this.recordingEndedTime;
  }

  public serialize() {
    return {
      _id: this._id.toString(),
      file_extension: this.file_extension,
      recordingStartedTime: this.recordingStartedTime,
      recordingEndedTime: this.recordingEndedTime
    };
  }

  public static deserialize(queryResult: any): Video {
    if (queryResult && queryResult._id && queryResult.file_extension && queryResult.recordingStartedTime && queryResult.recordingEndedTime) { 
      return new Video(
        queryResult.file_extension,
        Buffer.alloc(0),
        queryResult.recordingStartedTime,
        queryResult.recordingEndedTime,
        queryResult._id
      )
    }

    throw new DeserializationError("The provided query result is not a valid video.");
  }
}
