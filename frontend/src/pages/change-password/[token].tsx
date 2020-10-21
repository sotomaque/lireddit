import React, { useState } from 'react';
import { NextPage } from 'next'
import { useRouter } from 'next/router';
import NextLink from 'next/link'
import { Button, Box, Flex, Link } from '@chakra-ui/core';
import { Formik, Form } from 'formik';

import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('')
  return (
    <Wrapper variant='small'>
    <Formik
      initialValues={{ newPassword: '' }}
      onSubmit={ async (values, { setErrors }) => {
        const response = await changePassword({ newPassword: values.newPassword, token });
        if (response.data?.changePassword.errors) {
          const errorMap = toErrorMap(response.data.changePassword.errors);
          if ('token' in errorMap) {
            setTokenError(errorMap.token);
          }
          setErrors(errorMap);
        } else if (response.data?.changePassword.user) {
          router.push('/');
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <InputField
            name="newPassword"
            placeholder="New Password"
            label="New Password"
            type='password'
          />
          { tokenError && (
            <Flex mt={2} justifyContent="center" >
              <Box>
                <Box style={{ color: 'red' }}>{tokenError} 🚨 </Box>
                <NextLink href="/forgot-password">
                  <Link>Forgot it again?</Link>
                </NextLink>
              </Box>
            </Flex>
          )}
          <Button 
            type='submit'
            variantColor='teal'
            mt={4}
            isLoading={isSubmitting}
            isDisabled={tokenError !== ''}
          >
            Change Password
          </Button>
        </Form>
      )}
    </Formik>
  </Wrapper>
  );
}

ChangePassword.getInitialProps = ({query}) => {
  return {
    token: query.token as string
  }
}

export default withUrqlClient(createUrqlClient)(ChangePassword);