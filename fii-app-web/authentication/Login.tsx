// Login.tsx
import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  Alert,
  Image,
} from 'react-native';
import CustomButton from './customButton';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({onLoginSuccess}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('Login attempt');
    console.log('Email:', email.trim(), 'Password:', password.trim());

    try {
      const response = await fetch('http://192.168.1.16:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const text = await response.text(); // Get text to avoid json parse error
        console.error('Login failed, response:', text);
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Login successful, received data:', data);
      const token = data.token;

      onLoginSuccess(); // Call the success callback
      Alert.alert('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred';
      if (error.message.includes('400')) {
        errorMessage = 'Invalid request. Please check your input.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Wrong password\nCheck your password and try again';
      } else if (error.message.includes('404')) {
        errorMessage = 'User not found. Please check your email.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Image style={styles.image} source={require('./assets/fii.png')} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Email"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="Password"
        secureTextEntry
      />
      <CustomButton title="Login" onPress={handleLogin} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  image: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 15,
  },
});

export default Login;
