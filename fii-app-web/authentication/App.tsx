import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Login from './Login';
import AuthenticatedScreen from './authScreen';

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Function to toggle login state
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <SafeAreaView style={styles.root}>
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
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
