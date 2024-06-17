import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  BackHandler,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MaterialsProps = {
  studentId: number | null;
  year: number | null;
  group: string | null;
  subjectId: number | null;
};

type Subject = {
  id: number;
  name: string;
};

type Material = {
  id: number;
  name: string;
  category: string;
  approved: boolean;
  uploader: {
    first_name: string;
    last_name: string;
    group: string;
  };
};

const Materials: React.FC<MaterialsProps> = ({
  studentId,
  year,
  group,
  subjectId,
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(
    subjectId,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showApproved, setShowApproved] = useState<boolean>(false);

  useEffect(() => {
    fetchSubjects();
    const backAction = () => {
      if (selectedCategory) {
        setSelectedCategory(null);
        return true;
      } else if (selectedSubject) {
        setSelectedSubject(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [selectedCategory, selectedSubject]);

  const fetchSubjects = async () => {
    if (!year) return;

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(
        `http://10.0.2.2:3000/subjects?year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch subjects, status code: ${response.status}`,
        );
      }
      const data = await response.json();
      setSubjects(data);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching subjects:', error);
      Alert.alert('Error', `Failed to fetch subjects: ${error.message}`);
    }
  };

  const fetchMaterials = async (
    subjectId: number,
    category: string,
    approved: boolean,
  ) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const endpoint = approved
        ? `http://10.0.2.2:3000/materials/${subjectId}/${category}/approved`
        : `http://10.0.2.2:3000/materials/${subjectId}/${category}`;

      console.log(`Fetching materials from endpoint: ${endpoint}`);

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        console.log('No materials found.');
        setMaterials([]);
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch materials, status code: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log('Fetched materials:', data);
      setMaterials(data);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching materials:', error);
      Alert.alert('Error', `Failed to fetch materials: ${error.message}`);
    }
  };

  const handleUpload = async (category: string) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const formData = new FormData();
      formData.append('file', {
        uri: result[0].uri,
        name: result[0].name,
        type: result[0].type,
      });
      formData.append('subject_id', selectedSubject?.toString() || '');
      formData.append('category', category);
      formData.append('group', group || ''); // Pass the group information

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch('http://10.0.2.2:3000/materials/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'Success',
          'Your upload needs approval from a teacher, please check back later.',
        );
        fetchMaterials(selectedSubject!, category, false);
      } else {
        const errorText = await response.text();
        throw new Error(
          `File upload failed: ${response.status} - ${errorText}`,
        );
      }
    } catch (err) {
      const error = err as Error;
      if (DocumentPicker.isCancel(error)) {
        // User cancelled the picker
      } else {
        console.error('Error uploading file:', error);
        Alert.alert('Error', `Failed to upload file: ${error.message}`);
      }
    }
  };

  const handleViewApproved = async () => {
    if (selectedSubject && selectedCategory) {
      console.log('Viewing approved materials...');
      if (showApproved) {
        setMaterials([]);
      } else {
        await fetchMaterials(selectedSubject, selectedCategory, true);
      }
      setShowApproved(!showApproved);
    }
  };

  return (
    <View style={styles.container}>
      {!selectedSubject ? (
        <>
          <Text style={styles.header}>Select a Subject</Text>
          <View style={styles.centeredButtonContainer}>
            {subjects.map(subject => (
              <TouchableOpacity
                key={subject.id}
                style={styles.subjectButton}
                onPress={() => setSelectedSubject(subject.id)}>
                <Text style={styles.buttonText}>{subject.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : !selectedCategory ? (
        <>
          <Text style={styles.header}>Select a Category</Text>
          <View style={styles.centeredButtonContainer}>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setSelectedCategory('Solved Exercises')}>
              <Text style={styles.buttonText}>Solved Exercises</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.categoryButton}
              onPress={() => setSelectedCategory('Courses')}>
              <Text style={styles.buttonText}>Courses</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.header}>Materials - {selectedCategory}</Text>
          <View style={styles.centeredButtonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleUpload(selectedCategory)}>
              <Text style={styles.buttonText}>Upload Material</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewApproved}>
              <Text style={styles.buttonText}>
                {showApproved
                  ? 'Hide Approved Materials'
                  : 'View Approved Materials'}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={materials}
            renderItem={({item}) => (
              <View style={styles.materialItem}>
                <Text>{item.name}</Text>
                <Text>Category: {item.category}</Text>
              </View>
            )}
            keyExtractor={item => item.id.toString()}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  centeredButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  subjectButton: {
    backgroundColor: '#007bff',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  categoryButton: {
    backgroundColor: '#28a745',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#007bff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  materialItem: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
});

export default Materials;
