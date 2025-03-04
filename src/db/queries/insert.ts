import { db } from "../db";
import { InsertUser, SelectUser, User } from "../schema";

export async function createUser(data: InsertUser): Promise<Array<SelectUser>> {
  return await db.insert(User).values(data).returning();
}
