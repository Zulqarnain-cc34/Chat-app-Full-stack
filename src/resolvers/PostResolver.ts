import { Post } from "./../entities/Post";
import {
    Arg,
    Ctx,
    Int,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { MyContext } from "../types";
import { isAuth } from "../middlewares/isAuth";

@Resolver(Post)
export class PostResolver {
    @Query(() => Post, { nullable: true })
    async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    @Query(() => [Post])
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<Post[]> {
        const reallimit = Math.min(50, limit);

        const replacements: any[] = [];
        replacements.push(reallimit);

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        const posts = await getConnection().query(
            `
            select p.*,
            json_build_object(
                'id', u.id,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt",
                'username', u.username,
                'email', u.email
                ) creator
            from post p
            inner join public.user u on u.id=p.creatorid
            ${cursor ? `where p."createdAt"< $2` : ""}
            order by "createdAt" DESC
            limit $1
        `,
            replacements
        );
        return posts;
    }

    //@Subscription(() => Post, {
    //    topics: "CREATE POST",
    //    filter: ({ payload }) => payload,
    //})
    //async getPost(

    //): Promise<Post | undefined> { }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createpost(
        @Arg("message", () => String) message: string,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        let post;
        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Post)
                .values({
                    message: message,
                    creatorid: req.session.userId,
                })
                .returning("*")
                .execute();
            post = result.raw[0];
            //const payload = post;
            //await pubSub.publish("CREATE POST", payload);
        } catch (err) {
            console.log(err);
        }
        return post;
    }

    //@Mutation(() => [User], { nullable: true })
    //async getreaderinfo(@Ctx() { req }: MyContext): Promise<User[] | null> {
    //    const users = await User.find({ where: { id: req.session.userId } });
    //    console.log(users);
    //    if (!users) {
    //        return null;
    //    }
    //    return users;
    //}

    @Mutation(() => Post)
    async updatepost(
        @Arg("id", () => Int) id: number,
        @Arg("message", () => String, { nullable: true }) message: string
    ): Promise<Post | undefined> {
        const post = Post.findOne(id);
        if (!post) {
            return undefined;
        }
        if (typeof message !== "undefined") {
            await Post.update({ id }, { message });
        }
        return post;
    }

    @Mutation(() => Boolean)
    async deletepost(@Arg("id", () => Int) id: number): Promise<boolean> {
        await Post.delete(id);
        return true;
    }
}
