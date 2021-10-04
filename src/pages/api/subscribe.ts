import { query as q } from "faunadb";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from 'next-auth/client';
import { fauna } from "../../services/fauna";
import { stripe } from './../../services/stripe';

type User = {
  ref: {
    id: string
  },
  data: {
    stripe_customer_id: string
  }
}

const stripeCheckout = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }

  const { user: { email } } = await getSession({ req });

  const user = await fauna.query<User>(q.Get(q.Match(q.Index('user_idx_email'), q.Casefold(email))));

  let stripe_customer_id = user.data.stripe_customer_id;

  if (!stripe_customer_id) {
    const stripeCustomer = await stripe.customers.create({
      email
    });

    stripe_customer_id = stripeCustomer.id;
    await fauna.query(
      q.Update(q.Ref(q.Collection('users'), user.ref.id), {
        data: {
          stripe_customer_id: stripeCustomer.id
        }
      })
    );
  }

  const stripeCheckoutSession = await stripe.checkout.sessions.create({
    customer: stripe_customer_id,
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    line_items: [
      { price: 'price_1JggDvA20WLURWA23dPkJTBW', quantity: 1 }
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: process.env.STRIPE_SUCCESS_URL,
    cancel_url: process.env.STRIPE_CANCEL_URL,
  });

  return res.status(200).json({ sessionId: stripeCheckoutSession.id });
}

export default stripeCheckout;