import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

type DashboardProps = {
  firstName: string;
  onTimetablePress: () => void;
};

const Dashboard: React.FC<DashboardProps> = ({firstName, onTimetablePress}) => {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require('./assets/fii.png')} />
      <Text style={styles.text}>Welcome to your FII account, {firstName}!</Text>
      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        {/* Button 1 */}
        <TouchableOpacity style={styles.button}>
          <Image
            style={styles.buttonIcon}
            source={require('./assets/catalog.png')}
          />
        </TouchableOpacity>
        {/* Button 2 (Timetable Button) */}
        <TouchableOpacity style={styles.button} onPress={onTimetablePress}>
          <Image
            style={styles.buttonIcon}
            source={require('./assets/timetable.png')}
          />
        </TouchableOpacity>
        {/* Button 3 */}
        <TouchableOpacity style={styles.button}>
          <Image
            style={styles.buttonIcon}
            source={require('./assets/materials.png')}
          />
        </TouchableOpacity>
        {/* Button 4 */}
        <TouchableOpacity style={styles.button}>
          <Image
            style={styles.buttonIcon}
            source={require('./assets/chat.png')}
          />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 15, // Add padding to bottom for better appearance
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
