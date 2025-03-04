import { eq } from "drizzle-orm";
import { db } from "../db";
import { User, SelectUser } from "../schema";

export async function updateUser(
  id: SelectUser["id"],
  data: Partial<Omit<SelectUser, "id" | "createdAt" | "updatedAt">>
) {
  await db.update(User).set(data).where(eq(User.id, id));
}
