import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

type TimetableProps = {
  firstName: string;
  onBackPress: () => void;
};

const Timetable: React.FC<TimetableProps> = ({firstName, onBackPress}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Timetable for {firstName}</Text>
      {/* Add your timetable component here */}
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Image source={require('./assets/back.png')} style={styles.backIcon} />
      </TouchableOpacity>
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
});

export default Timetable;
