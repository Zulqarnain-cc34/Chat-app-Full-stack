import { ReplyResponse } from "./Objecttypes/ReplyObjectTypes";
import { FORGOT_PASSWORD_PREFIX } from "./../constants";
import { User } from "../entities/User";
import {
    Arg,
    Ctx,
    Int,
    Mutation,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import argon2 from "argon2";
import { getConnection } from "typeorm";
import { COOKIE_NAME } from "../constants";
import { v4 } from "uuid";
import { sendEmail } from "../utils/sendEmail";
import { UserResponse } from "./Objecttypes/UserObject";
import { Reply } from "../entities/Reply";
import { isAuth } from "../middlewares/isAuth";
import { Post } from "../entities/Post";

@Resolver()
export class UserResolver {
    @Query(() => [User])
    async Users(@Ctx() {}: MyContext): Promise<User[]> {
        return User.find({});
    }

    @Query(() => User)
    async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
        if (!req.session.userId) {
            return undefined;
        }
        const user = await getConnection().query(`

            select u.email,
                json_build_object(
                    'id',r.id,
                    'Roomname',r."Roomname",
                    'updatedAt', r."updatedAt",
                    'createdAt', r."createdAt",
                    'adminId', r."adminId"
                ) room
            from
                public.user u
            inner join
                    rooms r on r."adminId" = u.id
        `);
        console.log(user);
        return user;
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
                            field: "Duplicate Key",
                            message: err.detail,
                        },
                    ],
                };
            }
        }
        //This will autologin the user when registering
        req.session.userId = user.id;
        console.log(req.session.userId);
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
            req.session.destroy((err: any) => {
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
    ): Promise<boolean> {
        const user = await User.findOne({ where: { email: email } });
        if (!user) {
            return true;
        }
        const token = v4();

        await redis.set(
            FORGOT_PASSWORD_PREFIX + token,
            user.id,
            "ex",
            1000 * 60 * 60 * 24
        );

        await sendEmail(
            email,
            `Click this link to rest your password ,the link will expire after one time use,if you didnot post this request than just ignore this link donot use it or else someoneelse can get access to your account
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

    @Mutation(() => ReplyResponse)
    @UseMiddleware(isAuth)
    async createComment(
        @Arg("postId", () => Int) postId: number,
        @Arg("text", () => String) text: string,
        @Ctx() { req }: MyContext
    ): Promise<ReplyResponse> {
        const { userId } = req.session;
        let reply;

        try {
            reply = await Reply.create({ userId, postId, text }).save();
            console.log(reply);
        } catch (error) {
            if (error.code === "23505") {
                return { errors: [{ field: "Error", message: error.detail }] };
            }
        }

        try {
            await getConnection().query(
                `
                update post
                set comments=comments+1
                where id=$1
            `,
                [postId]
            );
        } catch (error) {
            if (error.code === "23505") {
                return {
                    errors: [{ field: "Error", message: error.detail }],
                };
            }
        }

        return {
            replies: reply,
            success: [{ field: "Reply", message: "Succesfully created reply" }],
        };
    }
}
