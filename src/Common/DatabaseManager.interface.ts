import Savable from "./Savable.interface";
import { DBCollections } from "./DBCollections.enum";

export default interface DatabaseManager {
  save(object: Savable, dbCollection: DBCollections): Promise<boolean>;
  saveMany(objects: Savable[], dbCollection: DBCollections): Promise<boolean>;
  get(id: string, dbCollection: DBCollections): Promise<Savable>;
  getWithFilter(filter: any, dbCollection: DBCollections): Promise<Savable[]>;
  getMany(ids: string[], dbCollection: DBCollections): Promise<Savable[]>;
  getAll(dbCollection: DBCollections): Promise<Savable[]>;
  update(id: string, object: Savable, dbCollection: DBCollections): Promise<boolean>;
  delete(id: string, dbCollection: DBCollections): Promise<boolean>;
  deleteAll(dbCollection: DBCollections): Promise<boolean>;
}
