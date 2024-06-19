import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  Image,
  View,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from './customButton';

interface LoginProps {
  onLoginSuccess: (
    firstName: string,
    lastName: string,
    teacherId: number | null,
    role: string,
    year: number | null,
    group: string | null,
    studentId: number | null,
    subjectId: number | null,
    token: string, // Include the token parameter
  ) => void;
  onRegisterPress: () => void;
}

const Login: React.FC<LoginProps> = ({onLoginSuccess, onRegisterPress}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    console.log('Login attempt');
    console.log('Email:', email.trim(), 'Password:', password.trim());

    try {
      const response = await fetch('http://10.0.2.2:3000/login', {
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
        const text = await response.text();
        console.error('Login failed, response:', text);
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      const {
        firstName,
        lastName,
        teacherId,
        role,
        year,
        group,
        studentId,
        subjectId,
        token,
      } = data;
      console.log('Login successful, received data:', data);

      await AsyncStorage.setItem('authToken', token); // Store the token in AsyncStorage

      onLoginSuccess(
        firstName,
        lastName,
        teacherId,
        role,
        year,
        group,
        studentId,
        subjectId,
        token, // Pass the token to handleLoginSuccess
      );
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
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          onChangeText={setPassword}
          value={password}
          placeholder="Password"
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.eyeIcon}>
          <Image
            source={
              isPasswordVisible
                ? require('./assets/eye-open.png')
                : require('./assets/eye-closed.png')
            }
            style={styles.eyeImage}
          />
        </TouchableOpacity>
      </View>
      <CustomButton title="Login" onPress={handleLogin} />
      <CustomButton title="Enroll" onPress={onRegisterPress} />
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    height: 40,
    paddingLeft: 8,
    borderRadius: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  eyeImage: {
    width: 24,
    height: 24,
  },
});

export default Login;
