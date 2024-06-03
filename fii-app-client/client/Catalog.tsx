import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet, Modal, Alert} from 'react-native';

type CatalogProps = {
  visible: boolean;
  onClose: () => void;
  teacherId: number;
};

const Catalog: React.FC<CatalogProps> = ({visible, onClose, teacherId}) => {
  const [studentId, setStudentId] = useState('');
  const [grade, setGrade] = useState('');

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
      setStudentId('');
      setGrade('');
    } catch (error) {
      console.error('Error adding grade:', error);
      Alert.alert('Error', 'Failed to add grade. Please try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TextInput
          style={styles.input}
          value={studentId}
          onChangeText={setStudentId}
          placeholder="Student ID"
        />
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
