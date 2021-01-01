import { isAuth } from "./../middlewares/isAuth";
import { Rooms } from "../entities/Rooms";
import { UsersID } from "../entities/UsersID";
import {
    Arg,
    Ctx,
    Query,
    Mutation,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { getConnection } from "typeorm";
import { User } from "../entities/User";
import {
    RoomResponse,
    RoomsResponse,
    boolRoomResponse,
} from "./Objecttypes/RoomsObject";
@Resolver(Rooms)
export class UsersIdresolver {
    @Query(() => [UsersID])
    async getUsersId(): Promise<UsersID[]> {
        return await UsersID.find({});
    }
}

@Resolver(Rooms)
export class RoomResolver {
    @Query(() => [Rooms])
    async Rooms(): Promise<Rooms[]> {
        return await Rooms.find({});
    }

    @Query(() => RoomsResponse)
    @UseMiddleware(isAuth)
    async getRooms(
        //@Arg("limit", () => Int) limit: number,
        //@Arg("cursor", () => String, { nullable: true }) cursor: string | null,
        //@Arg("ids", () => Int) ids: number,
        @Ctx() { req }: MyContext
    ): Promise<RoomsResponse> {
        //const replacements: any[] = [];
        //let reallimit;
        //replacements.push(req.session.userId);

        //if (cursor) {
        //    replacements.push(new Date(parseInt(cursor)));
        //}
        //if (limit) {
        //    reallimit = limit % 50;
        //}
        //replacements.push(reallimit);
        //replacements.push(ids);
        //let arraymaker: any[] = [];
        //const user = await User.findOne({
        //    where: { id: req.session.userId },
        //});
        //const rooms = await getConnection().query(
        //    `
        //    select
        //        r.*,
        //        json_build_object(
        //            'id', u.id,
        //            'roomid',u.roomid,
        //            'userid', u.userid
        //        ) users
        //    from
        //        rooms r
        //    inner join users_id u on 6=r."adminId"

        //`
        //);
        const rooms = await getConnection()
            .getRepository(Rooms)
            .createQueryBuilder("r")
            .leftJoinAndSelect("r.users", "users_id")

            .getMany();
        console.log(rooms);
        //const roomOne = await Rooms.findOne({ where: { id: ids } });

        //const rooms: Rooms = await createQueryBuilder("rooms")
        //    .innerJoinAndSelect("rooms.users", "room")
        //    .where("user.email=:email", { email: "powerranger16918@gmail.com" })
        //    .getOne();
        //const rooms = await getConnection()
        //    .getRepository(Rooms)
        //    .createQueryBuilder("r")
        //    //.where("u.email=:email", { email: "powerranger16918@gmail.com" })
        //    .innerJoinAndSelect("r.users", "u", "u.id=2")
        //    .limit(reallimit)
        //    .getMany();
        //`

        //console.log(rooms);
        //select r.* from rooms
        //select json_object_build(
        //    'id', u.id,
        //    'createdAt', u."createdAt",
        //    'updatedAt', u."updatedAt",
        //    'username', u.username,
        //    'email', u.email
        //    )
        //FROM rooms
        //inner join public.r
        //from user.roomsjoined)=u.id

        //const rooms = await Rooms.find({
        //    where: { adminId: req.session.userId },
        //});
        //if (rooms === []) {
        //    return {
        //        errors: [
        //            {
        //                field: "RoomCreation",
        //                message: "You dont have a Group yet,No rooms found",
        //            },
        //        ],
        //    };
        //}
        return {
            rooms: rooms,
            success: [{ field: "Rooms", message: "Rooms successfully found" }],
        };
    }

    @Mutation(() => boolRoomResponse)
    @UseMiddleware(isAuth)
    async updateRoom(
        @Arg("prevname", () => String) prevname: string,
        @Arg("newname", () => String) newname: string,

        @Ctx() { req }: MyContext
    ): Promise<boolRoomResponse> {
        const user = await User.findOne({ where: { id: req.session.userId } });

        if (newname.length > 100) {
            return {
                errors: [
                    {
                        field: "RoomName",
                        message: "Name is too long more than 100 characters",
                    },
                ],
            };
        }

        if (!user) {
            return {
                errors: [
                    {
                        field: "User",
                        message: "User doesnot exist",
                    },
                ],
            };
        }
        try {
            const updateResult = await Rooms.update(
                { adminId: user.id, Roomname: prevname },
                { Roomname: newname }
            );

            if (updateResult.affected === 1) {
                return {
                    updated: true,
                    success: [
                        {
                            field: "RoomName",
                            message: "Succesfully updated Roomname",
                        },
                    ],
                };
            }
        } catch (error) {
            if (error.code === "23505") {
                return {
                    errors: [
                        {
                            field: "Duplicate name",
                            message: error.detail,
                        },
                    ],
                };
            } else {
                return {
                    errors: [
                        {
                            field: "Error",
                            message: error.detail,
                        },
                    ],
                };
            }
        }

        return {
            errors: [
                {
                    field: "RoomName",
                    message: "Unsuccessful,Room name not updated",
                },
            ],
        };
    }
    @Mutation(() => boolRoomResponse)
    async deleteRoom(
        @Arg("name", () => String) name: string,
        @Ctx() { req }: MyContext
    ): Promise<boolRoomResponse> {
        const deleteResult = await Rooms.delete({
            adminId: req.session.userId,
            Roomname: name,
        });

        if (deleteResult.affected == 1) {
            return {
                updated: true,
                success: [
                    { field: "Rooms", message: "Room deleted successfully" },
                ],
            };
        }

        return {
            errors: [{ field: "Rooms", message: "Room deletion unsuccessful" }],
        };
    }
    @Mutation(() => boolRoomResponse)
    @UseMiddleware(isAuth)
    async joinRoom(
        @Arg("name", () => String) name: string,
        @Ctx() { req }: MyContext
    ): Promise<boolRoomResponse> {
        const user = await User.findOne({ where: { id: req.session.userId } });
        if (!user) {
            return {
                errors: [
                    {
                        field: "User",
                        message: "no user found,the user doesnot exist",
                    },
                ],
            };
        }
        const room = await Rooms.findOne({ where: { Roomname: name } });
        if (!room) {
            return {
                errors: [
                    {
                        field: "Rooms",
                        message: "No room with that name exists",
                    },
                ],
            };
        }
        //console.log("user :", user);
        //console.log("room :", room);

        try {
            const userfound = await UsersID.findOne({
                where: { userid: req.session.userId },
            });
            console.log(userfound);
            if (userfound) {
                return {
                    updated: false,
                    errors: [
                        {
                            field: "User",
                            message: "User is already a member of the room",
                        },
                    ],
                };
            } else {
                const userid = await UsersID.create({
                    userid: req.session.userId,
                    roomid: room?.id,
                });
                userid.save();
                console.log(userid);
            }
        } catch (error) {
            if (error.code === "23505") {
                return {
                    updated: false,
                    errors: [
                        {
                            field: "Duplicate name",
                            message: error.detail,
                        },
                    ],
                };
            } else {
                return {
                    updated: false,
                    errors: [
                        {
                            field: "Error",
                            message: error.detail,
                        },
                    ],
                };
            }
        }
        return {
            updated: true,
            success: [{ field: "Rooms", message: "person joined" }],
        };
    }
    @Mutation(() => RoomResponse)
    async createRoom(
        @Arg("name", () => String) name: string,
        @Ctx() { req }: MyContext
    ): Promise<RoomResponse> {
        if (name.length > 100) {
            return {
                errors: [
                    {
                        field: "Name",
                        message: "Name is too long more than 100 characters",
                    },
                ],
            };
        }

        const user = await User.findOne({ where: { id: req.session.userId } });
        if (!user) {
            return {
                errors: [
                    {
                        field: "User",
                        message: "User doesnot exist",
                    },
                ],
            };
        }

        if (req.session.userId != undefined) {
            let room;
            try {
                const result = await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(Rooms)
                    .values({
                        Roomname: name,
                        adminId: req.session.userId,
                    })
                    .returning("*")
                    .execute();

                const useridResult = await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(UsersID)
                    .values({
                        userid: req.session.userId,
                        roomid: result.raw[0].id,
                    })
                    .returning("*")
                    .execute();
                console.log(useridResult.raw[0]);
                room = result.raw[0];
                console.log(room);
            } catch (error) {
                if (error.code === "23505") {
                    return {
                        errors: [
                            {
                                field: "Duplicate name",
                                message: error.detail,
                            },
                        ],
                    };
                } else {
                    return {
                        errors: [{ field: "Error", message: error.detail }],
                    };
                }
            }

            return { rooms: room };
        }

        return {
            errors: [
                {
                    field: "RoomCreation",
                    message:
                        "Room unable to create because user is not logged in",
                },
            ],
        };
    }
}
