import React, { useState } from 'react';
import { View, TextInput, Modal, Text, TouchableOpacity } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const CitySelectionModal = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View>
      <TextInput
        placeholder="Selectează orașul"
        onFocus={() => setModalVisible(true)}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text>Închide</Text>
          </TouchableOpacity>

          {/* Aici vei adăuga componenta GooglePlacesAutocomplete pentru a afișa lista de orașe */}
          <GooglePlacesAutocomplete
            placeholder="Caută orașul"
            onPress={(data, details = null) => {
              // Aici poți gestiona selecția unui oraș din listă
              console.log(data, details);
              setModalVisible(false);
            }}
            query={{
              key: 'API_KEY', // înlocuiește cu cheia ta de API Google Places
              language: 'ro', // setează limba dorită
              components: 'country:RO', // filtrează după țară (în acest caz, România)
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default CitySelectionModal;
