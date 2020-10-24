import React from 'react'
import { Box } from '@chakra-ui/core';

export type WrapperVariariant = "small" | "regular";

interface WrapperProps {
  variant?: WrapperVariariant
}

export const Wrapper: React.FC<WrapperProps> = ({ children, variant='regular' }) => {
    return (
      <Box maxW={variant==='regular' ? "800px" : "400px"} w="100%" mt={16} mx="auto">
        {children}
      </Box>
    );
}