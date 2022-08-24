export const getDbConnectionString = () => {
  return `mongodb+srv://${process.env.MONGO_ATLAS_USERNAME}:${process.env.MONGO_ATLAS_PASSWORD}@${process.env.MONGO_ATLAS_DB_NAME}.${process.env.MONGO_SERVER_ID}.mongodb.net/?retryWrites=true&w=majority`
}
