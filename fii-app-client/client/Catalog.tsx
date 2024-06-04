import React, {useState, useEffect} from 'react';
import {View, TextInput, Button, StyleSheet, Modal, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';

type Student = {
  student_id: number;
};

type CatalogProps = {
  visible: boolean;
  onClose: () => void;
  teacherId: number;
};

const Catalog: React.FC<CatalogProps> = ({visible, onClose, teacherId}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState<number | undefined>(undefined);
  const [grade, setGrade] = useState('');

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
          student_id: studentId,
          grade: grade,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      Alert.alert('Success', data.message);
      onClose();
      setStudentId(undefined);
      setGrade('');
    } catch (error) {
      console.error('Error adding grade:', error);
      Alert.alert('Error', 'Failed to add grade. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Picker
          selectedValue={studentId}
          onValueChange={(itemValue: number | undefined) =>
            setStudentId(itemValue)
          }
          style={styles.input}>
          {students.map(student => (
            <Picker.Item
              key={student.student_id}
              label={`ID: ${student.student_id}`}
              value={student.student_id}
            />
          ))}
        </Picker>
        <TextInput
          style={styles.input}
          value={grade}
          onChangeText={setGrade}
          placeholder="Grade"
          keyboardType="numeric"
        />
        <Button title="Add Grade" onPress={handleAddGrade} />
        <Button title="Cancel" onPress={onClose} color="red" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
