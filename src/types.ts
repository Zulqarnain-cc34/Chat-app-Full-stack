import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
export type MyContext = {
    req: Request & { session: Express.Session };
    res: Response & { session: Express.Session };
}
