import Video from "../Models/Video";

export default interface VideoHostManager {
  upload(video: Video): Promise<boolean>;
  download(id: string, experimentNumber: number): Promise<Video>;
  downloadAll(): Promise<Video[]>;
  delete(id: string, experimentNumber: number): Promise<boolean>; 
}
