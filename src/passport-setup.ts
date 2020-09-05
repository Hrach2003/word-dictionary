import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import { UserModel, IUser } from './models/user.model';

passport.serializeUser((user: IUser, done) => {
  done(null, user.google_id);
});

passport.deserializeUser((id: string, done) => {
  UserModel.findOne({ google_id: id }, done)
});


passport.use(new GoogleStrategy.Strategy({
    clientID: "153601049971-k6g4ma52i594sg02lu9og5n5abklhfar.apps.googleusercontent.com",
    clientSecret: "nCyfejce2O2pvslp_TnlYXZK",
    callbackURL: "/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    UserModel.findOne({ google_id: profile.id }, async (err, existedUser) => {
      if(err) return done(err, false)
      if(existedUser) return done(err, existedUser)
      try {
        const user = new UserModel({
          username: profile.displayName,
          picture: profile._json.picture,
          google_id: profile.id,
          email: profile._json.email
        } as IUser)
        await user.save()
        return done(undefined, user);
      } catch (error) {
        return done(error, false);
      }
    })
  }
));