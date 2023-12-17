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

const http = http_req();

export default function Main_Shipment(props: any) {
  const [error, setError] = React.useState(false);
  const errorData = React.useRef<any>({});

  function setErrorData(data: any) {
    errorData.current = data;
  }

  React.useEffect(() => {
    if (props.refresh == true) init();
  }, [props.refresh]);

  React.useEffect(() => {
    if (error) {
      ErrorAlert(errorData.current.process_des);
      setError(false);
    }
  }, [error]);

  const [shipment_list, set_shipment_list] = React.useState<any[]>([]);

  const [products, set_products] = React.useState<any[]>([]);
  const [companies, set_companies] = React.useState<any[]>([]);
  const [employees, set_employees] = React.useState<any[]>([]);

  const [selected_product, set_selected_product] = React.useState<any>({});
  const [selected_company, set_selected_company] = React.useState<any>({});
  const [selected_employee, set_selected_employee] = React.useState<any>({});
  const [quantity, set_quantity] = React.useState<string>('0');
  //controls the state of the modal
  const [modal_state, set_modal_state] = React.useState(true); // list of shipments or add shipment modal

  //offset for any keyboard activity
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);

  const submitShimpent = () => {
    const http_data = shipment_list.map((item: any) => {
      return {
        COMPANY_ID: item.company.COMPANY_ID,
        PRODUCT_ID: item.product.PRODUCT_ID,
        EMPLOYEE_ID: item.employee.EMPLOYEE_ID,
        QUANTITY: item.quantity,
        SHIPMENT_TYPE: item.product.SHIPMENT_TYPE,
        TYPE: item.product.TYPE,
      };
    });
    http.submit_shipment(http_data, (data: any) => {
      if (data.error) {
        setError(true);
        setErrorData(data);
        return;
      } else {
        set_shipment_list([]);
        Alert.alert('Success', 'Shipments have been submitted');
      }
    });
  };

  //use this to clear the views
  React.useEffect(() => {
    if (modal_state) {
      reset_all_shipments();
    }
  }, [modal_state]);

  const reset_add_shipment = () => {
    set_products([]);
    set_selected_product({});
    set_selected_employee({});
    set_selected_company({});
  };

  const reset_all_shipments = () => {
    reset_add_shipment();
    //set_shipment_list([]);
    set_modal_state(true);
  };

  const reomve_shipment_object = (index: number) => {
    const newList = [...shipment_list];
    newList.splice(index, 1);
    set_shipment_list(newList);
  };

  const add_shipment_object = (shipment_object: any) => {
    const parsedObject = {
      company: shipment_object.company,
      product: shipment_object.product,
      employee: shipment_object.employee,
      quantity: shipment_object.quantity,
    };
    set_shipment_list([...shipment_list, parsedObject]);
  };

  const submitShipments = () => {
    //send server a list of shipment objects
    set_shipment_list([]);
  };

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

  const init = () => {
    http.getCompanyInfo((data: any) => {
      if (data.error) {
        setError(true);
        setErrorData(data);
        return;
      } else {
        const newRes = data.data.map((item: any) => {
          return {...item, focus: false};
        });
        set_companies(newRes);
      }
    });

    http.getEmployees((data: any) => {
      if (data.error) {
        setError(true);
        setErrorData(data);
        return;
      } else {
        const newRes = data.data.employees.map((item: any) => {
          return {...item, focus: false};
        });
        set_employees(newRes);
      }
    });
  }

  React.useEffect(() => {
    init();
  }, [modal_state]);

  React.useEffect(() => {
    if (selected_company.COMPANY_ID === undefined) {
      return;
    }
    http.getProductsByCompany(selected_company, (data: any) => {
      if (data.error) {
        setError(true);
        setErrorData(data);
        return;
      } else {
        const newRes = data.data.filter(
          (item: any) => item.SHIPMENT_TYPE !== null,
        );
        const format_data = newRes.map((item: any) => {
          return {...item, focus: false};
        });
        set_products(format_data);
      }
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
    <>
      <MODAL_BASE
        visible={props.visible}
        set_visible={props.set_visible}
        title={props.title}
        keyboardOffset={keyboardOffset}
        reset={() => reset_all_shipments()}>
        {modal_state ? (
          <>
            <FlatList
              data={shipment_list}
              renderItem={({item, index}) => (
                <View style={styles.shipmentItem}>
                  <Text>
                    {item.company.NAME} - {item.product.NAME}
                  </Text>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    defaultValue={item.quantity.toString()}
                    onChangeText={newQuantity => {
                      const newList = [...shipment_list];
                      newList[index] = {...item, quantity: Number(newQuantity)};
                      set_shipment_list(newList);
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => reomve_shipment_object(index)}>
                    <Text style={{color: 'red'}}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => set_modal_state(false)}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => submitShimpent()}>
              <Text>Submit Shipments</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
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
                  value={quantity}
                  onChange={e => {
                    set_quantity(e.nativeEvent.text);
                  }}
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
                onPress={() => {
                  set_modal_state(true);
                  //insert shipment object
                  add_shipment_object({
                    company: selected_company,
                    product: selected_product,
                    employee: selected_employee,
                    quantity: Number(quantity),
                  });
                  reset_all();
                }}
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
          </>
        )}
      </MODAL_BASE>
    </>
  );
}

const styles = StyleSheet.create({
  main_view_base: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    zIndex: 1,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: 'coral',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  shipmentItem: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 8,
    borderRadius: 5,
    width: 90,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
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
