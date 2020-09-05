import { Schema, model, Document } from 'mongoose';

export interface ILanguage extends Document {
  name: string
}

const languageSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }, 
})


const LanguageModel = model<ILanguage>("Language", languageSchema)
export { LanguageModel }