import React, {useState} from 'react';
import {View, TextInput, Switch, Alert, StyleSheet, Text} from 'react-native';
import CustomButton from './customButton';

interface RegisterProps {
  onRegisterSuccess: () => void; // Callback for successful registration
}

const Register: React.FC<RegisterProps> = ({onRegisterSuccess}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [year, setYear] = useState('');
  const [group, setGroup] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState(''); // Updated to subjectId
  const [degree, setDegree] = useState('');

  const handleRegister = async () => {
    const userData = {
      firstName,
      lastName,
      email,
      password,
      isTeacher,
      ...(isTeacher
        ? {
            user_id: teacherId, // Changed from teacherId to user_id
            subject_id: subjectId, // Changed from subject to subject_id
            degree,
          }
        : {
            user_id: studentId, // Changed from studentId to user_id
            year: parseInt(year, 10), // Make sure year is a number
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
        {text: 'OK', onPress: onRegisterSuccess}, // This will switch to the login screen
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
    <View style={styles.container}>
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
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
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
            placeholder="Subject ID" // Updated to Subject ID
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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