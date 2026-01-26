import { Text, View, TouchableOpacity, StyleSheet, Appearance, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useRef } from "react";
import { FontAwesome6 } from '@expo/vector-icons';

import { useCurrency } from "@/context/CurrencyContext";


export default function TimerScreen() {
  const {timeBalance, addTransaction} = useCurrency();

  const [beginTime, setBeginTime] = useState(null);
  const [now, setNow] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lapsedTime, setLapsedTime] = useState(0);

  const backgroundAnim = React.useRef(new Animated.Value(0)).current;

  const colorScheme = Appearance.getColorScheme()
  const styles = createStyles(colorScheme);

  useEffect(() => {
    let interval;

    if (isRunning) {
      setBeginTime(Date.now());
      setNow(Date.now());

      interval = setInterval(() => {
        setNow(Date.now());
      }, 10);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);

  }, [isRunning]);

  useEffect(() => {
    let stopLoop = false;
    if (isRunning) {
      // backgroundAnim.setValue(0.5); TODO: fix why Animated.loop doesnt work here
      Animated.timing(backgroundAnim, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: false,
          }).start(({ finished }) => {
            const startBreathing = () => {
              if (stopLoop) return;

              Animated.sequence([
                Animated.timing(backgroundAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(backgroundAnim, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: false,
          }),
              ]).start(({ finished }) => {
                if (finished && !stopLoop){
                  startBreathing();
                }
              });
            };
            if (finished) startBreathing();
          });
    } else {

      stopLoop = true;
      backgroundAnim.stopAnimation();
      Animated.timing(backgroundAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }

    return() => {
      stopLoop = true;
    };
  }, [isRunning]);

  const time = isRunning ? (now - beginTime + lapsedTime) : lapsedTime;


  const startTime = () => {
    setIsRunning(true);
  }

  const stopTime = () => {
    setIsRunning(false);
    setLapsedTime(time);
  }

  const resetTime = () => {
    const sessionEarnings = isRunning ? now - beginTime + lapsedTime: lapsedTime;

    if (sessionEarnings > 0) {
      addTransaction(sessionEarnings, 'INCOME', 'Productivity Session')

    }

    setIsRunning(false);
    setLapsedTime(0);
    setBeginTime(null);
    setNow(null);
  }

  const formatTime = (ms) => {
    if (!ms) return "00:00:00:000";
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
  //TODO: learn more about Animated (interpolate, useRef, etc)
  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#fff', '#e8f5e9', '#a5d6a7']
  });

  return (
    <Animated.View style={[styles.mainView, { backgroundColor }]}>
      <SafeAreaView style={styles.walletContainer}>
        <FontAwesome6 name="coins" size={18} color="gold" />
        <Text style={styles.balanceText}>
          {formatTime(timeBalance)}
        </Text>
      </SafeAreaView>
      <Text style={styles.timeText}>
        {formatTime(time)}
      </Text>
      <View style={{ flexDirection: "row", gap: 20 }}>
        {/* TODO: find better alternative than `gap` above */}
        {isRunning ? (
          <TouchableOpacity style={styles.stopButton} onPress={stopTime}>
            <FontAwesome6 name="pause" size={24} color="maroon" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={startTime}>
            <FontAwesome6 name="play" size={24} color="darkblue" />
          </TouchableOpacity>
        )
        }
        {time > 0 && (
          <TouchableOpacity style={styles.resetButton} onPress={resetTime}>
            <FontAwesome6 name="rotate-left" size={24} color="gray" />
          </TouchableOpacity>
        )}
      </View>

    </Animated.View>
  );
}

const buttonBase = {
  width: 80,
  height: 80,
  borderRadius: 40,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
}

function createStyles(theme) {
  return StyleSheet.create({
    mainView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      // gap: 20,
    },
    timeText: {
      fontSize: 48,
      fontWeight: 'bold',
      marginBottom: 50,
      fontVariant: ['tabular-nums']
    },
    startButton: {
      ...buttonBase,
      borderColor: 'blue',
      backgroundColor: 'dodgerblue'
    },
    stopButton: {
      ...buttonBase,
      borderColor: 'darkred',
      backgroundColor: 'red'
    },
    resetButton: {
      ...buttonBase,
      borderColor: 'black',
      backgroundColor: 'lightgray'
    },
    buttonText: {
      color: 'black',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center'
    },
    walletContainer: {
      position: 'absolute', //TODO: alternative to absolute position
      top: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#333',
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 20,
      gap: 8,
      elevation: 4,
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
    },
    balanceText: {
      color: 'gold',
      fontWeight: 'bold',
      fontSize: 16,
    }
  })
}