import { Reply } from "../entities/Reply";
import {
    Arg,
    Ctx,
    Int,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { isAuth } from "../middlewares/isAuth";
import { MyContext } from "../types";
import { User } from "../entities/User";
import GraphQLUUID from "graphql-type-uuid";

@Resolver()
export class ReplyResolver {
    @Query(() => [Reply])
    async Replies(): Promise<Reply[]> {
        return await Reply.find({});
    }

    @Query(() => [Reply])
    @UseMiddleware(isAuth)
    async getReply(
        @Arg("postId", () => Int) postId: string,
        @Ctx() { req }: MyContext
    ): Promise<Reply[]> {
        return await Reply.find({
            where: { postId, userId: req.session.userId },
        });
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async hitlike(
        @Arg("liked", () => Boolean) liked: boolean,
        @Arg("postid", () => Int) postId: number,
        @Arg("id", () => String) id: typeof GraphQLUUID,
        @Ctx() { req }: MyContext
    ): Promise<Boolean> {
        let updatedResult;
        try {
            updatedResult = await Reply.update(
                { id: id, userId: req.session.userId, postId: postId },
                { liked: !liked }
            );
        } catch (err) {
            if (err) {
                console.log(err);
                return false;
            }
        }
        if (updatedResult?.affected === 0) {
            throw new Error("updating likes unsuccessful");
        }
        return true;
    }
}
