/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useRef, useEffect, useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
  Button,
  Modal,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import Item from '../components/Item';
import SQLite from 'react-native-sqlite-storage';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

const db = SQLite.openDatabase(
  {
    name: 'MainDB',
    location: 'default',
  },
  () => {},
  error => {
    console.log(error);
  },
);

const Stack = createStackNavigator();


function ScreenDay({navigation}) {
  //States and event handlers
  // let onetime = false;

  let date = new Date();
  let today = date.toISOString().split('T')[0];
  const [morningfood, morningsetFood] = useState();
  const [morningfoodItems, morningsetFoodItems] = useState([]);
  const [afternoonfood, afternoonsetFood] = useState();
  const [afternoonfoodItems, afternoonsetFoodItems] = useState([]);
  const [eveningfood, eveningsetFood] = useState();
  const [eveningfoodItems, eveningsetFoodItems] = useState([]);
  const [currdate, setCurrDate] = useState(today);
  const [modalVisible, setModalVisible] = useState(false);

  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Foodentry (ID INTEGER PRIMARY KEY AUTOINCREMENT, Date TEXT, Time TEXT, Food TEXT)'
        ,
        [],
        () => {},
        error => {
          console.log('error creating table ' + error.message);
        }
      )
    });
    
  };

  const insertData = async (time, food) => {
    console.log(currdate,food,time);
    try {
      await db.transaction(async tx => {
        tx.executeSql(
          "INSERT INTO Foodentry (Date, Time, Food) VALUES (?,?,?)",
        [currdate, time, food],
        () => {},
        error => {
          console.log(error);
        }
        )
      })
    } catch (error) {
      console.log(error);
    }
  };

  const getData = () => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT Time, Food FROM Foodentry WHERE Date=?',
          [currdate],
          (tx, results) => {
            let enrty = results.rows;
            for(var i = 0; i < enrty.length; i++){
              if(enrty.item(i).Time == 'Morning'){
                morningsetFoodItems(morningfoodItems => [...morningfoodItems, enrty.item(i).Food]);
              }
              else if(enrty.item(i).Time == 'Afternoon'){
                afternoonsetFoodItems(afternoonfoodItems => [...afternoonfoodItems, enrty.item(i).Food]);
              }
              else{
                eveningsetFoodItems(eveningfoodItems => [...eveningfoodItems, enrty.item(i).Food]);
              } 
            }
          },
          error => {
            console.log(error);
          },
        );
      });
    } catch (error) {
      console.log(error);
    }
  };

  const removeData = (time, food) => {
    try {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM Foodentry WHERE Date=? AND Time=? AND Food=?', [
          currdate,
          time,
          food,
        ],
        () => {},
        error => {
          console.log(error);
        },
        );
      });
    } catch (error) {
      console.log(error);
    }
  };

  const clearTable = () => {
    try {
      db.transaction(tx => {
        tx.executeSql('DELETE FROM Foodentry', [],
        () => {
        },
        error => {
          console.log(error);
        },
        );
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    createTable();
    getData();
    navigation.setOptions({
      headerRight: ()=>(
        <Buttondate/>
      )
    })
  },[currdate]);



  const morninghandleAddFood = () => {
    Keyboard.dismiss();
    insertData('Morning', morningfood);
    morningsetFoodItems([...morningfoodItems, morningfood]);
    morningsetFood(null);
  };

  const morningremoveFood = (index, item) => {
    removeData('Morning',item);
    let foodCopy = [...morningfoodItems];
    foodCopy.splice(index, 1);
    morningsetFoodItems(foodCopy);
  };

  const afternoonhandleAddFood = () => {
    Keyboard.dismiss();
    insertData('Afternoon', afternoonfood);
    afternoonsetFoodItems([...afternoonfoodItems, afternoonfood]);
    afternoonsetFood(null);
  };

  const afternoonremoveFood = (index, item)  => {
    removeData('Afternoon',item);
    let foodCopy = [...afternoonfoodItems];
    foodCopy.splice(index, 1);
    afternoonsetFoodItems(foodCopy);
  };

  const eveninghandleAddFood = () => {
    Keyboard.dismiss();
    insertData('Evening', eveningfood);
    eveningsetFoodItems([...eveningfoodItems, eveningfood]);
    eveningsetFood(null);
  };

  const eveningremoveFood = (index, item)  => {
    removeData('Evening',item);
    let foodCopy = [...eveningfoodItems];
    foodCopy.splice(index, 1);
    eveningsetFoodItems(foodCopy);
  };



  const Buttondate = () => {
    return(
      <Button title={currdate} onPress={ () => {
        navigation.setOptions({ title: {currdate} })
        setModalVisible(true);
      }
      }/>
    )
  }

  function handlerCalendar(day){
    setCurrDate(day.dateString);
    setModalVisible(!modalVisible);
    morningsetFoodItems([]);
    afternoonsetFoodItems([]);
    eveningsetFoodItems([]);
  }

  return (
    <ScrollView style={styles.mainContainer}>
      <View>
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={(day) => {
            setModalVisible(!modalVisible);
          }}>
          <Calendar  
          onDayPress={day => {
            handlerCalendar(day)
          }}
          initialDate={currdate}
           />
        </Modal>
      </View>
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
                onPress={() => afternoonremoveFood(index, item)}
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
                onPress={() => eveningremoveFood(index, item)}
              />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

// function Screenchoose(navigation) {
//   return (
//     <View style={styles.container}>
//       <Calendar
//         current={format(baseDate)}
//         minDate={dateFns.subWeeks(baseDate, 1)}
//         maxDate={dateFns.addWeeks(baseDate, 1)}
//         onDayPress={(day) => {
//           console.log('selected day', day);
//         }}
//         theme={{
//           calendarBackground: '#166088',

//           selectedDayBackgroundColor: '#C0D6DF',
//           selectedDayTextColor: '#166088',
//           selectedDotColor: '#166088',

//           dayTextColor: '#DBE9EE',
//           textDisabledColor: '#729DAF',
//           dotColor: '#DBE9EE',

//           monthTextColor: '#DBE9EE',
//           textMonthFontWeight: 'bold',

//           arrowColor: '#DBE9EE',
//         }}
//       />
//     </View>
//   );
// }

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Day_Screen"
          component={ScreenDay}
          options={{headerTitle: 'Food Tacker'}}
        />
        {/* <Stack.Screen
          name="Screen_choose"
          component={Screenchoose}
          options={({ route })=>({headerTitle: 'Food Tacker'})}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

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
    bottom: 5,
  },
  button:{
    margin: 5,
  },
});

export default App;
