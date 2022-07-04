export default interface IController<T, U> {
  create(modelObject: T): Promise<boolean>;
  get(id: U): Promise<T>;
  getWithFilter(filter: any): Promise<T[]>;
  getAll(): Promise<T[]>;
  update(oldModelObjectId: U, updatedModelObject: T): Promise<boolean>;
  delete(modelObjectId: U): Promise<boolean>;
}