import React from 'react';
import {
  TouchableOpacity,
  Keyboard,
  KeyboardEvent,
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Animated,
  Alert,
} from 'react-native';

const ActivationLog = React.memo((props: any) => {
  // Define how each item in the list should be rendered
  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.PRODUCT_NAME}</Text>
      <Text style={styles.cell}>{item.EMPLOYEE_ID}</Text>
      <Text style={styles.cell}>{item.QUANTITY}</Text>
      <Text style={styles.cell}>{new Date(item.DATE).toLocaleString()}</Text>
    </View>
  );

  // Render the FlatList with column titles and data rows
  return (
    <FlatList
      data={props.log.data}
      renderItem={renderItem}
      keyExtractor={item => item.CONSUMP_ID}
      ListHeaderComponent={() => (
        <View style={styles.header}>
          <Text style={styles.headerCell}>Product Name</Text>
          <Text style={styles.headerCell}>Employee ID</Text>
          <Text style={styles.headerCell}>Quantity</Text>
          <Text style={styles.headerCell}>Shipment Date</Text>
        </View>
      )}
    />
  );
});

// Define the styles for the FlatList and its items
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#ddd',
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ActivationLog;
