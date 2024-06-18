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
import Timetable from './Timetable';
import Catalog from './Catalog';
import Classbook from './Classbook';
import Materials from './Materials';
import TeacherMaterials from './TeacherMaterials';

type DashboardProps = {
  firstName: string;
  lastName: string;
  teacherId: number | null;
  role: string;
  year: number | null;
  group: string | null;
  studentId: number | null; // Added studentId
  onLogout: () => void;
  subjectId: number | null; // Added subjectId
};

const Dashboard: React.FC<DashboardProps> = ({
  firstName,
  lastName,
  teacherId,
  role,
  year,
  group,
  studentId, // Added studentId
  onLogout,
  subjectId, // Added subjectId
}) => {
  const [view, setView] = useState<
    | 'dashboard'
    | 'timetable'
    | 'catalog'
    | 'classbook'
    | 'materials'
    | 'teacherMaterials'
  >('dashboard');

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
              onPress={() => setView('timetable')}>
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
            <TouchableOpacity style={styles.button}>
              <Image
                style={styles.buttonIcon}
                source={require('./assets/chat.png')}
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
          studentId={studentId!} // Pass correct studentId
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
      ) : (
        <TeacherMaterials teacherId={teacherId} subjectId={subjectId} />
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
