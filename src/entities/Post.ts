import { Field, ID, ObjectType } from "type-graphql";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
} from "typeorm";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @CreateDateColumn({ type: "date" })
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = Date();

    @Field(() => String)
    @Column()
    content!: string;
}
