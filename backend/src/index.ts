import "reflect-metadata";
import express from "express";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import Redis from "ioredis";
import session from "express-session";
import connectReddis from "connect-redis";
import cors from "cors";

import { COOKIE_NAME, __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";

import { createConnection } from "typeorm";

import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const conn = createConnection({
    type: "postgres",
    database: "lireddit2",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: !__prod__,
    entities: [],
  });
  // connect to db
  const orm = await MikroORM.init(mikroOrmConfig);
  // run migrations (automatically runs when server restarts, running migrations)
  await orm.getMigrator().up();

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
    context: ({ req, res }) => ({ em: orm.em, req, res, redis }),
  });

  // apply middleware
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  // listen to posrt 4000
  app.listen(4000, () => {
    console.log("hello world");
  });
};

main().catch((err) => {
  console.error(err);
});
