import React from 'react'
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/core';
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {

  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });

  let body = null

  // data is loading
  if (fetching) {
    body = null
  } 
  // user not logged in 
  else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4}>Login</Link>
        </NextLink>
        
        <NextLink href='/register'>
          <Link ml={4}>Register</Link>
        </NextLink>
      </>
    )
  }
  // user logged in
  else {
    body = (
      <Flex alignItems="center">
        <Box mr={4}>{data.me.username}</Box>
        <Button 
          ml={4} 
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
        >
            Logout  
        </Button>
      </Flex>
    )
  }

  return (
    <Flex position='sticky' top={0} zIndex={1} bg="tomato" p={4} align="center" >
      <Box>
        <Heading>
          <Link color="white">
            <NextLink href="/">
              LiReddit
            </NextLink>
          </Link>
        </Heading>
      </Box>
      <Box marginLeft={'auto'}>
        { body }
      </Box>
    </Flex>
  );
}