import GraphQLUUID from "graphql-type-uuid";
import { Field, ID, ObjectType } from "type-graphql";
import {
    Entity,
    Column,
    BaseEntity,
    ManyToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Reply extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn({ type: "uuid" })
    id: typeof GraphQLUUID;

    @Field()
    @Column()
    text!: String;

    @Field(() => Boolean)
    @Column({ default: false })
    liked: boolean;

    @Field(() => ID)
    @PrimaryColumn()
    userId: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.replies)
    user: User;

    @Field(() => ID)
    @PrimaryColumn()
    postId: number;

    @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.replies)
    post: Post;
}
