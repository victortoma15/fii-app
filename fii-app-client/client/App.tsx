import React, {useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

GoogleSignin.configure({
  webClientId: 'your-web-client-id',
  offlineAccess: true,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [studentId, setStudentId] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [role, setRole] = useState<string>('');
  const [year, setYear] = useState<number | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [subjectYear, setSubjectYear] = useState<number | null>(null); // Add subjectYear

  const handleLoginSuccess = (
    firstName: string,
    lastName: string,
    teacherId: number | null,
    role: string,
    year: number | null,
    group: string | null,
    studentId: number | null,
    subjectId: number | null,
    subjectYear: number | null, // Add subjectYear parameter
    token: string,
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
    setSubjectYear(subjectYear); // Set subjectYear
  };

  const handleRegisterPress = () => {
    setIsRegistered(true);
  };

  const handleRegistrationSuccess = () => {
    setIsRegistered(false);
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
    setSubjectYear(null); // Clear subjectYear
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
          subjectYear={subjectYear} // Pass subjectYear to Dashboard
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
