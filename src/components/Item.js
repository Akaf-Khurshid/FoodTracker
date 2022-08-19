import React from "react";
import { View, Text, StyleSheet} from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from 'react-native-vector-icons/FontAwesome';

const Item = (props) =>{
    return (
      <View style={styles.itemwrap}>
        <View style={styles.item}>
          <Text style={styles.itemText}>Name: {props.text.name}</Text>
          <Text style={styles.itemText}>Calories: {props.text.calories}</Text>
          <Text style={styles.itemText}>Protein: {props.text.protein}</Text>
          <Text style={styles.itemText}>Carb: {props.text.carb}</Text>
          <Text style={styles.itemText}>Fat: {props.text.fat}</Text>
        </View>
        <TouchableOpacity style={styles.square} onPress={props.onPress}>
            <Text style={styles.remove}>-</Text>
        </TouchableOpacity>
      </View>
    );
}

const styles = StyleSheet.create({
    itemwrap: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        margin: 10,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        // flexWrap: "wrap",
        justifyContent: "space-between",
        width: '80%'
    },
    square: {
        width: 24,
        height: 24,
        backgroundColor: '#FF7F7F',
        opacity: 0.4,
        borderRadius: 5,
        marginLeft: 10,
        alignItems: "center",
    },
    itemText:{
        maxWidth: '100%',
    },
    remove: {
        fontSize: 30,
        fontWeight: "bold",
        bottom: 10,
    },
});

export default Item;