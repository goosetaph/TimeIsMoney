import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { useCurrency } from "@/context/CurrencyContext";

export default function ShopScreen() {
    const { timeBalance, addTransaction } = useCurrency();
    //TODO: Adjust the shop items
    const shopItems = [
      { id: '1', name: '10 min YouTube', cost: 10 * 60 * 1000, icon: 'youtube', color: '#FF0000' },
      { id: '2', name: '20 min Social Media', cost: 20 * 60 * 1000, icon: 'hashtag', color: '#E1306C' },
      { id: '3', name: '30 min Gaming', cost: 30 * 60 * 1000, icon: 'gamepad', color: '#6441a5' },
      { id: '4', name: '2 hour Movie', cost: 120 * 60 * 1000, icon: 'film', color: '#000000' },
      { id: '5', name: 'Fancy Food', cost: 30 * 60 * 1000, icon: 'utensils', color: '#FFA500' },
    ];
    const handlePurchase = (item) => {
        if (timeBalance < item.cost) {
            if (Platform.OS === 'web') {
                window.alert("Not enough time. Go work!");
            } else {
                Alert.alert("Locked", "Not enough time. Go work!")
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
                    {text: 'Cancel', style: 'cancel'},
                    {text: 'Redeem',
                        onPress: () => addTransaction(item.cost, 'EXPENSE', `Redeemed: ${item.name}`)
                    }
                ]
            )
        }
    }

    const formatCost = (ms) => {
        const mins = Math.floor(ms / 60000);
        return mins >= 60 ? `${mins / 60} hours` :  `${mins} minutes`;
    }

    const renderItem = ({ item }) => {
      const canAfford = timeBalance >= item.cost;

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
          <TouchableOpacity 
            style={[styles.buyButton, {backgroundColor: canAfford ? 'green' : 'gray'}]}
            onPress={() => handlePurchase(item)}
            disabled={!canAfford}
          >
            <Text style={styles.buyButtonText}>{canAfford ? 'Redeem' : 'Locked'}</Text>
          </TouchableOpacity>    
        </View>
      );
    }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <View style={styles.balanceContainer}>
          <FontAwesome6 name="coins" size={14} color="gold" />
          <Text style={styles.balanceText}>
             {timeBalance >= 36000000 
             ? `${(timeBalance/3600000).toFixed(1)}h`
             : `${Math.floor(timeBalance / 60000)}m`} available
          </Text>
        </View>
      </View>

      <FlatList
        data={shopItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
      />
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
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
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
    shadowOffset: {width: 0, height: 2},
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
  buyButton: {
    // backgroundColor: 'green',
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

