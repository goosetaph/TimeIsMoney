import { View, FlatList, StyleSheet, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { useCurrency } from "@/context/CurrencyContext";
import { useState } from "react";


export default function HistoryScreen() {
  const {history, editHistory} = useCurrency();
  const {timeBalance} = useCurrency();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [newNote, setNewNote] = useState('');

  const openEditModal = (item) => {
    setSelectedLog(item);
    setNewNote(item.note);
    setModalVisible(true);
  }

  const saveEdit = () => {
    if (selectedLog && newNote.trim()) {
      editHistory(selectedLog.id, newNote);
      setModalVisible(false);
    }
  }

  const formatTime = (ms) => {
    if (!ms) return "00:00:00:000";
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }

  const renderItem = ({ item }) => {
    const isIncome = item.type === 'INCOME';

    return (
    <View style={styles.logCard}>
      <View style={styles.leftSection}>
        <View style={[styles.iconCircle, {backgroundColor: isIncome ? '#e8f8e8': '#ffeeee'}]}>
          <FontAwesome6 
            name= {isIncome ? 'arrow-up' : 'cart-shopping'}  
            size={16} 
            color={isIncome ? 'green' : 'red' }
          />
        </View>
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Text style={styles.noteText}>{item.note}</Text>
            <TouchableOpacity onPress={() => openEditModal(item)}>
              <FontAwesome6 name="pencil" size={12} color='#999'/>
            </TouchableOpacity>
          </View>
          <Text style={styles.dateText}>
            {getRelativeTime(new Date(item.timestamp))}
          </Text>
        </View>
      </View>
      <Text style={[styles.amountText, {color: isIncome ? 'green': 'red'}]}>
        {isIncome? '+':'-'}{formatTime(item.amount)}
      </Text>
    </View>
    )
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60 ) return 'Just now';

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60 ) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24 ) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInHours === 1 ) return 'Yesterday';

    return new Date(date).toLocaleString('en-UK', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Time Logs</Text>
        <SafeAreaView style={styles.balanceContainer}>
          <FontAwesome6 name="coins" size={18} color="gold" />
          <Text style={styles.balanceText}>
            {formatTime(timeBalance)}
          </Text>
        </SafeAreaView>
      </View>
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome6 name="clock" size={50} color= '#ddd'/>
          <Text style={styles.emptyText}>No logs just yet. Go be productive!</Text>
        </View>
      ) : (
        <FlatList 
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}/>
      )}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Note</Text>
            <TextInput style={styles.input} value={newNote} onChangeText={setNewNote}/>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  balanceContainer: {
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
  },
  listPadding: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  logCard: {
    backgroundColor: '#fefefe',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1
  },
  item: {
    backgroundColor: 'lightgray',
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteText:{
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
    color: '#888'
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyText:{
    color: '#aaa',
    fontSize: 16,
  },
  modalOverlay: { 
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  modalContent: { 
    backgroundColor: 'white', 
    width: '90%', 
    borderRadius: 20, 
    padding: 20, 
    elevation: 5
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center', 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 10, 
    fontSize: 16, 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20, 
  },
  cancelButton: { 
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'lightgray',
    borderRadius: 10
  },
  cancelText: { 
    color: 'red', 
    fontSize: 16 
  },
  saveButton: { 
    backgroundColor: 'forestgreen', 
    paddingVertical: 10, 
    paddingHorizontal: 30, 
    borderRadius: 10 
  },
  saveText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16, 
  },
})

