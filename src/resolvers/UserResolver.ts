import { User } from "../entities/User";
import {
    Arg,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver,
} from "type-graphql";
import { MyContext } from "../types";
import argon2 from "argon2";
import { getConnection } from "typeorm";

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}
@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@Resolver()
export class UserResolver {

    @Query(() => [User])
    async Users(@Ctx() { req }: MyContext): Promise<User[]> {
        console.log(req.query)
        return User.find();
    }


    @Query(() => User, { nullable: true })
    async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
        if (!req.session.userId) {
            return undefined;
        }
        return User.findOne(req.session.userId);
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg("username") username: string,
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {

        if (username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "username length too short it is not possible",
                    },
                ],
            };
        }
        if (username.includes('@')) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "username cannot have @ character because it is used in email format",
                    },
                ],
            };
        }
        if (!email.includes("@")) {
            return {
                errors: [
                    {
                        field: "email",
                        message: "email format is incorrect,invalid not possible",
                    },
                ],
            };
        }
        if (email.length <= 2) {
            return {
                errors: [
                    {
                        field: "email",
                        message: "invalid email name length too short not possible",
                    },
                ],
            };
        }
        if (password.length <= 2) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "password length must be atleast 2 characers long",
                    },
                ],
            };
        }
        let user;
        const HashedPassword = await argon2.hash(password);
        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    username: username,
                    email: email,
                    password: HashedPassword,
                })
                .returning("*")
                .execute();
            user = result.raw[0];
        } catch (err) {
            if (err.code === "23505") {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "Username is already taken",
                        },
                    ],
                };
            }
        }
        //This will autologin the user when registering
        req.session.userId = user.id;
        return { user, };
    }


    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameorEmail") usernameorEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {

        const user = await User.findOne(
            usernameorEmail.includes("@")
                ? { where: { email: usernameorEmail } }
                : { where: { username: usernameorEmail } }
        );

        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameorEmail",
                        message: "the username and email doesnot exist",
                    },
                ],
            };
        }
        const valid = await argon2.verify(user.password, password);

        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password",
                    },
                ],
            };
        }

        req.session.userId = user.id;

        return {
            user,
        };
    }

    //@Mutation(() => Boolean)
    //async logout(@Ctx() { req }: MyContext): Promise<boolean> {
    //    const user = await User.findOne(
    //        req.session.userId,
    //    );
    //    if (!user) {
    //        return false;
    //    }

    //    req.session.userId = null;
    //    return true;
    //}

    //@Mutation(() => User, { nullable: true })
    //async ForgotPassword(
    //  @Arg("id") id: number,
    //  @Arg("username", () => String, { nullable: true }) username: string,
    //  @Ctx() { em }: MyContext
    //): Promise<User | null> {
    //  const user = await em.findOne(User, { id });
    //  if (!user) {
    //    return null;
    //  }
    //  if (username) {
    //    user.username = username;
    //  }
    //  return user;
    //}

    //@Mutation(() => Boolean)
    //async deleteUser(
    //  @Arg("id") id: number,
    //  @Ctx() { em }: MyContext
    //): Promise<boolean> {
    //  await em.nativeDelete(User, { id });
    //  return true;
    //}
}
