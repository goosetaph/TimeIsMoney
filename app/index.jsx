import { Text, View, TouchableOpacity, StyleSheet, Appearance, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { FontAwesome6 } from '@expo/vector-icons';
import { useCurrency } from "@/context/CurrencyContext";


export default function TimerScreen() {
  const {timeBalance, addTransaction} = useCurrency();

  const [beginTime, setBeginTime] = useState(null);
  const [now, setNow] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lapsedTime, setLapsedTime] = useState(0);
  const [isProductive, setIsProductive] = useState(true);

  const [touchStartY, setTouchStartY] = useState(0);


  const backgroundAnim = React.useRef(new Animated.Value(0)).current;

  const colorScheme = Appearance.getColorScheme()
  const styles = createStyles(colorScheme);

  //Timer interval
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

  //Background Animation when isRunning
  useEffect(() => {
    let stopLoop = false;
    if (isRunning) {
      Animated.timing(backgroundAnim, {
            toValue: isProductive ? 0.25 : 0.75,
            duration: 1500,
            useNativeDriver: false,
          }).start(({ finished }) => {
            const startBreathing = () => {
              if (stopLoop) return;

              Animated.sequence([
                Animated.timing(backgroundAnim, {
            toValue: isProductive ? 0.5 : 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(backgroundAnim, {
            toValue: isProductive ? 0.25 : 0.75,
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
        toValue: isProductive? 0 : 1.2,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }

    return() => {
      stopLoop = true;
    };
  }, [isRunning]);

  useEffect(() => {
    if (isProductive) {
      Animated.timing(backgroundAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(backgroundAnim, {
        toValue: 1.2,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [isProductive])

  //TODO: same functions as sessionEarnings
  const time = isRunning ? (now - beginTime + lapsedTime) : lapsedTime;

  const onTouchStart = (e) => {
    setTouchStartY(e.nativeEvent.pageY);
  }

  const onTouchEnd = (e) => {
    const touchEndY = e.nativeEvent.pageY;
    const distance = touchStartY - touchEndY;

    if (isRunning) return;

    if (distance > 50) {
      setIsProductive(false);
    } else if (distance < -50){
      setIsProductive(true);
    }
  }

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
      if (isProductive){
        addTransaction(sessionEarnings, 'INCOME', 'Productivity Session')
      } else {
        addTransaction(sessionEarnings, 'EXPENSE', 'Wasted Time')
      }

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

  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1, 1.2],
    outputRange: ['#fff', 'lightcyan', 'lightblue', 'lightpink', 'pink', '#ffcccc']
  });

  return (
    <Animated.View style={[{flex: 1}, { backgroundColor }]}
    onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      <SafeAreaView style={styles.mainView}>
        <View style={styles.subHeader}>
          <View style={styles.walletContainer}>
            <FontAwesome6 name="coins" size={18} color="gold" />
            <Text style={styles.balanceText}>
              {formatTime(timeBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>

        <View style={[styles.timeCircle, {borderColor: isProductive ? '#eee' : '#ffcccc'}]}/>
        <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 80, justifyContent: 'center', alignItems: 'center'}}>
          {/*TODO: find alternative of absolute position above */}
          <Text style={styles.timeText}>
            {formatTime(time)}
          </Text>
          <Text style={{color: isProductive ? '#666' : '#d32f2f'}}>
            {isProductive ? "Earning Time" : "Wasting Time"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 20 }}>
          {isRunning ? (
            <TouchableOpacity style={styles.stopButton} onPress={stopTime}>
              <FontAwesome6 name="pause" size={24} color="maroon" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.startButton} onPress={startTime}>
              <FontAwesome6 name="play" size={24} color="blue" />
            </TouchableOpacity>
          )
          }
          {time > 0 && (
            <TouchableOpacity style={styles.resetButton} onPress={resetTime}>
              <FontAwesome6 name="rotate-left" size={24} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.guideContainer}>
          {isProductive ? (
            <View style={{alignItems: 'center'}}>
              <Text style={styles.guideText}>Swipe UP for Worthless Mode</Text>
              <FontAwesome6 name='chevron-up' size={20} color='#ccc'/>
            </View>
            ) : (
            <View style={{alignItems: 'center'}}>
              <FontAwesome6 name='chevron-down' size={20} color='#ccc'/>
              <Text style={styles.guideText}>Swipe DOWN for Productive Mode</Text>
            </View>
            )
          }
        </View>

        <View style={{position: 'relative', top: 70}}>
          <Text style={{color: '#aaa', fontSize: 12}}>
            {isRunning ? "Pause to switch mode" : ""}
          </Text>
        </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const buttonBase = {
  width: 80,
  height: 80,
  borderRadius: 40,
  top: 30,
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

    },
    subHeader: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: 20,
    },
    body: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    timeCircle: {
      width: 250,
      height: 250,
      borderRadius: 125,
      borderWidth: 5,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      elevation: 5,
      shadowColor: 'black',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 3.5,
    },
    timeText: {
      fontSize: 50,
      fontWeight: 'bold',
      marginBottom: 50,
      fontVariant: ['tabular-nums'],
    },
    guideContainer: {
      position: 'relative',
      top: 50,
      width: '100%',
      alignItems: 'center',
    },
    guideText: {
      color: '#999',
      marginBottom: 5,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
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