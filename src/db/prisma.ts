import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export class Prisma {
  constructor() {}
  public db = new PrismaClient();
}
