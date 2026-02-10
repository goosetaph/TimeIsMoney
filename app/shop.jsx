import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { MAX_DEBT_LIMIT, LOAN_INTEREST_RATE, useCurrency } from "@/context/CurrencyContext";
import { useState } from "react";


export default function ShopScreen() {
  const { timeBalance, addTransaction, shopItems, addShopItem, editShopItem, deleteShopItem, togglePinItem, moveItem } = useCurrency();
  const [isEditMode, setIsEditMode] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [icon, setIcon] = useState('gift');
  const [color, setColor] = useState('green');

  const AVAILABLE_ICONS = ['gamepad', 'youtube', 'hashtag', 'film', 'utensils', 'book', 'music', 'plane', 'gift', 'laptop',];
  const AVAILABLE_COLORS = ['#FF0000', '#E1306C', '#6441a5', '#FFA500', '#4CAF50', '#2196F3', '#FFD700', '#000000'];


  const handlePurchase = (item) => {

    if (timeBalance <= -MAX_DEBT_LIMIT) {
      Alert.alert(
        "BANKRUPTCY DECLARED",
        "You have reached the 6 hours debt limit. You have lost having fun priviledge!"
      );
      return;
    }

    const canAfford = timeBalance >= item.cost;

    if (!canAfford) {

      const loanAmount = Math.floor(item.cost * (1 + LOAN_INTEREST_RATE))
      const interestAmount = loanAmount - item.cost;

      const costMins = Math.floor(item.cost / 60000);
      const interestMins = Math.floor(interestAmount / 60000);
      const totalMins = Math.floor(loanAmount / 60000);

      if (Platform.OS === 'web') {
        const confirmed = window.confirm(
          `Insufficient Time.\n\nWould you like to take a LOAN for this item? \n\nItem Cost: ${costMins}m\nInterest (10%): +${interestMins}m\n\nTotal Loan: ${totalMins}m`,
        );

        if (confirmed) {
          addTransaction(loanAmount, 'EXPENSE', `Loan: ${item.name} (+10%)`);
        }
      } else {
        Alert.alert(
          "Insufficient Time",
          `Would you like to take a LOAN for this item? \n\nItem Cost: ${costMins}m\nInterest (10%): +${interestMins}m\n\nTotal Loan: ${totalMins}m`,
          [
            { text: "Cancel", style: "cancel"},
            {
              text: "Take Loan",
              style: "destructive",
              onPress: () => {
                addTransaction(loanAmount, 'EXPENSE', `Loan: ${item.name} (+10%)`);
                Alert.alert("Loan Approved", "Enjoy your DEBT!")
              }
            }
          ]
        )
      }
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to spend time on ${item.name}?`);

      if (confirmed) {
        addTransaction(item.cost, 'EXPENSE', `Redeemed: ${item.name}`);
      }
    } else {
      Alert.alert(
        "Confirm Purchase",
        `Spend ${item.name.split(' ')[0]} of your time on this?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Redeem',
            onPress: () => addTransaction(item.cost, 'EXPENSE', `Redeemed: ${item.name}`)
          }
        ]
      )
    }
  }

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setCost((item.cost / 60000).toString());
      setIcon(item.icon);
      setColor(item.color);
    } else {
      setEditingItem(null);
      setName('');
      setCost('');
      setIcon('gift');
      setColor('green');
    }
    setModalVisible(true);
  }

  const saveItem = () => {
    const finalCost = parseInt(cost) * 60 * 1000;
    if (!name || !finalCost) return;

    if (editingItem) {
      editShopItem(editingItem.id, { name, cost: finalCost, icon, color });
    } else {
      addShopItem({ name, cost: finalCost, icon, color });
    }
    setModalVisible(false);
  }

  const displayItems = [...shopItems].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  })

  const formatCost = (ms) => {
    const mins = Math.floor(ms / 60000);
    return mins >= 60 ? `${mins / 60} hours` : `${mins} minutes`;
  }

  const renderItem = ({ item, index }) => {
    const canAfford = timeBalance >= item.cost;
    const isBankrupt = timeBalance <= -MAX_DEBT_LIMIT;

    return (
      <View style={styles.itemCard}>
        <View style={styles.iconContainer}>
          <FontAwesome6 name={item.icon} size={30} color={canAfford ? item.color : '#ccc'} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.costTag}>
            <FontAwesome6 name='clock' size={12} color='#888' />
            <Text style={styles.costText}>Cost: {formatCost(item.cost)}</Text>
          </View>
        </View>

        {isEditMode ? (
          <View style={styles.editActions}>
            <TouchableOpacity onPress={() => togglePinItem(item.id)}>
              <FontAwesome6 name="thumbtack" size={18} color={item.isPinned ? 'orange': '#ddd'}/>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => moveItem(item.id, -1)}>
              <FontAwesome6 name="arrow-up" size={18} color={'#555'}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => moveItem(item.id, 1)}>
              <FontAwesome6 name="arrow-down" size={18} color={'#555'}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openModal(item)}>
              <FontAwesome6 name="pencil" size={18} color={'blue'}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteShopItem(item.id)}>
              <FontAwesome6 name="trash" size={18} color={'red'}/>
            </TouchableOpacity>
          </View>
        ):(
        <TouchableOpacity
          style={[styles.buyButton, { backgroundColor: canAfford ? 'green' : (isBankrupt ? 'gray' : 'orange') }]}
          onPress={() => handlePurchase(item)}
          // disabled={!canAfford}
        >
          <Text style={styles.buyButtonText}>{canAfford ? 'Redeem' : (isBankrupt ? 'Locked' : 'Loan?')}</Text>
        </TouchableOpacity>)
        }
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
      </View>
      <View style={styles.subHeader}>

        <TouchableOpacity style={styles.editToggle} onPress={() => setIsEditMode(!isEditMode)}>
          <FontAwesome6 name={isEditMode ? "check" : "gear"} size={20} color="white"/>
          <Text style={styles.editToggleText}>{isEditMode ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
        <View style={styles.balanceContainer}>
          <FontAwesome6 name="coins" size={14} color={timeBalance < 0 ? '#ff3f3f' : 'gold'} />
          <Text style={[styles.balanceText, {color: timeBalance < 0 ? '#ff3f3f' : 'gold'}]}>
            {timeBalance >= 36000000
              ? `${(timeBalance / 3600000).toFixed(1)}h`
              : `${Math.floor(timeBalance / 60000)}m`} available
          </Text>
        </View>
      </View>

      <FlatList
        data={displayItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
      />

      {isEditMode && (
        <TouchableOpacity style={styles.fab} onPress={() => openModal(null)}>
          <FontAwesome6 name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Item' : 'New Activities'}
            </Text>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. 15 min Nap" />
            <Text style={styles.label}>Cost (Minutes)</Text>
            <TextInput style={styles.input} value={cost} onChangeText={setCost} keyboardType="numeric" placeholder="e.g. 15" />
            <Text style={styles.label}>Icon</Text>
            <View style={styles.selectionRow}>
              {AVAILABLE_ICONS.map(i => (
                <TouchableOpacity key={i} onPress={() => setIcon(i)} style={[styles.selectBox, icon === i && styles.selectedBox]}>
                  <FontAwesome6 name={i} size={20} color={icon === i ? 'white' : '#333'}/>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Icon</Text>
            <View style={styles.selectionRow}>
              {AVAILABLE_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setColor(c)} style={[styles.colorBox, {backgroundColor: c}, color === c && styles.selectedColorBorder]} />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  balanceContainer: {
    position: 'absolute',
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
  editToggle: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#555',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 8,
  },
  editToggleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  balanceText: {
    color: 'gold',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listPadding: {
    padding: 15,
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: '#fefefe',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1
  },
  iconContainer: {
    width: 60,
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  costTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  costText: {
    fontSize: 12,
    color: '#888'
  },
  editActions: {
    flexDirection: 'row',
    gap: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: 'dodgerblue',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
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
  label: { 
    fontWeight: 'bold', 
    marginTop: 10, 
    marginBottom: 5, 
    color: '#555', 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 10, 
    fontSize: 16, 
  },
  selectionRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginBottom: 10, 
  },
  selectBox: { 
    padding: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ddd', 
  },
  selectedBox: { 
    backgroundColor: '#333', 
    borderColor: '#333', 
  },
  colorBox: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
  },
  selectedColorBorder: { 
    borderWidth: 3, 
    borderColor: '#333', 
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
  buyButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
})

