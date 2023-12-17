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
import MODAL_BASE from '../modal_component';
import {http_req} from '../http/req';
import ErrorAlert from '../alerts/Error_Alert';
import ShipmentLog from '../Components/Log/shipmentLogMain';
import ActivationDisplay from '../Components/Log/activationLogMain';
import ReductionDisplay from '../Components/Log/reductionLogMain';

const http = http_req();

export default function Log(props: any) {
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);
  React.useEffect(() => {
    const keyboardWillShow = (event: KeyboardEvent) => {
      setKeyboardOffset(event.endCoordinates.height);
    };


    const keyboardWillHide = () => {
      setKeyboardOffset(0);
    };

    const show = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    const hide = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  const reset_all = () => {};

  return (
    <>
      <MODAL_BASE
        visible={props.visible}
        set_visible={props.set_visible}
        title={props.title}
        keyboardOffset={keyboardOffset}
        reset={reset_all}>
        <View style={styles.main_view}>
          <Text style={{fontSize: 25, fontWeight: 'bold', marginBottom: 10, paddingLeft: 20}}>
            Shipment History
          </Text>
          <ShipmentLog refresh={props.refresh}/>
          <Text style={{fontSize: 25, fontWeight: 'bold', marginBottom: 10, paddingLeft: 20}}>
            Activation Product History
          </Text>
          <ActivationDisplay refresh={props.refresh}/>
          <Text style={{fontSize: 25, fontWeight: 'bold', marginBottom: 10, paddingLeft: 20}}>
            Product Reduction History
          </Text>
          <ReductionDisplay refresh={props.refresh}/>
          </View>
      </MODAL_BASE>
    </>
  );
}

const styles = StyleSheet.create({
  main_view: {
    width: '100%',
    height: '100%',
  },
});
