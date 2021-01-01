"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyResolver = void 0;
const Reply_1 = require("../entities/Reply");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middlewares/isAuth");
let ReplyResolver = class ReplyResolver {
    Replies() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Reply_1.Reply.find({});
        });
    }
    getReply(postId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Reply_1.Reply.find({
                where: { postId, userId: req.session.userId },
            });
        });
    }
    hitlike(liked, postId, id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedResult;
            try {
                updatedResult = yield Reply_1.Reply.update({ id: id, userId: req.session.userId, postId: postId }, { liked: !liked });
            }
            catch (err) {
                if (err) {
                    console.log(err);
                    return false;
                }
            }
            if ((updatedResult === null || updatedResult === void 0 ? void 0 : updatedResult.affected) === 0) {
                throw new Error("updating likes unsuccessful");
            }
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => [Reply_1.Reply]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReplyResolver.prototype, "Replies", null);
__decorate([
    type_graphql_1.Query(() => [Reply_1.Reply]),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("postId", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReplyResolver.prototype, "getReply", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("liked", () => Boolean)),
    __param(1, type_graphql_1.Arg("postid", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Arg("id", () => String)),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ReplyResolver.prototype, "hitlike", null);
ReplyResolver = __decorate([
    type_graphql_1.Resolver()
], ReplyResolver);
exports.ReplyResolver = ReplyResolver;
//# sourceMappingURL=ReplyResolver.js.map