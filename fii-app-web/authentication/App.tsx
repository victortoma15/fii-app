import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Login from './Login';
import Register from './Register';
import AuthenticatedScreen from './authScreen';

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleRegisterSuccess = () => {
    setIsRegistered(true);
  };

  return (
    <SafeAreaView style={styles.root}>
      {!isLoggedIn ? (
        !isRegistered ? (
          <Register onRegisterSuccess={handleRegisterSuccess} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )
      ) : (
        <AuthenticatedScreen />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
