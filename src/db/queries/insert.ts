import { db } from "../db";
import { InsertUser, User } from "../schema";

export async function createUser(data: InsertUser) {
  await db.insert(User).values(data);
}
