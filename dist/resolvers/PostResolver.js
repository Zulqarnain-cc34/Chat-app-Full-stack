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
exports.PostResolver = void 0;
const Post_1 = require("./../entities/Post");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const graphql_subscriptions_1 = require("graphql-subscriptions");
let PostResolver = class PostResolver {
    post(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return Post_1.Post.findOne(id);
        });
    }
    posts() {
        return Post_1.Post.find({});
    }
    createpost(content, pubSub) {
        return __awaiter(this, void 0, void 0, function* () {
            let post;
            try {
                const result = yield typeorm_1.getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(Post_1.Post)
                    .values({
                    content: content,
                })
                    .returning("*")
                    .execute();
                post = result.raw[0];
            }
            catch (err) {
                console.log(err);
            }
            return post;
        });
    }
    updatepost(id, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const post = Post_1.Post.findOne(id);
            if (!post) {
                return undefined;
            }
            if (typeof content !== "undefined") {
                yield Post_1.Post.update({ id }, { content });
            }
            return post;
        });
    }
    deletepost(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Post_1.Post.delete(id);
            return true;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => Post_1.Post, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    type_graphql_1.Query(() => [Post_1.Post], { nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post),
    __param(0, type_graphql_1.Arg("content", () => String)),
    __param(1, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, graphql_subscriptions_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createpost", null);
__decorate([
    type_graphql_1.Mutation(() => Post_1.Post),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("content", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatepost", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletepost", null);
PostResolver = __decorate([
    type_graphql_1.Resolver(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=PostResolver.js.map