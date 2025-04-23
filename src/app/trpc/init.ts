import { db } from "@/db"
import { users } from "@/db/schema"
import { ratelimit } from "@/lib/ratelimit"
import { auth } from "@clerk/nextjs/server"
import { initTRPC, TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { cache } from "react"
import superjson from "superjson"

export const createTRPCContext = cache(async () => {
  const { userId } = await auth()
  console.log("userId", userId)
  return { clerkUserId: userId }
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const publicProcedure = t.procedure;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts
  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  console.log("ctx.clerkUserId", ctx.clerkUserId)
  const [user] = await db.select().from(users).where(eq(users.clerkId, ctx.clerkUserId)).limit(1)
  if (!user) {
    console.log("UNAUTHORIZED - user", user)
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  const { success } = await ratelimit.limit(ctx.clerkUserId)
  if (!success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
  }
  return opts.next({
    ctx: {
      ...ctx,
      user: {
        uid: user.id,
      },
    },
  })
})

