const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./../model/User');

module.exports = (passport) => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/auth/google/callback'
            },
            async(accessToken, refreshToken, profile, cb) => {
                const newUser = {
                    id: profile.id,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: profile.photos[0].value
                }
                // User.findOrCreate({ googleId: profile.id }, (err, user) => {
                //     return cb(err, user);
                //   });

                // save profile data in mongodb
                try {
                    let user = await User.findOne({ googleId: profile.id })
                    if(user) {
                        cb(null, user)
                    }
                    else {
                        user = await User.create(newUser)
                        cb(null, user)
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        )
    );
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    })
}