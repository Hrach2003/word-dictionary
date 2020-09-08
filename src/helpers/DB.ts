import mongoose from "mongoose"

export const connectToDB = (DB_uri: string): Promise<typeof mongoose | string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const DB = DB_uri || 'mongodb://localhost:27017/test' as string
      const DB_connection = await mongoose.connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      console.log('connected to DB')
      // mongoose.set('debug', process.env.NODE_ENV === "development" ? true : false)
      resolve(DB_connection)
    } catch(error) {
      reject(error.message)
    }
  }) 
}