import { Router, Request, Response } from "express";
import passport from "passport";
import { authMiddleware } from "../helpers/authMiddleware";

const router = Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (_req: Request, res: Response) => {
    // Successful authentication, redirect home.
    console.log('logged in')
    res.redirect('http://localhost:3000');
  });

router.get('/logout', (req: Request, res: Response) => {
  req.logout()
  console.log('logged out')
  res.redirect('/words')
})

router.get('/')

export { router }      