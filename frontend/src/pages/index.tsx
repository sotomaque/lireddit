import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import NextLink from "next/link"
import React from "react";
import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => { 

  const [variables, setVariables] = React.useState({ 
    limit: 15, 
    cursor: null as null | string 
  });

  const [{ data, fetching }] = usePostsQuery({
    variables
  });

  // console.log(variables)

  if (!fetching && !data) {
    return <div>No Posts</div>
  }

  return (
    <Layout>
      <Flex align="center">
        <Heading>LiReddit</Heading>
      <NextLink href="/create-post">
          <Link ml="auto">create post</Link>
      </NextLink>
      </Flex>
      <br />
      {
          !data && fetching ? (
          <div>Loading...</div>
          ) : (
            <Stack spacing={8}>
            {data!.posts.posts.map(({ title, textSnippet, id, creator }) => (
              <Box p={5} shadow="md" borderWidth="1px" key={id}>
                <Heading fontSize="xl">{title}</Heading> 
                User: {creator.username}
                <Text mt={4}>{textSnippet}</Text>
              </Box>
            ))}
            </Stack>
          )
      }
      {
        data && data.posts.hasMore && (
          <Flex>
            <Button
              isLoading={fetching}
              margin="auto" my={8}
              onClick={
                () => {
                  setVariables({
                    limit: variables.limit,
                    cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
                  })
                }
              }
            >
              Load More
            </Button>
          </Flex>
        )
      }
    </Layout>
  )

}

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
