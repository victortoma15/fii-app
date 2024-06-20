import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const timeIntervals = [
  {start: '08:00', end: '10:00'},
  {start: '10:00', end: '12:00'},
  {start: '12:00', end: '14:00'},
  {start: '14:00', end: '16:00'},
  {start: '16:00', end: '18:00'},
  {start: '18:00', end: '20:00'},
];

type Schedule = {
  id: number;
  start_time: string;
  end_time: string;
  subject: {
    name: string;
    year: number;
  };
  teacher: {
    user: {
      first_name: string;
      last_name: string;
    };
  } | null;
};

type StudentScheduleProps = {
  year: number;
};

const StudentSchedule: React.FC<StudentScheduleProps> = ({year}) => {
  const [selectedDay, setSelectedDay] = useState<string>(daysOfWeek[0]);
  const [schedule, setSchedule] = useState<Schedule[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:3000/schedule/${selectedDay}/${year}`,
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await response.text();
          throw new Error(`Unexpected response: ${errorText}`);
        }
        const data = await response.json();
        setSchedule(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error('Error fetching schedule:', error);
        Alert.alert('Error', `Failed to fetch schedule: ${error.message}`);
      }
    };

    fetchSchedule();
  }, [selectedDay, year]);

  const renderScheduleRow = (interval: {start: string; end: string}) => {
    const item = schedule.find(
      s => s.start_time === interval.start && s.end_time === interval.end,
    );
    return (
      <View
        key={`${interval.start}-${interval.end}`}
        style={styles.scheduleRow}>
        <Text
          style={
            styles.scheduleTime
          }>{`${interval.start} - ${interval.end}`}</Text>
        {item ? (
          <>
            <Text style={styles.scheduleSubject}>{item.subject.name}</Text>
            <Text style={styles.scheduleTeacher}>
              {item.teacher?.user?.first_name || 'Unknown'}{' '}
              {item.teacher?.user?.last_name || ''}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.scheduleSubject}></Text>
            <Text style={styles.scheduleTeacher}></Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Year {year} Schedule</Text>
      <View style={styles.daysContainer}>
        {daysOfWeek.map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={[
              styles.dayButton,
              selectedDay === day && styles.selectedDayButton,
            ]}>
            <Text style={styles.day}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.scheduleContainer}>
        {timeIntervals.map(renderScheduleRow)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  selectedDayButton: {
    backgroundColor: '#ddd',
  },
  day: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleContainer: {
    flex: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%', // Stretch row to full width
  },
  scheduleTime: {
    flex: 1,
    fontSize: 16,
    textAlign: 'left',
  },
  scheduleSubject: {
    flex: 2,
    fontSize: 16,
    textAlign: 'center',
  },
  scheduleTeacher: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
});

export default StudentSchedule;
