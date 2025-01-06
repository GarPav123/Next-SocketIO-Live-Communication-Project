"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const trpc_1 = require("./trpc");
const zod_1 = require("zod");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.appRouter = (0, trpc_1.router)({
    getUserMessages: trpc_1.publicProcedure
        .input(zod_1.z.string())
        .query(async ({ input: userId }) => {
        const userMessages = await schema_1.db
            .select()
            .from(schema_1.messages)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.messages.sender, userId), (0, drizzle_orm_1.eq)(schema_1.messages.recipient, userId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.messages.created_at));
        return userMessages;
    }),
    getConversation: trpc_1.publicProcedure
        .input(zod_1.z.object({
        user1: zod_1.z.string(),
        user2: zod_1.z.string(),
    }))
        .query(async ({ input }) => {
        const conversation = await schema_1.db
            .select()
            .from(schema_1.messages)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.messages.sender, input.user1), (0, drizzle_orm_1.eq)(schema_1.messages.recipient, input.user2)), (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.messages.sender, input.user2), (0, drizzle_orm_1.eq)(schema_1.messages.recipient, input.user1))))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.messages.created_at));
        return conversation;
    }),
    sendMessage: trpc_1.publicProcedure
        .input(zod_1.z.object({
        sender: zod_1.z.string(),
        recipient: zod_1.z.string(),
        content: zod_1.z.string(),
    }))
        .mutation(async ({ input }) => {
        const newMessage = await schema_1.db
            .insert(schema_1.messages)
            .values({
            sender: input.sender,
            recipient: input.recipient,
            content: input.content,
        })
            .returning();
        return newMessage[0];
    }),
    getRecentMessages: trpc_1.publicProcedure
        .input(zod_1.z.object({
        limit: zod_1.z.number().default(50),
        offset: zod_1.z.number().default(0),
    }))
        .query(async ({ input }) => {
        const recentMessages = await schema_1.db
            .select()
            .from(schema_1.messages)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.messages.created_at))
            .limit(input.limit)
            .offset(input.offset);
        return recentMessages;
    }),
    deleteMessage: trpc_1.publicProcedure
        .input(zod_1.z.number())
        .mutation(async ({ input: messageId }) => {
        await schema_1.db.delete(schema_1.messages).where((0, drizzle_orm_1.eq)(schema_1.messages.id, messageId));
        return { success: true };
    }),
});
