import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  Alert,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TeacherMaterialsProps = {
  teacherId: number | null;
  subjectId: number | null;
};

type Material = {
  id: number;
  name: string;
  type: string;
  category: string;
  approved: boolean;
  uploader: {
    first_name: string;
    last_name: string;
    group: string;
  };
  subject: {
    name: string;
  };
};

const TeacherMaterials: React.FC<TeacherMaterialsProps> = ({
  teacherId,
  subjectId,
}) => {
  const [pendingMaterials, setPendingMaterials] = useState<Material[]>([]);
  const [view, setView] = useState<'main' | 'upload' | 'pending'>('main');

  useEffect(() => {
    const backAction = () => {
      if (view !== 'main') {
        setView('main');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [view]);

  const fetchPendingMaterials = async (
    teacherId: number,
    subjectId: number,
  ) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(
        `http://10.0.2.2:3000/materials/pending/${teacherId}/${subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch pending materials, status code: ${response.status}`,
        );
      }
      const data = await response.json();
      console.log('Fetched pending materials:', data);
      setPendingMaterials(data);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching pending materials:', error);
      Alert.alert(
        'Error',
        `Failed to fetch pending materials: ${error.message}`,
      );
    }
  };

  const handleApprove = async (materialId: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(
        `http://10.0.2.2:3000/materials/approve/${materialId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        Alert.alert('Success', 'Material approved successfully');
        if (teacherId !== null && subjectId !== null) {
          fetchPendingMaterials(teacherId, subjectId);
        }
      } else {
        const errorText = await response.text();
        throw new Error(
          `Material approval failed: ${response.status} - ${errorText}`,
        );
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error approving material:', error);
      Alert.alert('Error', `Failed to approve material: ${error.message}`);
    }
  };

  const handleDeny = async (materialId: number) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('User is not authenticated');
      }

      const response = await fetch(
        `http://10.0.2.2:3000/materials/deny/${materialId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        Alert.alert('Success', 'Material denied successfully');
        if (teacherId !== null && subjectId !== null) {
          fetchPendingMaterials(teacherId, subjectId);
        }
      } else {
        const errorText = await response.text();
        throw new Error(
          `Material denial failed: ${response.status} - ${errorText}`,
        );
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error denying material:', error);
      Alert.alert('Error', `Failed to deny material: ${error.message}`);
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
      formData.append('subject_id', subjectId?.toString() || '');
      formData.append('category', category);

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
        Alert.alert('Success', 'Material uploaded successfully.');
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

  if (view === 'upload') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Upload Material</Text>
        <Button
          title="Upload Course Material"
          onPress={() => handleUpload('Courses')}
        />
        <Button
          title="Upload Solved Exercises"
          onPress={() => handleUpload('Solved Exercises')}
        />
      </View>
    );
  }

  if (view === 'pending') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Pending Materials</Text>
        <FlatList
          data={pendingMaterials}
          renderItem={({item}) => (
            <View style={styles.materialItem}>
              <Text>Name: {item.name}</Text>
              <Text>Type: {item.category}</Text>
              <Text>
                Uploaded by: {item.uploader.first_name}{' '}
                {item.uploader.last_name}
              </Text>
              <Text>Group: {item.uploader.group}</Text>
              <Text>Subject: {item.subject.name}</Text>
              <Button title="Approve" onPress={() => handleApprove(item.id)} />
              <Button title="Deny" onPress={() => handleDeny(item.id)} />
            </View>
          )}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Teacher Materials</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setView('upload')}>
          <Text style={styles.buttonText}>Upload Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (teacherId !== null && subjectId !== null) {
              fetchPendingMaterials(teacherId, subjectId);
            }
            setView('pending');
          }}>
          <Text style={styles.buttonText}>View Pending Uploads</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  materialItem: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
});

export default TeacherMaterials;
