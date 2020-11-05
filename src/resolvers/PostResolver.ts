import { Post } from './../entities/Post';
import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { getConnection } from 'typeorm';

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

    @Mutation(() => Post)
    async createpost(@Arg("title", () => String) title: string): Promise<Post> {
        let post;
        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Post)
                .values({
                    title: title
                })
                .returning("*")
                .execute();
            post = result.raw[0];
        } catch (err) {
            console.log(err);
        }
        return post;
    }

    @Mutation(() => Post)
    async updatepost(
        @Arg("id", () => Int) id: number,
        @Arg("title", () => String, { nullable: true }) title: string
    ): Promise<Post | undefined> {
        const post = Post.findOne(id);
        if (!post) {
            return undefined;
        }
        if (typeof title !== "undefined") {
            await Post.update({ id }, { title });
        }
        return post;
    }
    @Mutation(() => Boolean)
    async deletepost(@Arg("id", () => Int) id: number): Promise<boolean> {
        await Post.delete(id);
        return true;
    }
}
