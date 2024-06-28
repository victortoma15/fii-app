import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import TeacherSchedule from './TeacherSchedule';
import Catalog from './Catalog';
import Classbook from './Classbook';
import Materials from './Materials';
import TeacherMaterials from './TeacherMaterials';
import Profile from './Profile';
import StudentSchedule from './StudentSchedule';

type DashboardProps = {
  firstName: string;
  lastName: string;
  teacherId: number | null;
  role: string;
  year: number | null;
  group: string | null;
  studentId: number | null;
  onLogout: () => void;
  subjectId: number | null;
  subjectYear: number | null;
};

const Dashboard: React.FC<DashboardProps> = ({
  firstName,
  lastName,
  teacherId,
  role,
  year,
  group,
  studentId,
  onLogout,
  subjectId,
  subjectYear,
}) => {
  const [view, setView] = useState<
    | 'dashboard'
    | 'timetable'
    | 'catalog'
    | 'classbook'
    | 'materials'
    | 'teacherMaterials'
    | 'profile'
    | 'teacherSchedule'
    | 'studentSchedule'
  >('dashboard');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const backAction = () => {
      if (view !== 'dashboard') {
        setView('dashboard');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [view]);

  const handleCatalogPress = () => {
    if (role === 'teacher') {
      setView('catalog');
    } else if (role === 'student') {
      setView('classbook');
    } else {
      Alert.alert('Access Denied', 'Unauthorized access.');
    }
  };

  const handleMaterialsPress = () => {
    if (role === 'teacher') {
      setView('teacherMaterials');
    } else {
      setView('materials');
    }
  };

  const handleTimetablePress = () => {
    if (role === 'teacher') {
      setView('teacherSchedule');
    } else if (role === 'student') {
      setView('studentSchedule');
    } else {
      Alert.alert('Access Denied', 'Unauthorized access.');
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await fetch('http://10.0.2.2:3000/logout', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
              });

              if (!response.ok) {
                throw new Error('Failed to logout');
              }

              onLogout();
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert(
                'Logout Error',
                'Failed to logout. Please try again.',
              );
            }
          },
        },
        {
          text: 'No',
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      {view === 'dashboard' ? (
        <>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setView('profile')}>
            <Image
              style={styles.profileIcon}
              source={require('./assets/profile.png')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogoutPress}>
            <Image
              style={styles.logoutIcon}
              source={require('./assets/logout.png')}
            />
          </TouchableOpacity>
          <Image style={styles.image} source={require('./assets/fii.png')} />
          <Text style={styles.text}>
            Welcome to your FII account, {firstName}!
          </Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCatalogPress}>
              <Image
                style={styles.buttonIcon}
                source={require('./assets/catalog.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleTimetablePress}>
              <Image
                style={styles.buttonIcon}
                source={require('./assets/timetable.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleMaterialsPress}>
              <Image
                style={styles.buttonIcon}
                source={require('./assets/materials.png')}
              />
            </TouchableOpacity>
          </View>
        </>
      ) : view === 'catalog' ? (
        <Catalog
          teacherId={teacherId!}
          visible={true}
          onClose={() => setView('dashboard')}
        />
      ) : view === 'classbook' ? (
        <Classbook
          visible={true}
          onClose={() => setView('dashboard')}
          studentId={studentId!}
          studentName={`${firstName} ${lastName}`}
          year={year!}
          group={group!}
        />
      ) : view === 'materials' ? (
        <Materials
          studentId={studentId}
          year={year}
          group={group}
          subjectId={subjectId}
        />
      ) : view === 'teacherMaterials' ? (
        <TeacherMaterials teacherId={teacherId} subjectId={subjectId} />
      ) : view === 'teacherSchedule' ? (
        subjectYear !== null ? (
          <TeacherSchedule
            teacherId={teacherId!}
            subjectId={subjectId!}
            subjectYear={subjectYear!}
          />
        ) : (
          <Text>Error loading schedule</Text>
        )
      ) : view === 'studentSchedule' ? (
        <StudentSchedule year={year!} />
      ) : (
        <Profile
          userId={studentId || teacherId!}
          onClose={() => setView('dashboard')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  profileIcon: {
    width: 30,
    height: 30,
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  logoutIcon: {
    width: 24,
    height: 24,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  image: {
    height: 200,
    width: 200,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    paddingBottom: 15,
  },
  button: {
    alignItems: 'center',
  },
  buttonIcon: {
    width: 40,
    height: 40,
  },
});

export default Dashboard;
