import React, {createContext, useState, useContext, Children, useEffect} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [timeBalance, setTimeBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const savedBalance = await AsyncStorage.getItem('timeBalance')
                const savedHistory = await AsyncStorage.getItem('history')

                if (savedBalance !== null) setTimeBalance(JSON.parse(savedBalance));
                if (savedHistory !== null) setHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error("Failed to load data", error)
            } finally {
                setIsLoaded(true);
            }
        }
        loadData();
    }, []);

    useEffect (() => {
        if (isLoaded) {
            const saveData = async () => {
                try {
                    await AsyncStorage.setItem('timeBalance', JSON.stringify(timeBalance));
                    await AsyncStorage.setItem('history', JSON.stringify(history));
                } catch (error) {
                    console.error("Failed to save data", error);
                }
            }
            saveData();
        }
    }, [timeBalance, history, isLoaded]);

    const addTransaction = (amount, type, note) => {
        
        const newLog = {
            id: Date.now().toString(),
            type,
            amount,
            note,
            timestamp: new Date(),
        };
        
        if (type === 'INCOME') setTimeBalance(prev => prev + amount);
        if (type === 'EXPENSE') setTimeBalance(prev => prev - amount);
        setHistory(prev => [newLog, ...prev]);
    };

    return (
        <CurrencyContext.Provider value={{ timeBalance, history, addTransaction}}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    //useContext(CurrencyContext);
    const context = useContext(CurrencyContext);
    if (!context){
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}