import React, {createContext, useState, useContext, Children} from "react";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [timeBalance, setTimeBalance] = useState(0);
    const [history, setHistory] = useState([]);

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