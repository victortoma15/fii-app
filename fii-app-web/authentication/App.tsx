import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard'; // Import Dashboard

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [userFirstName, setUserFirstName] = useState(''); // Add state for user's first name

  const handleLoginSuccess = (firstName: string) => {
    // Receive user's first name
    setIsLoggedIn(true);
    setUserFirstName(firstName); // Set user's first name
  };

  const handleRegisterPress = () => {
    setIsRegistered(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegistered(false);
    setIsRegistrationComplete(true);
  };

  return (
    <SafeAreaView style={styles.root}>
      {!isLoggedIn ? (
        !isRegistered ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onRegisterPress={handleRegisterPress}
          />
        ) : (
          <Register onRegisterSuccess={handleRegistrationSuccess} />
        )
      ) : (
        <Dashboard firstName={userFirstName} /> // Pass user's first name as prop
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
