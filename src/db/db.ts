import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";

config({ path: ".env" });

export const db = drizzle(process.env.DATABASE_URL!);

console.log("connected to db...");

// const newUser: InsertUser = {
//   username: "benjones87",
//   email: "benji@gmail.com",
//   clerkId: 2345,
//   name: "Ben Jones",
//   image: "image001.jpg",
//   bio: "Hi. I am Ben from York.",
//   location: "Yorkshire",
// };

// createUser(newUser);
// console.log("User created");

// const updatedUser = {
//   email: "benj@harrogate.com",
//   username: "benjiGore",
//   clerkId: 1447,
//   name: "Bne Jones",
//   bio: "",
//   location: "",
//   website: "bj.co.uk",
//   image: "",
// };

// updateUser(2, updatedUser);
// console.log("User updated.");

// await db.delete(User);
