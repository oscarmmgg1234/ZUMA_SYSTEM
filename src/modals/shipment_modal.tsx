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
} from 'react-native';
import MODAL_BASE from '../modal_component';
import {http_req} from '../http/req';

const http = http_req();

type shipmentObject = {
  company: string;
  product: string;
  employee: string;
  quantity: number;
};

export default function SHIPMENT_MODAL(props: any) {
  const pressAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const [keyboardOffset, setKeyboardOffset] = React.useState(0);
  const [products, set_products] = React.useState<any[]>([]);
  const [companies, set_companies] = React.useState<any[]>([]);
  const [employees, set_employees] = React.useState<any[]>([]);

  const [selected_product, set_selected_product] = React.useState<{}>({});
  const [selected_company, set_selected_company] = React.useState<{}>({});
  const [selected_employee, set_selected_employee] = React.useState<{}>({});

  const submit_shipments = () => {
    
  }

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

  React.useEffect(() => {
    http.getCompanyInfo((data: any) => {
      const newRes = data.data.map((item: any) => {
        return {...item, focus: false};
      });
      set_companies(newRes);
    });
    http.getEmployees((data: any) => {
      const newRes = data.employees.map((item: any) => {
        return {...item, focus: false};
      });
      set_employees(newRes);
    });
  }, []);

  React.useEffect(() => {
    http.getProductsByCompany(selected_company, (data: any) => {
      
      const newRes = data.data.map((item: any) => {
        if(item.SHIPMENT_TYPE == null) return {...item, focus: false};
      });
      set_products(newRes);
    });
  }, [selected_company]);

  const onFocus_Company = (item: any) => {
    const newRes = companies.map(obj => {
      if (obj.COMPANY_ID == item.COMPANY_ID) {
        if (item.focus === true) {
          return {...obj, focus: false};
        } else {
          set_selected_company(item);
          return {...obj, focus: true};
        }
      } else {
        return {...obj, focus: false};
      }
    });
    set_companies(newRes);
  };
  const onFocus_Product = (item: any) => {
    const newRes = products.map(obj => {
      if (obj.NAME == item.NAME) {
        if (item.focus === true) {
          return {...obj, focus: false};
        } else {
          set_selected_product(item);
          return {...obj, focus: true};
        }
      } else {
        return {...obj, focus: false};
      }
    });
    set_products(newRes);
  };
  const onFocus_Employee = (item: any) => {
    const newRes = employees.map(obj => {
      if (obj.NAME == item.NAME) {
        if (item.focus === true) {
          return {...obj, focus: false};
        } else {
          set_selected_employee(item);
          return {...obj, focus: true};
        }
      } else {
        return {...obj, focus: false};
      }
    });
    set_employees(newRes);
  };

  const company_entry = (item: any) => {
    return (
      <TouchableOpacity
        onPress={() => onFocus_Company(item)}
        style={{
          width: '100%',
          height: 50,
          backgroundColor: '#89BE63',
          marginVertical: 5,
          alignSelf: 'center',
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 4,
          borderColor: item.focus ? 'coral' : '#89BE63',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}>
        <Text style={{color: '#ECF9F2'}}>{item.NAME}</Text>
      </TouchableOpacity>
    );
  };

  const product_entry = (items: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          onFocus_Product(items);
        }}
        style={{
          width: 300,
          height: 70,
          backgroundColor: '#89BE63',
          marginVertical: 5,
          alignSelf: 'center',
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'space-around',
          flexDirection: 'row',
          borderWidth: 4,
          borderColor: items.focus ? 'coral' : '#89BE63',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}>
        <Text style={{fontSize: 17, color: '#ECF9F2'}}>{items.NAME}</Text>
        <View
          style={{
            backgroundColor: '#05F26C',
            width: 80,
            height: 30,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 50,
          }}>
          <Text>{items.PRODUCT_ID}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const employee_entry = (items: any) => {
    return (
      <TouchableOpacity
        onPress={() => onFocus_Employee(items)}
        style={{
          width: 300,
          height: 50,
          backgroundColor: '#89BE63',
          marginVertical: 5,
          alignSelf: 'center',
          borderRadius: 50,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: items.focus ? 'coral' : '#89BE63',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}>
        <Text style={{color: '#ECF9F2'}}>{items.NAME}</Text>
      </TouchableOpacity>
    );
  };

  const reset_all = () => {
    const newRes = employees.map((item: any) => {
      return {...item, focus: false};
    });
    set_employees(newRes);
    set_products([]);
    const newRes3 = companies.map((item: any) => {
      return {...item, focus: false};
    });
    set_companies(newRes3);
  };

  return (
    <MODAL_BASE
      visible={props.visible}
      set_visible={props.set_visible}
      title={props.title}
      keyboardOffset={keyboardOffset}
      reset={reset_all}>
      <View style={styles.main_view_base}>
        {/* company + product */}
        <View style={styles.first_content_view}>
          {/* company */}
          <View style={styles.company_flatlist_view}>
            <View
              style={{
                width: '100%',
                height: '10%',
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '5%',
              }}>
              <Text style={{fontSize: 13, color: 'black'}}>Companies</Text>
              <Text
                style={{
                  width: '100%',
                  alignSelf: 'center',
                  marginTop: '5%',
                  height: 3,
                  backgroundColor: '#AFCCA9',
                }}></Text>
            </View>
            <View
              style={{
                height: '80%',
                width: '100%',
                alignItems: 'center',
                paddingTop: 10,
              }}>
              <FlatList
                data={companies}
                renderItem={({item}) => company_entry(item)}
                keyExtractor={(item: any) => item.COMPANY_ID}
              />
            </View>
          </View>
          {/* product */}
          <View style={styles.product_flatlist_view}>
            <View
              style={{
                width: '100%',
                height: '10%',
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '5%',
              }}>
              <Text style={{fontSize: 16, color: 'black'}}>Product</Text>
              <Text
                style={{
                  width: '100%',
                  alignSelf: 'center',
                  marginTop: '5%',
                  height: 3,
                  backgroundColor: '#AFCCA9',
                }}></Text>
            </View>
            <View
              style={{
                height: '80%',
                width: '100%',
                alignItems: 'center',
                paddingTop: 10,
              }}>
              <FlatList
                data={products}
                renderItem={({item}) => product_entry(item)}
                keyExtractor={item => item.PRODUCT_ID}
              />
            </View>
          </View>
        </View>
        {/* employee */}
        <View style={styles.second_content_view}>
          <View style={styles.employee_flatlist_view}>
            <View
              style={{
                width: '100%',
                height: '10%',
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '5%',
              }}>
              <Text style={{fontSize: 16, color: 'black'}}>Employee</Text>
              <Text
                style={{
                  width: '100%',
                  alignSelf: 'center',
                  marginTop: '5%',
                  height: 3,
                  backgroundColor: '#AFCCA9',
                }}></Text>
            </View>
            <View
              style={{
                height: '80%',
                width: '100%',
                alignItems: 'center',
                paddingVertical: 10,
              }}>
              <FlatList
                data={employees}
                renderItem={({item}) => employee_entry(item)}
                keyExtractor={item => item.EMPLOYEE_ID}
              />
            </View>
          </View>
          <View
            style={{
              width: '30%',
              height: '50%',
              backgroundColor: '#CFEDEE',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              borderWidth: 3,
              borderColor: '#AFCCA9',
            }}>
            <Text style={{fontSize: 16, marginBottom: 10}}>Quantity</Text>
            <TextInput
              placeholderTextColor="white"
              placeholder="Enter Quantity"
              style={{
                width: 110,
                height: 30,
                backgroundColor: 'rgba(0,0,0,0.3)',
                borderRadius: 20,
                color: 'white',
                paddingHorizontal: 10,
              }}
            />
          </View>
        </View>
        {/* submit shipment */}
        <Animated.View
          style={[
            styles.submit_button_view,
            {
              transform: [{scale: pressAnim}],
              elevation: pressAnim.interpolate({
                inputRange: [0.9, 1],
                outputRange: [2, 5],
              }),
            },
          ]}>
          <TouchableOpacity
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            style={{
              width: 300,
              height: 70,
              backgroundColor: 'coral',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 10,
              borderRadius: 20,
              borderColor: 'orange',
              borderWidth: 1,
            }}>
            <Text
              style={{
                color: 'rgba(0,0,0,0.5)',
                fontSize: 20,
                fontWeight: 'bold',
              }}>
              Submit Shipment
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </MODAL_BASE>
  );
}

const styles = StyleSheet.create({
  main_view_base: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    zIndex: 2,
  },
  first_content_view: {
    width: '100%',
    height: '50%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  second_content_view: {
    width: '100%',
    height: '30%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
  },
  submit_button_view: {
    width: '100%',
    height: '20%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  company_flatlist_view: {
    width: '30%',
    height: '50%',
    backgroundColor: '#CFEDEE',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  product_flatlist_view: {
    width: '50%',
    height: '90%',
    backgroundColor: '#CFEDEE',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  employee_flatlist_view: {
    width: '50%',
    height: '90%',
    backgroundColor: '#CFEDEE',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
