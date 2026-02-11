import React, {useState, useEffect} from "react";
import { Modal,View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome6 } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        title: "Welcome to Time is Money",
        description: "Time is your currency, Use the timer to track you productivity and unproductivity ;) \n\n👆 Swipe UP on the timer to switch to Unproductive Mode (Spending).\n👇 Swipe DOWN to switch to Productive Mode (Earning).",
        icon: "stopwatch",
        color: "green",
    },
    {
        title: "The History Logs",
        description: "Every second you submit into the Bank is recorded in the History section. \n\nGreen entries shows your earnings.\nRed entries shows your expenses.\n\n⚠️ Watch out for Penalties! Too much debt will trigger interest.",
        icon: "chart-line",
        color: "red",
    },
    {
        title: "The Shop (and Loans)",
        description: "Spend your hard-earned time on rewards in the Shop.\n\nCan't afford it? You can take a LOAN, but it comes with a 10% interest rate.\n\n🔒 If you go into too much debt, the Shop will lock!",
        icon: "shop",
        color: "blue",
    },
];

export default function OnboardingModal() {
    const [visible, setVisible] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        checkFirstLaunch()
    }, []);

    const checkFirstLaunch = async () => {
        try {
            const hasSeen = await AsyncStorage.getItem('@has_seen_onboarding');
            if (hasSeen !== 'true') {
                setVisible(true);
            }
        } catch (e) {
            console.error("Failed to check onboarding status", e)
        }
    };

    const handleNext = async () => {
        if (currentSlide < SLIDES.length -1) {
            setCurrentSlide(currentSlide + 1)
        } else {
            try {
                await AsyncStorage.setItem('@has_seen_onboarding', 'true')
                setVisible(false)
            } catch (e) {
                console.error("Failed to save onboarding status", e)
            }
        }
    }

    const content = SLIDES[currentSlide];

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>

                    <View style={[styles.iconContainer, {backgroundColor: content.color}]}>
                        <FontAwesome6 name = {content.icon} size = {40} color="white"/>
                    </View>

                    <Text style={styles.title}>{content.title}</Text>
                    <Text style={styles.description}>{content.description}</Text>

                    <View style={styles.dotsContainer}>
                        {SLIDES.map((_, index) => (
                            <View
                            key={index}
                            style={[styles.dot, index === currentSlide ? { backgroundColor: content.color, width: 24} : {backgroundColor: '#ddd'}]}/>
                        ))}
                    </View>

                    <TouchableOpacity style={[styles.button, { backgroundColor: content.color }]} onPress={handleNext}>
                        <Text style={styles.buttonText}>
                            {currentSlide === SLIDES.length - 1 ? "Get Started" : "Next"}
                        </Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    height: 10, 
    alignItems: 'center'
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  }
})