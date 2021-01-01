import { ObjectType, Field, ID } from "type-graphql";
import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    //ManyToOne,
    //ManyToMany,
    //JoinTable,
} from "typeorm";
//import { Rooms } from "./Rooms";

@ObjectType()
@Entity()
export class UsersID extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => ID)
    @Column()
    userid!: number;

    @Field(() => ID)
    @Column()
    roomid!: number;

    ////@Field(() => Rooms)
    //@ManyToMany(() => Rooms, (room) => room.users)
    //@JoinTable()
    //room: Rooms[];
}
