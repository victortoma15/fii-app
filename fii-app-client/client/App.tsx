import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

GoogleSignin.configure({
  webClientId:
    '201716262857-v92c4r7f2bc9t9dv81r8lt4p3q1g9k4e.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [studentId, setStudentId] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [role, setRole] = useState<string>('');
  const [year, setYear] = useState<number | null>(null);
  const [group, setGroup] = useState<string | null>(null);

  const handleLoginSuccess = (
    firstName: string,
    lastName: string,
    teacherId: number | null,
    role: string,
    year: number | null,
    group: string | null,
    studentId: number | null,
    subjectId: number | null,
  ) => {
    setIsLoggedIn(true);
    setUserFirstName(firstName);
    setUserLastName(lastName);
    setStudentId(studentId);
    setTeacherId(teacherId);
    setRole(role);
    setYear(year);
    setGroup(group);
    setSubjectId(subjectId);
  };

  const handleRegisterPress = () => {
    setIsRegistered(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegistered(false);
    setIsRegistrationComplete(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserFirstName('');
    setUserLastName('');
    setTeacherId(null);
    setRole('');
    setYear(null);
    setGroup(null);
    setStudentId(null);
    setSubjectId(null);
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
        <Dashboard
          firstName={userFirstName}
          lastName={userLastName}
          studentId={studentId}
          teacherId={teacherId}
          role={role}
          year={year}
          group={group}
          onLogout={handleLogout}
          subjectId={subjectId}
        />
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
