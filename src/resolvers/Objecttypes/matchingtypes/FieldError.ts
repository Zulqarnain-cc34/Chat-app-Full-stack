import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class FieldError {
    @Field(() => String, { nullable: true })
    field: String;

    @Field(() => String, { nullable: true })
    message: String;
}

@ObjectType()
export class Success {
    @Field(() => String, { nullable: true })
    field: String;

    @Field(() => String, { nullable: true })
    message: String;
}
