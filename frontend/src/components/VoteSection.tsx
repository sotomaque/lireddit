import { Flex, Box, IconButton } from '@chakra-ui/core';
import React from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface VoteSectionProps {
  post: PostSnippetFragment; 
}

export const VoteSection: React.FC<VoteSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = React.useState<'upvote-loading' | 'downvote-loading' | 'not-loading'>('not-loading');
  const [, vote] = useVoteMutation();

  return (
    <Flex direction='column' alignItems='center' justifyContent='center' mr={4}>
      <Box>
        <IconButton
          variantColor={ post.voteStatus === 1 ? "green" : undefined}
          icon="chevron-up"
          aria-label="upvote"
          onClick={async () => {
            if (post.voteStatus === 1) return
            setLoadingState('upvote-loading')
            await vote({ value: 1, postId: post.id })
            setLoadingState('not-loading')
          }}
          isLoading={loadingState === 'upvote-loading'}
        />
      </Box>
      <Box>{ post.points }</Box>
      <Box>
        <IconButton
          variantColor={ post.voteStatus === -1 ? "red" : undefined}
          icon="chevron-down"
          aria-label="downvote"
          onClick={async () => {
            if (post.voteStatus === -1) return
            setLoadingState('downvote-loading')
            await vote({ value: -1, postId: post.id })
            setLoadingState('not-loading')
          }}
          isLoading={loadingState === 'downvote-loading'}
        />
      </Box>
    </Flex>
  );
}
