import { publicProcedure, router } from "./trpc";
import { z } from "zod";
import { messages, db } from "../db/schema";
import { eq, and, desc, or } from "drizzle-orm";

export const appRouter = router({
	getUserMessages: publicProcedure
		.input(z.string())
		.query(async ({ input: userId }) => {
			const userMessages = await db
				.select()
				.from(messages)
				.where(or(eq(messages.sender, userId), eq(messages.recipient, userId)))
				.orderBy(desc(messages.created_at));

			return userMessages;
		}),

	getConversation: publicProcedure
		.input(
			z.object({
				user1: z.string(),
				user2: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const conversation = await db
				.select()
				.from(messages)
				.where(
					or(
						and(
							eq(messages.sender, input.user1),
							eq(messages.recipient, input.user2),
						),
						and(
							eq(messages.sender, input.user2),
							eq(messages.recipient, input.user1),
						),
					),
				)
				.orderBy(desc(messages.created_at));

			return conversation;
		}),

	sendMessage: publicProcedure
		.input(
			z.object({
				sender: z.string(),
				recipient: z.string(),
				content: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const newMessage = await db
				.insert(messages)
				.values({
					sender: input.sender,
					recipient: input.recipient,
					content: input.content,
				})
				.returning();

			return newMessage[0];
		}),

	getRecentMessages: publicProcedure
		.input(
			z.object({
				limit: z.number().default(50),
				offset: z.number().default(0),
			}),
		)
		.query(async ({ input }) => {
			const recentMessages = await db
				.select()
				.from(messages)
				.orderBy(desc(messages.created_at))
				.limit(input.limit)
				.offset(input.offset);

			return recentMessages;
		}),

	deleteMessage: publicProcedure
		.input(z.number())
		.mutation(async ({ input: messageId }) => {
			await db.delete(messages).where(eq(messages.id, messageId));

			return { success: true };
		}),
});

export type AppRouter = typeof appRouter;
