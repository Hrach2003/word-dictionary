import { Schema, model, Document } from 'mongoose';
import { ILanguage } from './language.model';

interface IWordDefenitionSchema extends Document {
  word: string,
  language: ILanguage['_id']  
}

interface IWordExamplesSchema extends Document {
  name: string
  year: number  
}

interface IWordSynonymsSchema extends Document {
  synonym: string  
}

export interface IWordSchema extends Document {
  word: string,
  language: ILanguage['_id'],
  examples: IWordExamplesSchema[],
  defenitions: IWordDefenitionSchema[],
  synonyms:  IWordSchema[],
  date: Date
}



const wordDefenitionSchema = new Schema<IWordDefenitionSchema>({
  word: {
    type: String,
    required: true
  },
  language: {
    type: Schema.Types.ObjectId,
    ref: "Language"
  }
}, { _id: false })



const wordExamplesSchema = new Schema<IWordExamplesSchema>({
  text: {
    type: String,
    required: true,
    maxlength: 2048
  },
  year: Number
}, { _id: false })


const wordSchema = new Schema({
  word: {
    type: String,
    required: true,
    unique: true,
    maxlength: 128,
    set: (word: string) => word.toLowerCase() 
  }, 
  language: {
    type: Schema.Types.ObjectId,
    ref: 'Language',
    required: true
  }, 
  examples: [wordExamplesSchema],
  synonyms: [{
    type: Schema.Types.ObjectId,
    ref: 'Word',
    required: true,
  }],
  defenitions: [wordDefenitionSchema],
  date: {
    type: Date,
    default: Date.now
  }
})

const WordModel = model<IWordSchema>("Word", wordSchema)
export { WordModel }