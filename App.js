/* In this file you'll find:
    -app navigator
    -wpm play view+controller (so the page of the wpm test,the core activity of the entire app)
    -CustomT:a custom widget that returns a green text if the 2 strings passed are equals,otherwise it will return a red text
     from the textinput, we build an array of those text.Each element of that array will contain the CustomT,with the typed text
    -Main class:is the core class of the app.It has a bunch of different methods.
    -storage
!!!!----It is not allowed to copy the code OR the entire app idea.Offenders are subject to sanctions provided for.----!!!!
*/
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Result, Home, Start } from './View/view';
import React, { Component, useState } from 'react';
import { Button, StyleSheet, Text, View, TextInput, KeyboardAvoidingView, SafeAreaView, Vibration, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
var randomWords = require('random-words')





//get the height and the width of the screen 
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
var controllo = 0;
export var ph = "";
var arrText = []
var NUM = 9000//number of words in a phrase
var cnt = 0;
var giuste = 0;


//============================================^^^^^^^^^^^============================================
//--------------------------------------------PUNCTUATION--------------------------------------------
//===========================================************============================================


//-------------------------EASY MODE-------------------------
function randomize() {
  rand = 0
  temp = randomWords(NUM);
  ph = temp.join(' ')
}

//-------------------------HARD MODE-------------------------
function randomizeHard() {
  rand = 0
  temp = randomWords(NUM);
  for (i = 0; i < NUM; i++) {
    rand = (Math.floor(Math.random() * 4))
    if (rand == 3)
      temp[i] += ','
    if (rand == 0)
      temp[i] += '.'
  }
  ph = temp.join(' ')
}




//====================================================^^^^^^^===================================================
//----------------------------------------------------STORAGE---------------------------------------------------
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

//access key to the storage
export const keys = {
  record: "Record",
  punteggiatura: "punt",
  num: "regNum",
  total: "accTotal",
  chart1: "chartWpm",
  chart2: "chartAccuracy"
}

//store a value and replace the existing one
export const storeUser = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(error);
  }
};



export const getEl = async (key) => {
  const t = await AsyncStorage.getItem(keys.total)
  setInterval(() => {
    console.warn(t)
  }, 1000);
}


//=========================================🌆🏙️🌃🌇🏙️================================================
//-----------------------------------------STYLESHEET----------------------------------------------
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

const styles = StyleSheet.create({
  testo: { fontSize: 20 },
  textInp: { height: 130, fontSize: 30, margin: 5, color: "white", fontWeight: "500", borderColor: "white", borderWidth: 0.5, justifyContent: "center", alignItems: "center", textAlign: "center" },
  correctionText: { alignItems: "center", justifyContent: 'space-around', paddingTop: 30, paddingBottom: 40 },
  timer: { fontSize: 60, color: "white", fontWeight: "900" },
  timerView: { borderWidth: 3, alignItems: "center", justifyContent: 'space-around', borderColor: "white" }
});



//---------------------------------Custom Text Component(green or red text)--------------------------------
export var CustomT = (props) => {
  const t = props.text.split(" ");
  const check = ph.split(" ");
  return (t[1] == check[cnt] || t[0] == check[cnt]) ? (
    <Text style={{ color: 'green', fontSize: 70 }}>{check[cnt]}</Text>
  ) : (
    <Text style={{ color: 'red', fontSize: 70 }}>{check[cnt]}</Text>
  );
};






// |-------------------------------------------------------------------------------------------------------------------------------|
// |                                                   ***********************                                                     |
// |================================================CLASS MAIN,the WPM measurement=================================================|
// |                                                   ***********************                                                     |
// |-------------------------------------------------------------------------------------------------------------------------------|



class Main extends Component {
  //================================================-------------------------------==============================================
  //================================================🏗️🚧🛠️ CLASS CONSTRUCTOR 🏗️🚧🛠️==============================================
  constructor({ navigation, route }) {
    giuste = 0
    super();
    this.s = '';
    this.counter = 0
    this.state = {
      colore: "black",
      text: '',//typed text
      typed: '',
      finito: false,//state of typing
      edit: true,
      time: 60,//for mode 2,the remaining time that users got
      record: 0,//user wpm record
      punteg: this.getPunctuation(),
      blink: 2
    };
    this.navigation = navigation
    this.route = route //Navigator's route
    this.arr = []; //array for the text stack
    this.timer
    this.getWpm()
    cnt = 0
    //checking mode passed

    if (this.state.punteg == true) {
      randomizeHard()
    }
    else {
      randomize()
      console.log("okkkkk")
    }

    if (route.params.mode == 2) {
      this.timer()//STARTING THE TIMER
    }
  }

  //=============================================================🚥🚥🚥🚥🚥🚥🚥🚥🚥===========================================================
  //-------------------------------------------------------------SAVE THE ACCURACY------------------------------------------------------------
  //_____________________________________________________________/\/\/\/\/\/\/\/\/\___________________________________________________________

  pushItemChart = async (date, wpm, rig) => {
    AsyncStorage.getItem(keys.chart1)
      .then((contacts) => {
        const c = contacts ? JSON.parse(contacts) : [];
        c.push({ data: date, num: wpm });
        AsyncStorage.setItem(keys.chart1, JSON.stringify(c));
      });
    //similar function but with the accuracy,in order to add a line for accuracy in the chart.
    AsyncStorage.getItem(keys.chart2)
      .then((d) => {
        const r = d ? JSON.parse(d) : [];
        r.push({ data: date, num: rig });
        AsyncStorage.setItem(keys.chart2, JSON.stringify(r));

        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!=============", rig)
      });
  }


  //save the accuracy total
  saveAcc = async (a) => {
    await AsyncStorage.setItem(keys.total, JSON.stringify(a))
    const t = await AsyncStorage.getItem(keys.total)
    console.log("----------------------------------------------=========THE TOTAL ACCURACY IS:", a)
  }
  //save the number of items(to calculate the average)
  saveNumAcc = async (i) => {
    await AsyncStorage.setItem(keys.num, JSON.stringify(i))
    const s = await AsyncStorage.getItem(keys.num)
    console.log("the total number of acc is:", s)
  }
  //get the last item saved and then use the functions saveNumAcc and saveAcc to save and update them 
  saveAccuracy = async (accuracy) => {
    await AsyncStorage.getItem(keys.total).then((last) => {
      //console.log("----------ACCURACY SAVED IS RETURNED AS:",last)
      somma = 0
      l = 0
      if (last != null) {
        l = Number(String(last.split('"').join('')).toString());
        somma = l + accuracy;
        console.log("=============--------------------=SUM OF ACCURACY IS:", somma)
      }
      else {
        somma = accuracy + l
        console.log("=============--------------------=SUM OF ACCURACY IS:", somma)
      }
      if (last == null)
        somma = accuracy + 0

      this.saveAcc(somma)
    })

    await AsyncStorage.getItem(keys.num).then((x) => {
      l = 0
      if (x != null)
        l = Number(x.split('"').join('')) + 1;
      else
        l = 1
      this.saveNumAcc(l)
    })
  }

  getPunctuation = async () => {
    await AsyncStorage.getItem(keys.punteggiatura).then((t) => {
      this.setState({ ...this.state, punteg: t })
      if (t == 'true') {
        randomizeHard()
        console.log("ENTRTO", t)
        this.setState({ ...this.state, phrase: ph })
      }
      if (t == 'false') {
        randomize()
        this.setState({ ...this.state, phrase: ph })
      }
      return t
    })
  }

  //get record wpm data from the storage
  getWpm = async () => {
    try {
      const value = await AsyncStorage.getItem(keys.record)
      if (value !== null) {
        this.setState({ ...this.state, record: value.toString() })
      }
    } catch (e) {
      console.error(e);
    }
  }



  //blink green when correct
  blink() {

    var t = setInterval(() => {
      this.setState({ ...this.state, colore: "blue", blink: this.state.blink - 1 })
      if (this.state.blink == 0) {
        this.setState({ ...this.state, colore: "black", blink: 10 })
        clearInterval(t)
      }
    }, 10)


  }


  //fill the arr with green or red text
  fillAr(word, check) {
    if (cnt == 0) input = word[0]
    if (cnt > 0) input = word[1]
    if (input == check) {
      this.blink()
      giuste++;//keep the count of how many right word the user writes
      this.route.params.mode == 2 ? Vibration.vibrate([5, 2], false) : null
    }
    if (input == check) {//if the typed text is equal to the one given...
      this.arr.push(<Text style={{ color: 'green' }}>{input + " "}</Text>);
    } else {
      this.arr.push(<Text style={{ color: 'red' }}>{input + " "}</Text>);
    }
  }


  //reset function:end writing.
  reset() {
    this.setState({ text: '', finito: true });
    cnt = 0;
  }




  //----------------------------------------------
  //👷‍♂️👷‍♂️👷‍♂️👷🏼‍♀️👷🏼‍♀️👷🏼‍♀️handle the text change👷‍♂️👷‍♂️👷‍♂️👷🏼‍♀️👷🏼‍♀️👷🏼‍♀️
  //==============================================

  handleCh = (arg) => {
    //arg is passed automatically by the texinput and it is the text 
    if (arg.length < 100) {//max len:100 char
      this.setState({ ...this.state, text: arg });//store the typed text into the state of the class
    }

    //*************************************************************************************************************** 
    //==================================================MODE 1=======================================================
    //                            ...........................................

    if (this.route.params.mode == 1) {
      psText = arg;
      const ck = ph.split(' ');//divide the text into an array of strings.each value of the array contains 1 word
      const tx = arg.split(' ');


      if (arg.endsWith(' ') && this.state.text != '' && arg != ' ') {
        this.fillAr(tx, ck[cnt]);
        if (tx[1] == ck[cnt]) controllo++;
        this.setState({ ...this.state, text: " " })
        cnt++;//increment the counter of how many words are written inside the textinput box
        this.counter++//it counts how many words the user wrote
      }
      if (cnt == (ck.length)) {
        this.setState({ ...this.state, finito: true });
        cnt = 0;
      };
      arg = null
    }

    //*************************************************************************************************************** 
    //==================================================MODE 2=======================================================
    //                            ...............................................

    else if (this.route.params.mode == 2) {
      var regExp = /[a-zA-Z]/;
      var maxStr = String(this.state.record).toString()
      var max = Number(maxStr.split('"').join(' '))
      psText = arg;
      const ck = ph.split(' ');//divide the text into an array of strings.each value of the array contains 1 word
      const tx = arg.split(' ');
      if (arg.endsWith(' ') && regExp.test(arg)) { //word ends.change word only if the user wrote some letters and if the word ends with an empty space
        this.fillAr(tx, ck[cnt]);
        if (tx[1] == ck[cnt]) controllo++;
        this.setState({ ...this.state, text: " " })
        cnt++;//increment the counter of how many words are written inside the textinput box
        this.counter++
      }
      //if user finished the words
      if (cnt == (ck.length)) {
        console.log("R. WDS NUMBER IS:", giuste)
        this.saveAccuracy(giuste / cnt * 100)
        d = new Date(Date.now())
        this.pushItemChart(d.toLocaleDateString("en-US"), cnt, giuste)
        this.setState({ ...this.state, finito: true })
      };

      if (cnt > max)
        storeUser(keys.record, cnt.toString())
      arg = null
    }

  }


  //|||||||||||||||||||||||||||||||||||||||----------------------------------.....--------------------------------|||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||==================================TIMER================================|||||||||||||||||||||||||||||||||||||||
  //|||||||||||||||||||||||||||||||||||||||(((((((((((((((((((((((((((((((((((⏱️))))))))))))))))))))))))))))))))))|||||||||||||||||||||||||||||||||||||||

  timer() {
    setInterval(() => {
      this.setState({ ...this.state, time: this.state.time - 1 })
      if (this.state.time == 0) {
        console.log("GIUSTE(RIGHT WORDS) IS:", giuste)
        this.saveAccuracy(giuste / cnt)
        d = new Date(Date.now())
        this.pushItemChart(d.toLocaleDateString("en-US"), cnt, giuste)
        this.setState({ ...this.state, finito: true })
      }
    }, 1000);
  }


  //-------------------------------------------PLAY WPM VIEW-----------------------------------------------
  render() {
    return (
      <SafeAreaView>
        <View style={{ backgroundColor: this.state.colore, height: height }}>
          {(this.route.params.mode == 2) ? (//if mode passed is 2 show the timer 
            <View style={styles.timerView}>
              <Text style={styles.timer}>{this.state.time}</Text>
            </View>) : null}


          <View style={styles.correctionText}>
            <CustomT text={this.state.text} />
          </View>


          <KeyboardAvoidingView behavior="padding">

            <TextInput
              placeholder="Write as fast as you can🔥"
              multiline={false}
              value={this.state.text}
              onChangeText={this.handleCh.bind(this)}
              style={styles.textInp}
              autoFocus={true}
              autoCorrect={false}
              caretHidden={true}
              autoCapitalize="none"
              onSubmitEditing={null}
              placeholderTextColor={"white"}
            />

            <Button title="STOP" onPress={() => this.reset()} />

            {this.state.finito ? (
              this.navigation.navigate('Result', { s: this.arr, giuste: giuste, mode: this.route.params.mode, numeroWord: NUM, counter: this.counter })
            ) : null}
          </KeyboardAvoidingView>
        </View>
      </SafeAreaView>
    );
  }
} //----------------------------------------------End of Class MAIN----------------------------------------------









//===============================================APP NAVIGATOR=================================================
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenListeners={{
        state: (e) => {
          // Do something with the state
          //getWpm()
        },
      }}>
        <Stack.Screen name="Main" component={Main} options={
          {
            title: "Words per Minute🏋️",
            headerStyle: { backgroundColor: "#1A181B", },
            headerTitleStyle: { color: "white", fontSize: 25, fontWeight: "bold" },

          }}

        />
        <Stack.Screen name="Home" component={Home} initialParams={{ rec: "" }}
          options={
            {
              title: "Words per Minute🏋️",
              headerStyle: { backgroundColor: "#1A181B", },
              headerTitleStyle: { color: "white", fontSize: 25, fontWeight: "bold" },

            }}

        />
        <Stack.Screen name='Start' component={Start} options={{ headerShown: false }} />
        <Stack.Screen name="Result" component={Result} initialParams={{ s: arrText, phrase: ph }}
          options={{
            headerBackVisible: false,
            gestureEnabled: false,
            title: "Words per Minute🏋️",
            headerStyle: { backgroundColor: "#1A181B", },
            headerTitleStyle: { color: "white", fontSize: 25, fontWeight: "bold" },
          }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
//Words Per Minute ✍️