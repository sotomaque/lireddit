# LiReddit

- App requires you have a postgres DB up and running
- App also requires you have a Redis server up and running

## Running Frontend

- Running frontend on `http://localhost:3000/`

```bash
> $ cd frontend
> $ yarn dev
```

After you add quereies/ mutations to the graphql folder, run the following script to generate hooks you can use to call those quereies/ mutations

```bash
> $ cd frontend
> $ yarn gen
```

## Running Backend

- Watching .ts file changes and compiling to js in `/backend/dist` filder

```bash
> $ cd backend
> $ yarn watch
```

- running backend on `http://localhost:4000/graphql/`

```bash
> $ cd backend
> $ yarn dev
```
