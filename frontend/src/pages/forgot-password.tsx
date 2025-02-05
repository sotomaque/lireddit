import { Button, Box } from '@chakra-ui/core';
import { Formik, Form } from 'formik';
import React, { useState } from 'react'
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';

import { useForgotPasswordMutation } from '../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';


const forgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false)
  const [, forgotPassword] = useForgotPasswordMutation();
  
    return (
      <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={ async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) => complete ? <Box>If an account with that email exists, we sent you an email</Box> : (
          
          <Form>
            <InputField
              name="email"
              placeholder="email"
              label="Email"
              type="email"
            />
       
            <Button 
              type='submit'
              variantColor='teal'
              mt={4}
              isLoading={isSubmitting}
              >
              Reset Password
            </Button>
        
          </Form>
        )}
      </Formik>
    </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(forgotPassword);