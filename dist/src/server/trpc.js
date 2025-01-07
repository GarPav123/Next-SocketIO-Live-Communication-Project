/* eslint-disable @typescript-eslint/no-require-imports */
// biome-ignore lint/suspicious/noRedundantUseStrict: <explanation>
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicProcedure = exports.router = void 0;
const server_1 = require("@trpc/server");
const t = server_1.initTRPC.create();
exports.router = t.router;
exports.publicProcedure = t.procedure;
