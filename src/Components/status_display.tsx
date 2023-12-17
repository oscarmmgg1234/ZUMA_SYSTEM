import React from 'react';
import {Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StatusDisplay = React.memo((props: any) => {
  return (
    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      <Text
        style={{
          color: props.online ? 'green' : 'red',
          paddingRight: 10,
        }}>
        {props.online ? 'Online' : 'System Down'}
      </Text>
      <Ionicons
        name="globe-outline"
        size={30}
        color={props.online ? 'green' : 'red'}
      />
    </View>
  );
});

export default StatusDisplay;
