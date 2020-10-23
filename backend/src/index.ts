import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import connectReddis from "connect-redis";
import cors from "cors";
import express from "express";
import Redis from "ioredis";
import session from "express-session";

import { COOKIE_NAME, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Upvote } from "./entities/Upvote";
import path from "path";

// rerun
const main = async () => {
  // connect to db using typeorm
  const conn = await createConnection({
    type: "postgres",
    database: "lireddit2",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: !__prod__,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Upvote],
  });
  await conn.runMigrations();
  // console.log(conn);

  // Post.delete({});

  // create express server
  const app = express();

  // redis
  const RedisStore = connectReddis(session);
  const redis = new Redis();

  // apply cors to all routes
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis as any,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "asdfsadsadf",
      resave: false,
    })
  );

  // create apollo server (with resolvers in schema)
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  // apply middleware
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  // listen to posrt 4000
  app.listen(4000, () => {
    console.log("listeneing on port 4000");
  });
};

main().catch((err) => {
  console.error(err);
});
