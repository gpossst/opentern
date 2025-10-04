import { Polar } from "@polar-sh/sdk";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

export const GET = async (request: Request) => {
  const token = await convexAuthNextjsToken();

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const polarApi = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    server: "sandbox",
  });

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  convex.setAuth(token);
  const user = await convex.query(api.users.getUser);

  if (!user || !user.email || !user._id) {
    return new Response("User not found", { status: 404 });
  }

  let customerId = user.customerId;

  if (!customerId) {
    customerId = await polarApi.customers
      .create({
        email: user.email,
        externalId: user._id,
      })
      .then((customer) => customer.id);

    if (!customerId) {
      return new Response("Error creating customerId", { status: 500 });
    }

    await convex.mutation(api.users.addUserCustomerId, { customerId });
  }

  const checkoutSession = await polarApi.checkouts.create({
    successUrl: "http://localhost:3000/",
    externalCustomerId: customerId,
    products: ["0c90cf48-b881-43d4-8664-b9547fb1d4e9"],
  });

  if (!checkoutSession.url) {
    return new Response("Error creating checkout session", { status: 500 });
  }

  return new Response(checkoutSession.url, { status: 200 });
};
