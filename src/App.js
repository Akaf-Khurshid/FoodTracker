/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

const Stack = createStackNavigator();

function ScreenDay() {
  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={[styles.headertext, {textAlign: 'right'}]}>APP NAME</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.headertext}>CARORIES</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.text}>TIMES</Text>
      </View>
    </View>
  );
}

function App(){
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
      >
        <Stack.Screen
          name="Day_Screen"
          component={ScreenDay}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
    
};

const styles = StyleSheet.create({
  header: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  body: {
    flex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    margin: 10,
  },
  headertext: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 2,
    textAlign: 'left',
  }
});

export default App;
