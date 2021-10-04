import { query as q } from "faunadb";
import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { fauna } from './../../../services/fauna';

export default NextAuth({
  theme: 'dark',
  debug: false,
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: "read:user"
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        await fauna.query(
          q.If(q.Exists(q.Match(q.Index('user_idx_email'), q.Casefold(email))),
            q.Get(q.Match(q.Index('user_idx_email'), q.Casefold(email))),
            q.Create(q.Collection('users'), { data: { email } }),
          ));
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  }
})