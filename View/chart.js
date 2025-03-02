import React, { Component } from "react";
import { StyleSheet, View, Text, Button, Dimensions } from 'react-native';
import Constants from 'expo-constants'
import App, { ph, storeUser, keys, mergeItem, getEl } from "../App";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { Switch } from "react-native-gesture-handler";
import { LogBox } from "react-native"


//get the height and the width of the screen 
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;


const ch3Config = {
  color: (opacity = 1) => `rgba(2, 255, 0, ${opacity})`,
  backgroundGradientToOpacity: 0,
  backgroundGradientFromOpacity: 0,
  useShadowColorFromDataset: false // optional
};

export const MiniChart = (params) => {
  return (
    <ProgressChart
      data={params.acc ? [params.acc] : [0.001]}
      width={100}
      height={100}
      radius={35}
      chartConfig={ch3Config}
      hideLegend={true}
    />

  )
}


//chart wpm component.Please pass an array of Number
export const WpmChart = (params) => {
  return (
    <LineChart
      data={{
        labels: ['Initial Period', ' ', ' ', ' ', ' ', 'Now'],
        datasets: [{
          data: params.wpms,
        }],
        legend: ["Wpm"]
      }}
      width={width - 20} // from react-native
      height={height / 4}
      yAxisLabel={'W'}
      chartConfig={{
        backgroundColor: '#197278',
        backgroundGradientFrom: '#233d4d',
        backgroundGradientTo: '#197278',
        decimalPlaces: 2, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16
        }
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  )
}

export const AccChart = (params) => {
  return (
    <LineChart
      data={{
        labels: ['Initial Period', ' ', ' ', ' ', ' ', 'Now'],
        datasets: [{
          data: params.wpms,
        }],
        legend: ["Accuracy"]
      }}
      width={width - 20} // from react-native
      height={height / 4}
      yAxisLabel={'%'}
      chartConfig={{
        backgroundColor: '#e26a00',
        backgroundGradientFrom: '#233d4d',
        backgroundGradientTo: '#197278',
        decimalPlaces: 2, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16
        }
      }}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  )
}