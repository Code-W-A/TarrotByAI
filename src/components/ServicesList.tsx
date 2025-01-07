// ServiceList.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ServiceListItem from './ServiceListItem';

const NUM_COLUMNS = 3; // You can change the number of columns as desired

const windowWidth = Dimensions.get('window').width;
const itemWidth = windowWidth / NUM_COLUMNS;


interface Props {
    handleServiceRemoval?:any, 
    servicesList?:any,
    isSelect?:boolean,
    selectedServices?:any, 
    setSelectedServices?:any
  }

const ServiceList: React.FC<Props> = ({ handleServiceRemoval, servicesList, isSelect, selectedServices, setSelectedServices }) => {
  const renderRows = () => {
    const rows = [];
    let rowIndex = 0;
    while (rowIndex < servicesList.length) {
      const rowItems = servicesList.slice(rowIndex, rowIndex + NUM_COLUMNS);
      const row = (
        <View key={rowIndex} style={styles.row}>
          {rowItems.map((item, index) => (
            <React.Fragment key={index}>
              <ServiceListItem
                item={item}
                handleServiceRemoval={() => handleServiceRemoval(item)}
                isSelect={isSelect}
                selectedServices={selectedServices}
                setSelectedServices={(service) => setSelectedServices(service)}
              />
            </React.Fragment>
          ))}
        </View>
      );
      rows.push(row);
      rowIndex += NUM_COLUMNS;
    }
    return rows;
  };

  return <View style={styles.container}>{renderRows()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap', // Add flexWrap to wrap the items to the next line
  },
});

export default ServiceList;
