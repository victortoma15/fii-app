import React, {useState, useEffect} from 'react';
import {View, Text, Button, StyleSheet, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Interval = {
  start: string;
  end: string;
};

type TeacherScheduleProps = {
  teacherId: number;
  subjectId: number;
  subjectYear: number;
};

const TeacherSchedule: React.FC<TeacherScheduleProps> = ({
  teacherId,
  subjectId,
  subjectYear,
}) => {
  const [day, setDay] = useState<string>(daysOfWeek[0]);
  const [timeInterval, setTimeInterval] = useState<Interval | undefined>(
    undefined,
  );
  const [availableIntervals, setAvailableIntervals] = useState<Interval[]>([]);

  useEffect(() => {
    const fetchAvailableIntervals = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:3000/schedule/available-intervals/${day}/${subjectYear}`,
        );
        const data = await response.json();
        setAvailableIntervals(data);
        if (data.length > 0) {
          setTimeInterval(data[0]);
        }
      } catch (error) {
        console.error('Error fetching available intervals:', error);
      }
    };

    fetchAvailableIntervals();
  }, [day, subjectYear]);

  const handleAddSchedule = async () => {
    if (!timeInterval) {
      Alert.alert('Error', 'Please select a time interval');
      return;
    }

    const requestBody = {
      day,
      start_time: timeInterval.start,
      end_time: timeInterval.end,
      subject_id: subjectId,
      teacher_id: teacherId,
    };

    console.log('Adding schedule with request body:', requestBody);

    try {
      const response = await fetch('http://10.0.2.2:3000/schedule/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add schedule');
      }

      Alert.alert('Success', 'Schedule added successfully');
    } catch (error: any) {
      console.error('Error adding schedule:', error);
      Alert.alert('Error', `Failed to add schedule: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Day:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={day}
          onValueChange={(value: string) => setDay(value)}
          style={styles.picker}>
          {daysOfWeek.map(day => (
            <Picker.Item key={day} label={day} value={day} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Time Interval:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={timeInterval}
          onValueChange={(value: Interval) => setTimeInterval(value)}
          style={styles.picker}>
          {availableIntervals.map(interval => (
            <Picker.Item
              key={interval.start}
              label={`${interval.start} - ${interval.end}`}
              value={interval}
            />
          ))}
        </Picker>
      </View>

      <Button title="Add Schedule" onPress={handleAddSchedule} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  picker: {
    width: '100%',
    height: 50,
  },
});

export default TeacherSchedule;
