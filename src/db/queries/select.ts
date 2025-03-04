import { asc, between, count, eq, getTableColumns, sql } from "drizzle-orm";
import { SelectUser, User } from "../schema";
import { db } from "../db";

export const getUsers = async (): Promise<Array<SelectUser>> => {
  return await db.select().from(User);
};

export async function getUserById(
  id: SelectUser["id"]
): Promise<Array<SelectUser>> {
  return db.select().from(User).where(eq(User.id, id));
}

export async function getUserByClerkId(
  id: SelectUser["clerkId"]
): Promise<SelectUser[]> {
  return db.selectDistinct().from(User).where(eq(User.clerkId, id));
}

export const getUserNames = async (): Promise<
  Array<{ username: string | null }>
> => {
  return db.select({ username: User.name }).from(User);
};
