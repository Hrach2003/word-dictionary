import { authMiddleware } from './../helpers/authMiddleware';
import { Router, Request, Response } from "express";
import { LanguageModel } from '../models/language.model'
import { wordQueryByLang } from "../controllers/wordSearch";
const router = Router()

router.get('/', (req: Request, res: Response) => {
  return res.json({ user: req.user })
  LanguageModel.find({})
    .exec((err, languages) => {
      if(err) return res.json({ message: err.message })
      return res.json({ languages })
    })
})

router.get('/:_id', (req: Request, res: Response) => {
  const _id = req.params._id
  LanguageModel.findById(_id)
    .exec((err, language) => {
      if(err) return res.json({ message: err.message })
      return res.json({ language })
    })
})

router.get('/:_id/words', wordQueryByLang)

export { router }