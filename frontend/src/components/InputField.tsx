import React, { InputHTMLAttributes } from 'react'
import { useField } from 'formik';
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/core';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  textarea?: boolean
 };

export const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  size: _,
  ...props }
) => {
  let InputOrTextarea = Input

  if (textarea) {
    InputOrTextarea = Textarea
  }
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <InputOrTextarea {...field} {...props} id={field.name} />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null }
    </FormControl>
  );
}