import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';

type Student = {
  student_id: number;
  first_name: string;
  last_name: string;
  group: string;
  grade: number | null;
};

type CatalogProps = {
  visible: boolean;
  onClose: () => void;
  teacherId: number;
};

const Catalog: React.FC<CatalogProps> = ({visible, onClose, teacherId}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [grade, setGrade] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      const fetchStudents = async () => {
        try {
          const response = await fetch(
            `http://10.0.2.2:3000/studentsByYear/${teacherId}`,
          );
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
          }

          const data = await response.json();
          console.log('Fetched students:', data); // Debugging log
          setStudents(data);
        } catch (error) {
          console.error('Error fetching students:', error);
          Alert.alert('Error', 'Failed to fetch students. Please try again.');
        }
      };

      fetchStudents();
    }
  }, [visible]);

  const handleAddGrade = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/addGrade', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          teacher_id: teacherId,
          student_id: selectedStudent?.student_id,
          grade: grade,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      Alert.alert(
        'Success',
        `You have successfully added ${selectedStudent?.last_name} ${selectedStudent?.first_name} grade ${grade}`,
      );
      setIsModalVisible(false);
      setSelectedStudent(null);
      setGrade('');
      onClose();
    } catch (error) {
      console.error('Error adding grade:', error);

      if (error instanceof Error) {
        Alert.alert(
          'Error',
          error.message.includes(
            'You have already assigned a grade for this student',
          )
            ? 'You have already assigned a grade for this student'
            : 'An unexpected error occurred.',
        );
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    }
  };

  const handleModifyGrade = async () => {
    try {
      const response = await fetch('http://10.0.2.2:3000/updateGrade', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          teacher_id: teacherId,
          student_id: selectedStudent?.student_id,
          grade: grade,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      Alert.alert(
        'Success',
        `You have successfully modified ${selectedStudent?.last_name} ${selectedStudent?.first_name} grade to ${grade}`,
      );
      setIsModalVisible(false);
      setSelectedStudent(null);
      setGrade('');
      onClose();
    } catch (error) {
      console.error('Error modifying grade:', error);
      Alert.alert('Error', 'Failed to modify grade. Please try again.');
    }
  };

  const handleOptionPress = (student: Student) => {
    setSelectedStudent(student);
    setGrade(student.grade !== null ? student.grade.toString() : '');
    setIsModalVisible(true);
  };

  const renderStudentItem = ({item}: {item: Student}) => (
    <View style={styles.studentItem}>
      <Text style={styles.studentId}>{item.student_id}</Text>
      <Text style={styles.studentName}>
        {item.last_name} {item.first_name}
      </Text>
      <Text style={styles.studentGroup}>{item.group}</Text>
      <Text style={styles.studentGrade}>
        {item.grade !== null ? item.grade : ''}
      </Text>
      <TouchableOpacity
        onPress={() => handleOptionPress(item)}
        style={styles.optionButton}>
        <Text>•••</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>ID</Text>
          <Text style={styles.headerText}>Name</Text>
          <Text style={styles.headerText}>Group</Text>
          <Text style={styles.headerText}>Grade</Text>
          <Text style={styles.headerText}>Options</Text>
        </View>
        {students.length === 0 ? (
          <Text>No students found</Text>
        ) : (
          <FlatList
            data={students.sort((a, b) =>
              a.last_name.localeCompare(b.last_name),
            )}
            renderItem={renderStudentItem}
            keyExtractor={item => item.student_id.toString()}
          />
        )}
      </View>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text>
            {selectedStudent?.last_name} {selectedStudent?.first_name}
          </Text>
          <TextInput
            style={styles.input}
            value={grade}
            onChangeText={setGrade}
            placeholder="Grade"
            keyboardType="numeric"
          />
          {selectedStudent?.grade !== null ? (
            <Button title="Modify Grade" onPress={handleModifyGrade} />
          ) : (
            <Button title="Add Grade" onPress={handleAddGrade} />
          )}
          <Button
            title="Cancel"
            onPress={() => setIsModalVisible(false)}
            color="red"
          />
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
  },
  studentId: {
    flex: 1,
    textAlign: 'left',
  },
  studentName: {
    flex: 3,
    textAlign: 'left',
  },
  studentGroup: {
    flex: 1,
    textAlign: 'left',
  },
  studentGrade: {
    flex: 1,
    textAlign: 'left',
  },
  optionButton: {
    flex: 1,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 8,
    borderRadius: 15,
    width: '80%',
  },
});

export default Catalog;
