/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  AppState,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import Item from '../components/Item';
import SQLite from 'react-native-sqlite-storage'

const db = SQLite.openDatabase(
  {
  name:'MainDB',
  location:'default',
  },
  ()=>{},
  error=>{console.log(error)}
);

const Stack = createStackNavigator();

function ScreenDay({navigation}) {
  
  //States and event handlers
  const [morningfood, morningsetFood] = useState();
  const [morningfoodItems, morningsetFoodItems] = useState([]);
  const [afternoonfood, afternoonsetFood] = useState();
  const [afternoonfoodItems, afternoonsetFoodItems] = useState([]);
  const [eveningfood, eveningsetFood] = useState();
  const [eveningfoodItems, eveningsetFoodItems] = useState([]);
  const [currdate, setCurrDate] = useState();
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  let today = new Date();
  let date=today.getDate() + "-"+ parseInt(today.getMonth()+1) +"-"+today.getFullYear();
  setCurrDate(date);

  useEffect(()=>{
    createTable();
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        getData();
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log("AppState", appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const createTable=()=>{
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS"
        +"Foodentry"
        +"(ID INTERGER PRIMARY KEY AUTOINCREMENT, Date TEXT, Time TEXT, Food TEXT,);"
      )
    })
  }

  const insertData = async (time, food) => {
    try{
      await db.transaction(async (tx) => {
        await tx.executeSql(
          "INSTERT INTO Foodentry (Date, Time, Food) VALUES ('?,?,?)",
          [currdate, time, food]
        )
      })
    } catch(error){
      console.log(error);
    }
  };

  const getData = () => {
    try{
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT Time, Food FROM Foodentry WHERE Date=?",
          [currdate],
          (tx, results) =>{
            {results.rows.map((time,food) => {
              time=='Morning' ? morningsetFoodItems([...morningfoodItems, food]) 
              :
              time=='Afternoon' ? afternoonsetFoodItems([...afternoonfoodItems, food])
              :
              eveningsetFoodItems([...eveningfoodItems, food])
            })}
          }
        )
      })
    } catch(error){
      console.log(error);
    }
  }

  const removeData = (time, food) => {
    try{
      db.transaction((tx) => {
        tx.executeSql(
          "DELETE FROM Foodentry WHERE Date=?,Time=?,Food=?",
          [currdate, time, food]
        )
      })
    } catch(error){
      console.log(error);
    }
  }



  const morninghandleAddFood = () => {
    Keyboard.dismiss();
    insertData('Morning', morningfood)
    morningsetFoodItems([...morningfoodItems, morningfood]);
    morningsetFood(null);
  };

  const morningremoveFood = (index, item) => {
    removeData('Morning', item);
    let foodCopy = [...morningfoodItems];
    foodCopy.splice(index, 1);
    morningsetFoodItems(foodCopy);
  };

  const afternoonhandleAddFood = () => {
    Keyboard.dismiss();
    afternoonsetFoodItems([...afternoonfoodItems, afternoonfood]);
    afternoonsetFood(null);
  };

  const afternoonremoveFood = index => {
    let foodCopy = [...afternoonfoodItems];
    foodCopy.splice(index, 1);
    afternoonsetFoodItems(foodCopy);
  };

  const eveninghandleAddFood = () => {
    Keyboard.dismiss();
    eveningsetFoodItems([...eveningfoodItems, eveningfood]);
    eveningsetFood(null);
  };

  const eveningremoveFood = index => {
    let foodCopy = [...eveningfoodItems];
    foodCopy.splice(index, 1);
    eveningsetFoodItems(foodCopy);
  };

  return (
    <ScrollView style={styles.mainContainer}>
      <View>
        <View style={styles.headerwarp}>
          <Text style={styles.text}>Morning</Text>
          <View>
            <KeyboardAvoidingView style={styles.writeFoodWrapper}>
              <TextInput
                style={styles.input}
                placeholder={'ex.Apple'}
                value={morningfood}
                onChangeText={text => morningsetFood(text)}
              />
            </KeyboardAvoidingView>
            <TouchableOpacity
              style={styles.square}
              onPress={() => morninghandleAddFood()}>
              <View style={styles.addWrapper}>
                <Text style={styles.addFood}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          {morningfoodItems.map((item, index) => {
            return (
              <Item
                key={index}
                text={item}
                onPress={() => morningremoveFood(index, item)}
              />
            );
          })}
        </View>

        <View style={styles.headerwarp}>
          <Text style={styles.text}>Afternoon</Text>
          <View>
            <KeyboardAvoidingView style={styles.writeFoodWrapper}>
              <TextInput
                style={styles.input}
                placeholder={'ex.Apple'}
                value={afternoonfood}
                onChangeText={text => afternoonsetFood(text)}
              />
            </KeyboardAvoidingView>
            <TouchableOpacity
              style={styles.square}
              onPress={() => afternoonhandleAddFood()}>
              <View style={styles.addWrapper}>
                <Text style={styles.addFood}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          {afternoonfoodItems.map((item, index) => {
            return (
              <Item
                key={index}
                text={item}
                onPress={() => afternoonremoveFood(index)}
              />
            );
          })}
        </View>

        <View style={styles.headerwarp}>
          <Text style={styles.text}>Eveing</Text>
          <View>
            <KeyboardAvoidingView style={styles.writeFoodWrapper}>
              <TextInput
                style={styles.input}
                placeholder={'ex.Apple'}
                value={eveningfood}
                onChangeText={text => eveningsetFood(text)}
              />
            </KeyboardAvoidingView>
            <TouchableOpacity
              style={styles.square}
              onPress={() => eveninghandleAddFood()}>
              <View style={styles.addWrapper}>
                <Text style={styles.addFood}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          {eveningfoodItems.map((item, index) => {
            return (
              <Item
                key={index}
                text={item}
                onPress={() => eveningremoveFood(index)}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function Screenchoose(navigation) {
  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView style={styles.writeFoodWrapper}>
        <TextInput style={styles.input} placeholder={'ex.Apple'}/>
      </KeyboardAvoidingView>
      <TouchableOpacity>
        <View style={styles.addWrapper}>
          <Text style={styles.addFood}>+</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function App(){
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Day_Screen" component={ScreenDay} options={{title: 'Food Tacker'}}/>
        <Stack.Screen name="Screen_choose" component={Screenchoose} options={{title: 'Food Tacker'}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
    
};

const styles = StyleSheet.create({
  headerwarp: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 10,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#ff667f',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
  },
  writeFoodWrapper: {
    position: 'absolute',
    right: 255,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    padding: 15,
    width: 250,
    backgroundColor: '#ff667f',
    borderRadius: 60,
    bottom: 20,
  },
  square: {
    width: 24,
    height: 24,
    backgroundColor: '#ff667f',
    opacity: 0.4,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
  },
  addWrapper: {},
  addFood: {
    fontSize: 24, 
    fontWeight: 'bold', 
    bottom: 5},
});

export default App;
