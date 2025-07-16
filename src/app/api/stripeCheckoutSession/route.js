import Stripe from "stripe";
import { corsHeaders } from "../../../../libs/corsHeader";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = await req.json();
  const { amount } = data;
  console.log(amount)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in cents
      currency: "usd",
    });
   return new NextResponse(
     JSON.stringify({
       client_secret: paymentIntent?.client_secret,
     }),
     {
       status: 200,
       headers: {
         ...corsHeaders,
         "Content-Type": "application/json",
       },
     }
   );

  } catch (err) {
    console.error("Error creating PaymentIntent:", err);
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
}

// Handle CORS preflight
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
