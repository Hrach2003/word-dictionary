import { Schema, model, Document } from 'mongoose';
import { IWordSchema } from './word.model';

export interface IAudio extends Document {
  word: IWordSchema["_id"],
  fileURL: string
}

const audioSchema = new Schema({
  word: {
    type: Schema.Types.ObjectId,
    ref: "Word",
    unique: true
  },
  fileURL: {
    type: String,
    required: true,
    unique: true
  }, 
})


const AudioModel = model<IAudio>("Audio", audioSchema)
export { AudioModel }