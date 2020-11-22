import { FORGOT_PASSWORD_PREFIX } from "./../constants";
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
import { COOKIE_NAME } from "../constants";
import { v4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";

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
        console.log(req.query);
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
        if (username.includes("@")) {
            return {
                errors: [
                    {
                        field: "username",
                        message:
                            "username cannot have @ character because it is used in email format",
                    },
                ],
            };
        }
        if (!email.includes("@")) {
            return {
                errors: [
                    {
                        field: "email",
                        message:
                            "email format is incorrect,invalid not possible",
                    },
                ],
            };
        }
        if (email.length <= 2) {
            return {
                errors: [
                    {
                        field: "email",
                        message:
                            "invalid email name length too short not possible",
                    },
                ],
            };
        }
        if (password.length < 8) {
            return {
                errors: [
                    {
                        field: "password",
                        message:
                            "password length must be atleast 8 characters long",
                    },
                ],
            };
        }
        if (password.length > 100) {
            return {
                errors: [
                    {
                        field: "password",
                        message:
                            "password length must be not be above 100 characters long",
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
        return { user };
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
                        message: "the username or email doesnot exist",
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
                        message: "password doesn't match,incorrect password",
                    },
                ],
            };
        }

        req.session.userId = user.id;

        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email", () => String) email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return true;
        }
        const token = v4();

        await redis.set(
            FORGOT_PASSWORD_PREFIX + token,
            user.id,
            "ex",
            1000 * 60 * 60 * 24 * 3
        );

        await sendEmail(
            email,
            `Click this link to rest your password ,the link will expire after one time use
            <a href='http://localhost:3000/change-password/${token}'>Reset password</a>`
        );
        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("newPassword", () => String) newPassword: string,
        @Arg("token", () => String) token: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);

        if (newPassword.length < 8) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message:
                            "password length must be atleast 8 characters long",
                    },
                ],
            };
        }
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired",
                    },
                ],
            };
        }
        if (newPassword.length > 100) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message:
                            "password length must be not be above 100 characters long",
                    },
                ],
            };
        }

        const user = await User.findOne({ where: { id: parseInt(userId) } });

        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "User got deleted or no user",
                    },
                ],
            };
        }
        user.password = await argon2.hash(newPassword);
        user.save();
        //optional step to log user in after changing password
        req.session.userId = user.id;
        return { user };
    }
}
