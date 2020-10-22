import { Arg, Mutation, Query, Resolver } from "type-graphql";

import { Post } from "../entitites/Post";

@Resolver()
export class PostResolver {
  // get all posts
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  // get single post
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  // create post
  @Mutation(() => Post)
  async createPost(@Arg("title") title: string): Promise<Post> {
    return Post.create({ title }).save();
  }

  // update post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string
  ): Promise<Post | null> {
    // fetch post
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    // update post
    if (typeof title !== "undefined") {
      // update new title based on id
      await Post.update({ id }, { title });
    }
    return post;
  }

  // delete post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
