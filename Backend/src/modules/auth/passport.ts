import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../../config/prisma";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error("No email found in Google profile"));
        }
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0].value,
              accounts: {
                create: {
                  provider: "google",
                  providerId: profile.id,
                  accessToken,
                  refreshToken,
                },
              },
            },
          });
        } else {
          // 3) Keep user updated with new data
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
            },
          });

          // 4) Ensure account row exists
          await prisma.account.upsert({
            where: {
              provider_providerId: {
                provider: "google",
                providerId: profile.id,
              },
            },
            update: {
              accessToken,
              refreshToken,
            },
            create: {
              provider: "google",
              providerId: profile.id,
              accessToken,
              refreshToken,
              userId: user.id,
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err as Error, false);
      }
    },
  ),
);

export default passport;
