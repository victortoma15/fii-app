import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import Timetable from './Timetable';
import Catalog from './Catalog'; // Import Catalog
import Classbook from './Classbook'; // Import Classbook

type DashboardProps = {
  firstName: string;
  lastName: string;
  teacherId: number | null;
  role: string;
  year: number | null;
  group: string | null;
  onLogout: () => void;
};

const Dashboard: React.FC<DashboardProps> = ({
  firstName,
  lastName,
  teacherId,
  role,
  year,
  group,
  onLogout,
}) => {
  const [view, setView] = useState<
    'dashboard' | 'timetable' | 'catalog' | 'classbook'
  >('dashboard');

  const handleTimetablePress = () => {
    setView('timetable');
  };

  const handleCatalogPress = () => {
    if (role !== 'teacher') {
      Alert.alert('Access Denied', 'Only teachers can access the catalog.');
      return;
    }
    setView('catalog');
  };

  const handleClassbookPress = () => {
    if (role !== 'student') {
      Alert.alert('Access Denied', 'Only students can access the classbook.');
      return;
    }
    setView('classbook');
  };

  const handleLogoutPress = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/logout', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      Alert.alert('Success', 'Logged out successfully', [
        {text: 'OK', onPress: onLogout},
      ]);
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Logout Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {view === 'dashboard' ? (
        <>
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
            <TouchableOpacity style={styles.button}>
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
            <TouchableOpacity
              style={styles.button}
              onPress={handleClassbookPress}>
              <Text>Classbook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleLogoutPress}>
              <Text style={styles.logoutText}>Logout</Text>
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
          studentId={teacherId!}
          studentName={`${firstName} ${lastName}`}
          year={year!}
          group={group!}
        />
      ) : (
        <Timetable />
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
  logoutText: {
    fontSize: 16,
    color: 'red',
  },
});

export default Dashboard;
