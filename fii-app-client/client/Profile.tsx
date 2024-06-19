import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileProps = {
  userId: number;
  onClose: () => void;
};

const Profile: React.FC<ProfileProps> = ({userId, onClose}) => {
  const [user, setUser] = useState<any>(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Retrieved token:', token);
      console.log('Fetching details for userId:', userId);
      if (token) {
        try {
          const response = await fetch(
            `http://10.0.2.2:3000/users/details/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          console.log('API response status:', response.status);
          const responseText = await response.text();
          console.log('API response text:', responseText);
          if (response.status === 200) {
            const data = JSON.parse(responseText);
            console.log('Fetched user data:', data);
            setUser(data);
          } else {
            console.error('Error fetching user:', responseText);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      } else {
        console.error('Token not found');
      }
    };

    fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    const backAction = () => {
      onClose();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [onClose]);

  const handleChangeEmail = async () => {
    const token = await AsyncStorage.getItem('authToken');
    console.log('Retrieved token for email change:', token);
    if (token) {
      fetch(`http://10.0.2.2:3000/users/${userId}/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({email: newEmail}),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update email');
          }
          return response.json();
        })
        .then(() => {
          Alert.alert('Success', 'Email updated successfully');
          setUser((prevState: any) => ({...prevState, email: newEmail}));
          setNewEmail('');
          setIsEmailVisible(false);
        })
        .catch(error => {
          console.error('Error updating email:', error);
          Alert.alert('Error', 'Failed to update email');
        });
    } else {
      Alert.alert('Error', 'User token is missing');
    }
  };

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

  const handleChangePassword = async () => {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert('Error', passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const token = await AsyncStorage.getItem('authToken');
    console.log('Retrieved token for password change:', token);
    if (token) {
      fetch(`http://10.0.2.2:3000/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({password: newPassword}),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update password');
          }
          return response.json();
        })
        .then(() => {
          Alert.alert('Success', 'Password updated successfully');
          setNewPassword('');
          setConfirmPassword('');
          setIsPasswordVisible(false);
        })
        .catch(error => {
          console.error('Error updating password:', error);
          Alert.alert('Error', 'Failed to update password');
        });
    } else {
      Alert.alert('Error', 'User token is missing');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Profile</Text>
      <Image
        style={styles.profileIcon}
        source={require('./assets/profile.png')} // Replace with your profile icon path
      />
      <View style={styles.detailsContainer}>
        {user ? (
          <>
            <Text style={styles.label}>First Name: {user.first_name}</Text>
            <Text style={styles.label}>Last Name: {user.last_name}</Text>
            <Text style={styles.label}>Email: {user.email}</Text>
            {user.Student && (
              <>
                <Text style={styles.label}>
                  Student ID: {user.Student.student_id}
                </Text>
                <Text style={styles.label}>Year: {user.Student.year}</Text>
                <Text style={styles.label}>Group: {user.Student.group}</Text>
              </>
            )}
            {user.Teacher && (
              <>
                <Text style={styles.label}>
                  Teacher ID: {user.Teacher.teacher_id}
                </Text>
                <Text style={styles.label}>Degree: {user.Teacher.degree}</Text>
                <Text style={styles.label}>
                  Subject: {user.Teacher.subject.name}
                </Text>
              </>
            )}
          </>
        ) : (
          <Text>Loading...</Text>
        )}
        {isEmailVisible && (
          <>
            <TextInput
              style={styles.input}
              placeholder="New Email"
              value={newEmail}
              onChangeText={setNewEmail}
            />
            <TouchableOpacity style={styles.button} onPress={handleChangeEmail}>
              <Text style={styles.buttonText}>Save Email</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsEmailVisible(!isEmailVisible)}>
          <Text style={styles.buttonText}>
            {isEmailVisible ? 'Cancel' : 'Change Email'}
          </Text>
        </TouchableOpacity>
        {isPasswordVisible && (
          <>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <Text style={styles.passwordError}>
              {newPassword !== confirmPassword ? 'Passwords do not match.' : ''}
            </Text>
          </>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Text style={styles.buttonText}>
            {isPasswordVisible ? 'Cancel' : 'Change Password'}
          </Text>
        </TouchableOpacity>
        {isPasswordVisible && (
          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Save Password</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileIcon: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailsContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  passwordError: {
    color: 'red',
    marginBottom: 10,
    fontSize: 12,
  },
});

export default Profile;
