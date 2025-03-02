import React, { Component } from "react";
import { StyleSheet, View, Text, Button, ScrollView, Dimensions } from 'react-native';
import Constants from 'expo-constants'
import App, { ph, storeUser, keys, mergeItem, getEl } from "../App";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from 'react-native-chart-kit';
import { Switch } from "react-native-gesture-handler";
import { LogBox } from "react-native"
import { WpmChart, AccChart, MiniChart } from "./chart";

LogBox.ignoreAllLogs(true)
var tempRec//for refreshing the record on home screen 
//get the height and the width of the screen 
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;


//-------------------GLOBAL STYLESHEET----------------------
//==========================================================
const styles = StyleSheet.create({
  testo: { fontSize: 30 },
  result: { justifyContent: 'flex-start', alignItems: 'center', paddingTop: 34, flex: 1, backgroundColor: "#ced4da", minHeight: height - height / 7, padding: 10 },
  cardRecord: { flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" },
  StartView: { backgroundColor: 'black' },
  acc: { fontSize: 30 },
  wpm: { fontSize: 40 },
  wpmCard: { backgroundColor: "rgb(0,25,255)", flexDirection: "row", borderRadius: 15, height: 100, width: width - 20, margin: 10, alignItems: "center", justifyContent: "center" }
});

//-----------RESULT screen(added to the navigation stack of the play screen)-----------
export class Result extends Component {
  constructor({ navigation, route }) {
    super()
    this.navigation = navigation
    this.route = route
    this.state = {
      r: "",
      finalPh: " "
    }
    this.pF = " "//since the entire phrase is long(now is 9000 words),we print only what we need 
    this.getRecord()
    this.phrase = ph.split(' ')
    console.log(this.route.params.s)
    this.createArray(this.phrase)
  }

  createArray = (x) => {
    for (var i = 1; i < this.route.params.counter; i++) {
      this.pF += x[i] + " "
      console.log(this.pF)
    }
    this.setState({ ...this.state, finalPh: this.pF })
  }

  getRecord = async () => {//getting the record
    const t = await AsyncStorage.getItem(keys.record)
    const i = await AsyncStorage.getItem(keys.total)//get the total accuracy
    this.setState({ ...this.state, r: Number(t.toString().split('"').join('')) })
    console.log("TOTAL RETURNED WPM ON THE HOME IS:", t)
    return Number(t.toString().split('"').join(''))
  }
  componentDidMount() {
    this.getRecord()
  }

  render() {
    //it must take an array of text as prop
    return (        //route.params.phrase
      <ScrollView style={{ backgroundColor: "#ced4da" }}>
        <View style={styles.result}>
          {(this.route.params.mode == 2) ? (
            <Text style={styles.acc}>WPM:{(this.route.params.counter)}/min</Text>)
            : null
          }
          <Text style={styles.acc}>Accuracy:{Number(((this.route.params.giuste / this.route.params.counter).toFixed(2)) * 100).toFixed(1)}%</Text>

          <Text>{this.pF}</Text>
          <Text>{"\n\n"}</Text>

          <Text style={styles.testo}>
            {this.route.params.s.map((item, key) => (
              <Text key={key}>{item}</Text>))}
          </Text>

          <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: Constants.statusBarHeight }}>
            <Button title="HOME" onPress={() => this.navigation.navigate('Home', { rec: this.state.r })} />
          </View>
        </View>
      </ScrollView>
    )
  }
}


export const Start = ({ navigation }) => {
  return (

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="START" onPress={() => navigation.navigate("Main", { mode: 2 })} />
    </View>

  )
}


//-----------HOME page(the main page of the app)----------
export class Home extends Component {
  //================================================-------------------------------============================================
  //================================================🏗️🚧🛠️ CLASS CONSTRUCTOR 🏗️🚧🛠️==============================================
  constructor({ navigation, route }) {
    super()
    this.navigation = navigation
    this.route = route

    this.state = {
      r: this.route.params.rec,
      time: 0,
      ac: 0,
      dataC: [],
      dataC2: [],
      accArray: [],
      wpms: [],
      punc: false,
      prov: " ",
    }
    this.timer()//it makes the components getting reloaded
    this.getDataChart()
    this.getPunc()


  }

  //GETTING DATA FOR CHART RENDER
  getDataChart = async () => {
    await AsyncStorage.getItem(keys.chart1).then((contacts) => {
      const c = contacts ? JSON.parse(contacts) : [];
      this.setState({ ...this.state, dataC: c })
      //a = []
      c.map((s) => { this.setState({ ...this.state, wpms: [...this.state.wpms, s.num] }) })

    })
    //retriving data for the second chart(accuracy c.)
    await AsyncStorage.getItem(keys.chart2).then((contacts) => {
      const c = contacts ? JSON.parse(contacts) : [];
      this.setState({ ...this.state, dataC2: c })
      //a = []
      c.map((s) => { this.setState({ ...this.state, accArray: [...this.state.accArray, s.num] }) })

    })
  }
  //-------------------------------------------------------________________-----------------------------------------------------
  //=======================================================ERASE THE MEMORY=====================================================
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::🆑::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  //delete the whole app storage
  eraseMemory = async () => {
    await AsyncStorage.setItem(keys.chart1, JSON.stringify([]))
    await AsyncStorage.setItem(keys.chart2, JSON.stringify([]))
    await AsyncStorage.setItem(keys.record, JSON.stringify(""))
    await AsyncStorage.setItem(keys.num, JSON.stringify(""))
    await AsyncStorage.setItem(keys.total, JSON.stringify(""))
  }
  eraseChart = async () => {
    await AsyncStorage.setItem(keys.chart1, JSON.stringify([]))
    await AsyncStorage.setItem(keys.chart2, JSON.stringify([]))
  }


  //____________________________________________________________________🚊________________________________________________________________
  //===========================================SET THE PUNCTUATION TRUE OR FALSE:SWITCH WITH A BUTTON=====================================
  //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


  //UPDATE THE RECORD ON THE HOME SCREEN
  getRecord = async () => {//getting the record
    await AsyncStorage.getItem(keys.record).then((H) => {
      const p = H
      this.setState({ ...this.state, r: p })
    })
    var a = 0
    await AsyncStorage.getItem(keys.total).then((el) => {
      a = el
    })
    const n = await AsyncStorage.getItem(keys.num).then((e) => {
      this.setState({ ...this.state, ac: a / e })

    })

    //return Number(t.toString()?t.toString().split('"').join(''):"")
  }


  //|||||||||||||||||||||||||||||||||||||||----------------------------------.....--------------------------------|||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||==================================TIMER================================|||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||(((((((((((((((((((((((((((((((((((⏱️))))))))))))))))))))))))))))))))))|||||||||||||||||||||||||||||||||||||||

  timer() {
    setInterval(() => {
      this.getRecord()
    }, 100);
  }

  //internal functions for setting the punctuation   
  getPunc = async () => {
    await AsyncStorage.getItem(keys.punteggiatura).then((x => {
      console.log("INITIAL VALUE PUNTEGG:", x)
      this.setState({ ...this.state, punc: x })
      console.log("INITIAL STATE PUNTEGG:", this.state.punc)
    }))
  }
  setPunc = async (bol) => {
    await AsyncStorage.setItem(keys.punteggiatura, JSON.stringify(bol))
    this.setState({ ...this.state, punc: bol })
  }

  //set the punctuation active or not.
  trigger() {
    console.log(this.state.punc)
    console.log(typeof (false))
    if (Boolean(this.state.punc) == Boolean(false)) {
      console.log("PUNTEGGIATURA ATTIVA")
      this.setPunc(true)
      this.setState({ ...this.state, punc: true })
      return;
    }
    if (Boolean(this.state.punc) == Boolean(true)) {
      console.log("PUNTEGGIATURA DISATTIVATA")
      this.setPunc(false)
      this.setState({ ...this.state, punc: false })
      return;
    }
  }

  Settings = () => {
    return (
      <View style={{ width: width, flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Button title="PUNCTUATION" onPress={() => this.trigger()} />
          <Text style={{ color: "white" }}>{this.state.punc == true ? "ON" : "OFF"}</Text>
        </View>

        <Button title="CLEAR APP DATA" onPress={() => this.eraseMemory()} />
        <Button title="ERASE CHART" onPress={() => this.eraseChart()} />

      </View>
    )
  }



  render() {
    return (
      <ScrollView style={{ backgroundColor: '#000000' }}>

        <Text style={{ height: 5 }}>{""}</Text>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white", height: 30, marginLeft: 10 }}>Start Training</Text>
        <Text style={{ fontSize: 14, color: "white", height: 30, marginLeft: 10 }}>Tap on a blue card to start</Text>





        <View style={styles.wpmCard}>

          <View style={styles.cardRecord} >

            <View style={{ flex: 1, flexDirection: "row", width: width - 20, alignItems: "center", justifyContent: "center" }}
              onTouchEnd={() => { this.navigation.navigate("Main", { mode: 1 }) }}>

              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }} >
                <Text style={{ fontSize: 60, paddingLeft: 15 }}>✍️</Text>
              </View>


              <View style={{ width: width / 1.4, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 30, fontWeight: "bold", color: "white" }}>Free Mode </Text>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>Warm Up,no Timer</Text>
              </View>

            </View>
          </View>
        </View>






        <View style={styles.wpmCard}>
          <View style={styles.cardRecord}>


            <View style={{ flex: 1, flexDirection: "row", width: width - 20, alignItems: "center", justifyContent: "center" }}
              onTouchEnd={() => { this.navigation.navigate("Main", { mode: 2 }) }}>

              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 60, paddingLeft: 15 }}>🔥</Text>
              </View>

              <View style={{ width: width / 1.4, alignItems: "center", justifyContent: "center" }}>

                <Text style={{ fontSize: 30, fontWeight: "bold", color: "white" }}>Wpm Test </Text>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>Test your typing speed </Text>
              </View>

            </View>
          </View>
        </View>

        {
          //==============================RECORD==============================
        }

        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white", height: 30, marginLeft: 10 }}>Your Performance</Text>

        <View style={{ height: 200, width: width - 20, backgroundColor: "#fb8b24", borderRadius: 15, margin: 10, flexDirection: "row" }}>


          <View style={{ width: (width) / 1.8, height: 200, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 22, }}>Your WPM record</Text>

            <Text style={{ color: "dark-grey", fontWeight: "bold", fontSize: 30, marginTop: -5 }}>
              {String(this.state.r).split('"').join('') + " "}
            </Text>
            <Text>{""}</Text>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 22, }}>Average Accuracy</Text>
            <Text style={{ color: "dark-grey", fontWeight: "bold", fontSize: 30, marginTop: 0 }}>
              {this.state.ac.toFixed(1) * 100}%
            </Text>
          </View>



          <View style={{ flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 22, }}>Precision</Text>

            <MiniChart acc={this.state.ac}></MiniChart>
          </View>

        </View>


        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white", height: 30, marginLeft: 10 }}>Charts</Text>
        <View style={{ flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center" }}>
          <WpmChart wpms={this.state.wpms}></WpmChart>
          <AccChart wpms={this.state.accArray}></AccChart>
        </View>


        <Text style={{ fontSize: 24, fontWeight: "bold", color: "white", height: 30, marginLeft: 10 }}>Setting</Text>

        <this.Settings></this.Settings>




        <Text>{"\n"}</Text>
        <View style={{ width: width, flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "white" }}>Developed by Edoardo Sorgentone{"\n"}</Text>
        </View>
      </ScrollView>
    )
  }
}


