export default interface Savable {
  getId(): string;
  serialize(): { [key: string]: any };
}
