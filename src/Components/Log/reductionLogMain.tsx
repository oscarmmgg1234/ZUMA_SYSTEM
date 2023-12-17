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
import {http_req} from '../../http/req';
import ReductionLog from './reductionLog';

const http = http_req();

export default function ReductionDisplay(props: any) {
  const [log, set_log] = React.useState<any>([]);

  React.useEffect(() => {
    if (props.refresh == true) {
      http.getReductionLog(data => {
        set_log(data);
      });
    }
  }, [props.refresh]);
  
  return (
    <>
      <ReductionLog log={log} />
    </>
  );
}
