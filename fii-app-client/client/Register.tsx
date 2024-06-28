import React, {useState} from 'react';
import {
  View,
  TextInput,
  Switch,
  Alert,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import CustomButton from './customButton';

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({onRegisterSuccess}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [year, setYear] = useState('');
  const [group, setGroup] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [degree, setDegree] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character.';
    }
    return '';
  };

  const handleRegister = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Error', passwordError);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      password,
      isTeacher,
      ...(isTeacher
        ? {
            user_id: teacherId,
            subject_id: subjectId,
            degree,
          }
        : {
            user_id: studentId,
            year: parseInt(year, 10),
            group,
          }),
    };

    console.log('Attempting to register:', userData);

    try {
      const response = await fetch('http://10.0.2.2:3000/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      Alert.alert('Success', data.message, [
        {text: 'OK', onPress: onRegisterSuccess},
      ]);
    } catch (error) {
      console.error('Registration failed:', error);
      Alert.alert(
        'Registration Error',
        'Failed to register. Please try again.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Enroll your account</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
        />
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
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
        <Text style={styles.passwordError}>{validatePassword(password)}</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry={!isConfirmPasswordVisible}
          />
          <TouchableOpacity
            onPress={() =>
              setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
            }
            style={styles.eyeIcon}>
            <Image
              source={
                isConfirmPasswordVisible
                  ? require('./assets/eye-open.png')
                  : require('./assets/eye-closed.png')
              }
              style={styles.eyeImage}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.passwordError}>
          {password !== confirmPassword ? 'Passwords do not match.' : ''}
        </Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Are you a teacher?</Text>
          <Switch value={isTeacher} onValueChange={setIsTeacher} />
        </View>
        {isTeacher ? (
          <>
            <TextInput
              style={styles.input}
              value={teacherId}
              onChangeText={setTeacherId}
              placeholder="Teacher ID"
            />
            <TextInput
              style={styles.input}
              value={subjectId}
              onChangeText={setSubjectId}
              placeholder="Subject ID"
            />
            <TextInput
              style={styles.input}
              value={degree}
              onChangeText={setDegree}
              placeholder="Degree"
            />
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={studentId}
              onChangeText={setStudentId}
              placeholder="Student ID"
            />
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="Year"
            />
            <TextInput
              style={styles.input}
              value={group}
              onChangeText={setGroup}
              placeholder="Group"
            />
          </>
        )}
        <CustomButton title="Enroll" onPress={handleRegister} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
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
    flex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
    paddingLeft: 8,
  },
  passwordInput: {
    flex: 1,
    height: 40,
  },
  eyeIcon: {
    padding: 5,
  },
  eyeImage: {
    width: 24,
    height: 24,
  },
  passwordError: {
    color: 'red',
    marginBottom: 10,
    fontSize: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
  },
});

export default Register;
