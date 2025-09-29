// src/app/api/webhook/polar/route.ts
import { Webhooks } from "@polar-sh/nextjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionCreated: async (subscription) => {
    const userId = subscription.data.customer.externalId;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    if (!userId) {
      return;
    }

    await convex.mutation(api.users.setUserSubscription, {
      userId: userId as Id<"users">,
      status: subscription.data.status,
    });
  },
  onSubscriptionUpdated: async (subscription) => {
    const userId = subscription.data.customer.externalId;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    if (!userId) {
      return;
    }

    await convex.mutation(api.users.setUserSubscription, {
      userId: userId as Id<"users">,
      status: subscription.data.status,
    });
  },
  onCustomerDeleted: async (customer) => {
    const userId = customer.data.externalId;
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    if (!userId) {
      return;
    }

    await convex.mutation(api.users.deleteUserCustomerId, {
      userId: userId as Id<"users">,
    });
  },
});
