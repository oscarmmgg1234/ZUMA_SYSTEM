import React from 'react';
import {Alert} from 'react-native';

const ErrorAlert = (message: string) => {
  return Alert.alert(
    'Internal Error',
    message,
    [{text: 'Contact Sys Admin', onPress: () => console.log('Error Notified')}],
    {cancelable: false},
  );
};

export default ErrorAlert;
