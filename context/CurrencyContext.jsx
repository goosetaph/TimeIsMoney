import React, {createContext, useState, useContext, Children, useEffect} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'

const CurrencyContext = createContext();

const DEFAULT_ITEMS = [
    { id: '1', name: '10 min YouTube', cost: 10 * 60 * 1000, icon: 'youtube', color: '#FF0000', isPinned: false },
    { id: '2', name: '20 min Social Media', cost: 20 * 60 * 1000, icon: 'hashtag', color: '#E1306C', isPinned: false },
    { id: '3', name: '30 min Gaming', cost: 30 * 60 * 1000, icon: 'gamepad', color: '#6441a5', isPinned: false },
    { id: '4', name: '2 hour Movie', cost: 120 * 60 * 1000, icon: 'film', color: '#000000', isPinned: false },
]

export const CurrencyProvider = ({ children }) => {
    const [timeBalance, setTimeBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [shopItems, setShopItems] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const savedBalance = await AsyncStorage.getItem('timeBalance')
                const savedHistory = await AsyncStorage.getItem('history')
                const savedShop = await AsyncStorage.getItem('shopItems')

                if (savedBalance !== null) setTimeBalance(JSON.parse(savedBalance));
                if (savedHistory !== null) setHistory(JSON.parse(savedHistory));

                if (savedShop !== null ) {
                    setShopItems(JSON.parse(savedShop));
                } else {
                    setShopItems(DEFAULT_ITEMS);
                }
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
                    await AsyncStorage.setItem('shopItems', JSON.stringify(shopItems));
                } catch (error) {
                    console.error("Failed to save data", error);
                }
            }
            saveData();
        }
    }, [timeBalance, history, shopItems, isLoaded]);

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

    const editHistory = (id, newNote) => {
        setHistory(prev => prev.map(item => item.id === id ? {...item, note: newNote} : item))
    }

    const addShopItem = (item) => {
        setShopItems(prev => [...prev, { ...item, id: Date.now().toString(), isPinned: false}])
    }
    const editShopItem = (id, updatedItem) => {
        setShopItems(prev => prev.map(item => item.id === id ? {...item, ...updatedItem} : item ))
    }
    const deleteShopItem = (id) => {
        setShopItems(prev => prev.filter(item => item.id !== id))
    }
    const togglePinItem = (id) => {
        setShopItems(prev => prev.map(item => item.id === id ? { ...item, isPinned : !item.isPinned }: item ))
    }
    const moveItem = (id, direction) => {
        setShopItems(prev => {
            const newItems = [...prev];
            const index = newItems.findIndex(item => item.id === id)

            if (direction === -1 && index > 0) {
                [newItems[index], newItems[index-1]] = [newItems[index-1], newItems[index]] 
            } else if (direction === 1 && index < newItems.length -1) {
                [newItems[index], newItems[index+1]] = [newItems[index+1], newItems[index]]
            }
            return newItems;
        })
    }

    return (
        <CurrencyContext.Provider value={{ timeBalance, history, editHistory, addTransaction, isLoaded, shopItems, addShopItem, editShopItem, deleteShopItem, togglePinItem, moveItem}}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context){
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}