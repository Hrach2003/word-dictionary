import { Router, Request, Response } from "express";
import { authMiddleware } from "../helpers/authMiddleware";
import { WordModel } from "../models/word.model";
import { UserModel, IUser } from "../models/user.model";

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const req_user = req.user as IUser

  const user = await UserModel.findOne({ google_id: req_user.google_id })
    .populate('words', 'word')
  return res.json({ user });
}) 

router.get('/add-word/:word', async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser
    const wordParam = req.params.word
    const word = await WordModel.findOne({ word: wordParam })
    if(word) {
      await UserModel.findOneAndUpdate({ google_id: user.google_id }, { $addToSet: { words: word } })
      const newUserWordSet = await UserModel.findOne({ google_id: user.google_id })
        .populate('words', 'word')

      return res.json({ words: newUserWordSet?.words })
    }
  } catch (error) { 
    return res.json({ message: error.message })
  }    
});

router.get('/words', async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser
    const newUserWordSet = await UserModel.findOne({ google_id: user.google_id })
      .populate('words', 'word')
    return res.json({ words: newUserWordSet?.words })
  } catch (error) { 
    return res.json({ message: error.message })
  }    
})


export { router }      