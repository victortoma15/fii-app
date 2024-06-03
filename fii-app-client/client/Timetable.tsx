import React, {useState} from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const Timetable: React.FC = () => {
  const [message, setMessage] = useState('');

  const addEventToCalendar = async () => {
    try {
      // Sign out the user to ensure a clean sign-in state
      await GoogleSignin.signOut();

      // Sign in the user
      const userInfo = await GoogleSignin.signIn();
      console.log('User Info:', userInfo);

      // Fetch the tokens after signing in
      const tokens = await GoogleSignin.getTokens();
      console.log('Tokens:', tokens);

      // Send the request to create an event
      const response = await fetch(
        'http://10.0.2.2:3000/calendar/create-event',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.accessToken}`,
          },
          body: JSON.stringify({
            summary: 'Test Event',
            location: 'Test Location',
            description: 'Test Description',
            start: {
              dateTime: '2024-06-10T10:00:00-07:00',
              timeZone: 'America/Los_Angeles',
            },
            end: {
              dateTime: '2024-06-10T12:00:00-07:00',
              timeZone: 'America/Los_Angeles',
            },
          }),
        },
      );

      // Handle the response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${errorText}`,
        );
      }

      const result = await response.json();
      setMessage(`Event created: ${result.htmlLink}`);
    } catch (error) {
      console.error('Error details:', error);
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage('An unknown error occurred.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Timetable</Text>
      <Button title="Add Event" onPress={addEventToCalendar} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  message: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
  },
});

export default Timetable;
