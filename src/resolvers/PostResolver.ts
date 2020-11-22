import { Post } from "./../entities/Post";
import { Arg, Int, Mutation, PubSub, Query, Resolver } from "type-graphql";
import { getConnection } from "typeorm";
import { PubSubEngine } from "graphql-subscriptions";

@Resolver(Post)
export class PostResolver {
    @Query(() => Post, { nullable: true })
    async post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }
    @Query(() => [Post], { nullable: true })
    posts(): Promise<Post[] | undefined> {
        return Post.find({});
    }

    //@Subscription(() => Post, {
    //    topics: "CREATE POST",
    //    filter: ({ payload }) => payload,
    //})
    //async getPost(

    //): Promise<Post | undefined> { }

    @Mutation(() => Post)
    async createpost(
        @Arg("content", () => String) content: string,

        @PubSub() pubSub: PubSubEngine
    ): Promise<Post> {
        let post;
        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Post)
                .values({
                    content: content,
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

    @Mutation(() => Post)
    async updatepost(
        @Arg("id", () => Int) id: number,
        @Arg("content", () => String, { nullable: true }) content: string
    ): Promise<Post | undefined> {
        const post = Post.findOne(id);
        if (!post) {
            return undefined;
        }
        if (typeof content !== "undefined") {
            await Post.update({ id }, { content });
        }
        return post;
    }

    @Mutation(() => Boolean)
    async deletepost(@Arg("id", () => Int) id: number): Promise<boolean> {
        await Post.delete(id);
        return true;
    }
}
