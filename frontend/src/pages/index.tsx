import { usePostsQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import NextLink from "next/link"
import React from "react";
import { Box, Button, Flex, Heading, Icon, IconButton, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import formatISO from 'date-fns/formatISO'
import { create } from "domain";
import { VoteSection } from "../components/VoteSection";

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
      <br />
      {
          !data && fetching ? (
          <div>Loading...</div>
          ) : (
            <Stack spacing={8}>
            {data!.posts.posts.map((p) => {

              return (
                <Flex p={5} shadow="md" borderWidth="1px" key={p.id}>
                  <VoteSection post={p} />
                  <Box>
                    <Link>
                      <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                        <Heading fontSize="xl">{p.title}</Heading> 
                      </NextLink>
                    </Link>
                    <Text ml="auto">Posted by: {p.creator.username}</Text>
                    <Text mt={4}>{p.textSnippet}</Text>
                  </Box>
                </Flex>
              )
            })}
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
