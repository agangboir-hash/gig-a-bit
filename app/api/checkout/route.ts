import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    apiVersion: "2026-01-28.clover" as any,
});

export async function POST(req: Request) {
    try {
        const { event, userId } = await req.json();

        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn("Stripe Secret Key missing. Simulating success for dev environment or returning error.");
            // For development/demo purposes without keys, we might return a mock URL or error.
            // But for "Production-ready", we return error if missing.
            return NextResponse.json({ error: "Stripe Setup Incomplete" }, { status: 500 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: event.title,
                            images: event.imageUrl ? [event.imageUrl] : [],
                            metadata: {
                                eventId: event.id
                            }
                        },
                        unit_amount: Math.round(event.price * 100), // cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/events/${event.id}?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/events/${event.id}?payment=cancelled`,
            metadata: {
                eventId: event.id,
                userId: userId,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Stripe error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
