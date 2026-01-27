"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = require("../../config/prisma");
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        if (!email) {
            return done(new Error("No email found in Google profile"));
        }
        let user = yield prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = yield prisma_1.prisma.user.create({
                data: {
                    email,
                    name: profile.displayName,
                    avatarUrl: (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value,
                    accounts: {
                        create: {
                            provider: "google",
                            providerId: profile.id,
                            accessToken,
                            refreshToken,
                        },
                    },
                },
            });
        }
        else {
            // 3) Keep user updated with new data
            user = yield prisma_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    name: profile.displayName,
                    avatarUrl: (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value,
                },
            });
            // 4) Ensure account row exists
            yield prisma_1.prisma.account.upsert({
                where: {
                    provider_providerId: {
                        provider: "google",
                        providerId: profile.id,
                    },
                },
                update: {},
                create: {
                    provider: "google",
                    providerId: profile.id,
                    accessToken,
                    refreshToken,
                },
            });
        }
        return done(null, user);
    }
    catch (err) {
        return done(err, false);
    }
})));
exports.default = passport_1.default;
