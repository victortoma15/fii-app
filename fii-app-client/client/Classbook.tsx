import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';

type ClassbookProps = {
  visible: boolean;
  onClose: () => void;
  studentId: number;
  studentName: string;
  year: number;
  group: string;
};

type Grade = {
  grade: number;
  subject_id: number;
  created_at: string;
  subject: {
    name: string;
  };
  teacher: {
    user: {
      first_name: string;
      last_name: string;
    } | null;
  } | null;
};

const Classbook: React.FC<ClassbookProps> = ({
  visible,
  onClose,
  studentId,
  studentName,
  year,
  group,
}) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await fetch(
          `http://10.0.2.2:3000/catalog/${studentId}`,
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }
        const data = await response.json();
        setGrades(data);
      } catch (error) {
        console.error('Error fetching grades:', error);
        Alert.alert('Error', 'Failed to fetch grades. Please try again.');
      }
    };

    if (visible) {
      fetchGrades();
    }
  }, [visible, studentId]);

  const renderGradeDetails = (subjectId: number) => {
    const grade = grades.find(grade => grade.subject_id === subjectId);
    if (!grade) return null;

    return (
      <View>
        <Text>Grade: {grade.grade}</Text>
        <Text>Date: {new Date(grade.created_at).toLocaleDateString()}</Text>
        {grade.teacher && grade.teacher.user ? (
          <Text>
            Teacher: {grade.teacher.user.first_name}{' '}
            {grade.teacher.user.last_name}
          </Text>
        ) : (
          <Text>Teacher information not available</Text>
        )}
      </View>
    );
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((acc, grade) => acc + grade.grade, 0);
    return (total / grades.length).toFixed(2);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Text style={styles.header}>Classbook</Text>
        <Text style={styles.studentInfo}>{studentName}</Text>
        <Text style={styles.studentInfo}>
          Year: {year} | Group: {group}
        </Text>
        <Text style={styles.averageText}>
          General Average: {calculateAverage()}
        </Text>
        <View style={styles.buttonContainer}>
          {grades.map(grade => (
            <TouchableOpacity
              key={grade.subject_id}
              style={styles.button}
              onPress={() => setSelectedSubject(grade.subject_id)}>
              <Text>{grade.subject.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedSubject !== null && renderGradeDetails(selectedSubject)}
        <Button title="Close" onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  studentInfo: {
    fontSize: 18,
    marginBottom: 10,
  },
  averageText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
});

export default Classbook;
