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
  const [morningfood, morningsetFood] = useState({name: "", protein:null, carb: null, fat:null, calories:null});
  const [morningfoodItems, morningsetFoodItems] = useState([]);
  const [afternoonfood, afternoonsetFood] = useState({name: "", protein:null, carb: null, fat:null, calories:null});
  const [afternoonfoodItems, afternoonsetFoodItems] = useState([]);
  const [eveningfood, eveningsetFood] = useState({name: "", protein:null, carb: null, fat:null, calories:null});
  const [eveningfoodItems, eveningsetFoodItems] = useState([]);
  const [currdate, setCurrDate] = useState(today);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalprotein, setTotalProtein] = useState(0);
  const [totalcarb, setTotalCarb] = useState(0);
  const [totafat, setTotalFat] = useState(0);
  const [totalcalories, setTotalCalories] = useState(0);
  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Foodentry (ID INTEGER PRIMARY KEY AUTOINCREMENT, Date TEXT, Time TEXT, Food TEXT, Protein TEXT, Carb TEXT, Fat TEXT, Calories TEXT)'
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
    try {
      await db.transaction(async tx => {
        tx.executeSql(
          "INSERT INTO Foodentry (Date, Time, Food, Protein, Carb, Fat, Calories) VALUES (?,?,?,?,?,?,?)",
        [currdate, time, food.name, food.protein, food.carb, food.fat, food.calories],
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
          'SELECT * FROM Foodentry WHERE Date=?',
          [currdate],
          (tx, results) => {
            let enrty = results.rows;
            for(var i = 0; i < enrty.length; i++){
              if(enrty.item(i).Time == 'Morning'){
                morningsetFoodItems(morningfoodItems => [...morningfoodItems, {name: enrty.item(i).Food, protein: enrty.item(i).Protein, carb: enrty.item(i).Carb, fat: enrty.item(i).Fat, calories: enrty.item(i).Calories}]);
              }
              else if(enrty.item(i).Time == 'Afternoon'){
                afternoonsetFoodItems(afternoonfoodItems => [...afternoonfoodItems, {name: enrty.item(i).Food, protein: enrty.item(i).Protein, carb: enrty.item(i).Carb, fat: enrty.item(i).Fat, calories: enrty.item(i).Calories}]);
              }
              else{
                eveningsetFoodItems(eveningfoodItems => [...eveningfoodItems, {name: enrty.item(i).Food, protein: enrty.item(i).Protein, carb: enrty.item(i).Carb, fat: enrty.item(i).Fat, calories: enrty.item(i).Calories}]);
              } 
              setTotalProtein(totalprotein => Number(totalprotein)+Number(enrty.item(i).Protein));
              setTotalCarb(totalcarb => Number(totalcarb)+Number(enrty.item(i).Carb));
              setTotalFat(totafat => Number(totafat)+Number(enrty.item(i).Fat));
              setTotalCalories(totalcalories => Number(totalcalories)+Number(enrty.item(i).Calories));
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
        tx.executeSql('DELETE FROM Foodentry WHERE Date=? AND Time=? AND Food=? AND Protein=? AND Carb=? AND Fat=? AND Calories=?', 
        [
          currdate,time,food.name,food.protein,food.carb,food.fat,food.calories
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
        tx.executeSql('DROP TABLE Foodentry', [],
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
    morningsetFood({name: "", protein:null, carb: null, fat:null, calories:null});
    setTotalProtein(Number(totalprotein)+Number(morningfood.protein));
    setTotalCarb(Number(totalcarb)+Number(morningfood.carb));
    setTotalFat(Number(totafat)+Number(morningfood.fat));
    setTotalCalories(Number(totalcalories)+Number(morningfood.calories))
  };

  const morningremoveFood = (index, item) => {
    removeData('Morning',item);
    let foodCopy = [...morningfoodItems];
    foodCopy.splice(index, 1);
    morningsetFoodItems(foodCopy);
    setTotalProtein(Number(totalprotein)-Number(item.protein));
    setTotalCarb(Number(totalcarb)-Number(item.carb));
    setTotalFat(Number(totafat)-Number(item.fat));
    setTotalCalories(Number(totalcalories)-Number(item.calories))
  };

  const afternoonhandleAddFood = () => {
    // clearTable();
    Keyboard.dismiss();
    insertData('Afternoon', afternoonfood);
    afternoonsetFoodItems([...afternoonfoodItems, afternoonfood]);
    afternoonsetFood({name: "", protein:null, carb: null, fat:null, calories:null});
    setTotalProtein(Number(totalprotein)+Number(afternoonfood.protein));
    setTotalCarb(Number(totalcarb)+Number(afternoonfood.carb));
    setTotalFat(Number(totafat)+Number(afternoonfood.fat));
    setTotalCalories(Number(totalcalories)+Number(afternoonfood.calories))
  };

  const afternoonremoveFood = (index, item)  => {
    removeData('Afternoon',item);
    let foodCopy = [...afternoonfoodItems];
    foodCopy.splice(index, 1);
    afternoonsetFoodItems(foodCopy);
    setTotalProtein(Number(totalprotein)-Number(item.protein));
    setTotalCarb(Number(totalcarb)-Number(item.carb));
    setTotalFat(Number(totafat)-Number(item.fat));
    setTotalCalories(Number(totalcalories)-Number(item.calories))
  };

  const eveninghandleAddFood = () => {
    Keyboard.dismiss();
    insertData('Evening', eveningfood);
    eveningsetFoodItems([...eveningfoodItems, eveningfood]);
    eveningsetFood({name: "", protein:null, carb: null, fat:null, calories:null});
    setTotalProtein(Number(totalprotein)+Number(eveningfood.protein));
    setTotalCarb(Number(totalcarb)+Number(eveningfood.carb));
    setTotalFat(Number(totafat)+Number(eveningfood.fat));
    setTotalCalories(Number(totalcalories)+Number(eveningfood.calories))
  };

  const eveningremoveFood = (index, item)  => {
    removeData('Evening',item);
    let foodCopy = [...eveningfoodItems];
    foodCopy.splice(index, 1);
    eveningsetFoodItems(foodCopy);
    setTotalProtein(Number(totalprotein)-Number(item.protein));
    setTotalCarb(Number(totalcarb)-Number(item.carb));
    setTotalFat(Number(totafat)-Number(item.fat));
    setTotalCalories(Number(totalcalories)-Number(item.calories))
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
    setTotalFat(0);
    setTotalCarb(0);
    setTotalProtein(0);
    setTotalCalories(0);
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
          <Text>Calories {totalcalories}</Text>
          <Text>Protein {totalprotein}</Text>
          <Text>Carb {totalcarb}</Text>
          <Text>Fat {totafat}</Text>
        </View>
        <View style={styles.headerwarp}>
          <Text style={styles.text}>Morning</Text>
          <View>
            <KeyboardAvoidingView style={styles.writeFoodWrapper}>
              <TextInput
                style={styles.input}
                placeholder={'Name'}
                value={morningfood.name}
                onChangeText={text => morningsetFood(prevState => ({
                  ...prevState, name: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Calories'}
                keyboardType="numeric"
                value={morningfood.calories}
                onChangeText={text => morningsetFood(prevState => ({
                  ...prevState, calories: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Protein'}
                keyboardType="numeric"
                value={morningfood.protein}
                onChangeText={text => morningsetFood(prevState => ({
                  ...prevState, protein: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Fat'}
                keyboardType="numeric"
                value={morningfood.fat}
                onChangeText={text => morningsetFood(prevState => ({
                  ...prevState, fat: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Carb'}
                keyboardType="numeric"
                value={morningfood.carb}
                onChangeText={text => morningsetFood(prevState => ({
                  ...prevState, carb: text
                }))}
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
                placeholder={'Name'}
                value={afternoonfood.name}
                onChangeText={text => afternoonsetFood(prevState => ({
                  ...prevState, name: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Calories'}
                keyboardType="numeric"
                value={afternoonfood.calories}
                onChangeText={text => afternoonsetFood(prevState => ({
                  ...prevState, calories: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Protein'}
                keyboardType="numeric"
                value={afternoonfood.protein}
                onChangeText={text => afternoonsetFood(prevState => ({
                  ...prevState, protein: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Fat'}
                keyboardType="numeric"
                value={afternoonfood.fat}
                onChangeText={text => afternoonsetFood(prevState => ({
                  ...prevState, fat: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Carb'}
                keyboardType="numeric"
                value={afternoonfood.carb}
                onChangeText={text => afternoonsetFood(prevState => ({
                  ...prevState, carb: text
                }))}
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
                placeholder={'Name'}
                value={eveningfood.name}
                onChangeText={text => eveningsetFood(prevState => ({
                  ...prevState, name: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Calories'}
                keyboardType="numeric"
                value={eveningfood.calories}
                onChangeText={text => eveningsetFood(prevState => ({
                  ...prevState, calories: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Protein'}
                keyboardType="numeric"
                value={eveningfood.protein}
                onChangeText={text => eveningsetFood(prevState => ({
                  ...prevState, protein: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Fat'}
                keyboardType="numeric"
                value={eveningfood.fat}
                onChangeText={text => eveningsetFood(prevState => ({
                  ...prevState, fat: text
                }))}
              />
              <TextInput
                style={styles.input}
                placeholder={'Carb'}
                keyboardType="numeric"
                value={eveningfood.carb}
                onChangeText={text => eveningsetFood(prevState => ({
                  ...prevState, carb: text
                }))}
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
    right: 1000,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    padding: 15,
    width: 200,
    margin: 'auto',
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
