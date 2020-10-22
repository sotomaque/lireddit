import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";

import { User } from "../entitites/User";
import { MyContext } from "src/types";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  // me query
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // not logged in
    if (!req.session.userId) {
      return null;
    }

    // logged in
    return User.findOne(req.session.userId);
  }

  // register mutation
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPassword,
          email: options.email,
        })
        .returning("*")
        .execute();

      console.log("res: ", result);
      user = result.raw;
    } catch (err) {
      if (err?.detail?.includes("already exists")) {
        // duplicate username error
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }

    // auto login user by storing userId session
    req.session.userId = user.id;

    return { user };
  }

  // login mutation
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    // lookup user
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );
    // case: user not found
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "That username does not exist",
          },
        ],
      };
    }
    // check provided password
    const valid = await argon2.verify(user.password, password);
    // case: provided password does not match db password
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      };
    }

    // store userId in our session
    req.session.userId = user.id;

    // otherwise return user
    return { user };
  }

  // logout mutation
  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    // removes session from redis
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        // clear cookie from browser
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }

  // forgot password -> send email
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // email not in db
      return true; // avoid giving user hint that email is not in db
    }
    // create unique token
    const token = v4();
    // store it in redis
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); // expires in 3 days

    // send email to user with token
    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
    );
    return true;
  }

  // update password -> log user in
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );
    await redis.del(key);

    // log in user after change password
    req.session.userId = user.id;

    return { user };
  }
}
