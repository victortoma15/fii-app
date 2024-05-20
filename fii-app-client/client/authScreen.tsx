import React from 'react';
import {View, Text} from 'react-native';

const AuthenticatedScreen = () => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>You are logged in!</Text>
    </View>
  );
};

export default AuthenticatedScreen;
