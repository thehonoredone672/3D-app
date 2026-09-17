import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";
import { signToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Email is already registered");
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: "BUYER" },
  });

  const token = signToken({ id: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const token = signToken({ id: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}
