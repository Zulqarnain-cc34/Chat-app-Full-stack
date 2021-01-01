import { Reply } from "../../entities/Reply";
import { ObjectType, Field } from "type-graphql";
import { FieldError, Success } from "./matchingtypes/FieldError";
@ObjectType()
export class ReplyResponse {
    @Field(() => [Success], { nullable: true })
    success?: Success[];

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => Reply, { nullable: true })
    replies?: Reply;
}
@ObjectType()
export class RepliesResponse {
    @Field(() => [Success], { nullable: true })
    success?: Success[];

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => [Reply], { nullable: true })
    replies?: Reply[];
}
