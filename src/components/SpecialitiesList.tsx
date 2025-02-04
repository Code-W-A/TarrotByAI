import React, {Fragment, useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {RowView} from './commonViews';
import {
  mv10,
  ph15,
  mt10,
  mr10,
  alignItemsCenter,
  pl15,
} from '../common/commonStyles';
import {
  H7fontMediumBlack,
  H9fontRegularBlack,
  H9fontMediumBlack,
  H30fontRegularLightBlack2,
} from './commonText';
import {labels} from '../utils/labels';
import {menu} from '../utils/constant';
import i18n from '../../i18n';

interface SpecialitiesList {
  onPressViewAll?: CallableFunction;
  title?: any;
}
const SpecialitiesList: React.FC<SpecialitiesList> = ({
  onPressViewAll,
  title,
}) => {
  return (
    <View style={[mv10]}>
      <RowView style={!title && ph15}>
        {title ? (
          <H30fontRegularLightBlack2>{title}</H30fontRegularLightBlack2>
        ) : (
          <H7fontMediumBlack>{i18n.translate("specialities")}</H7fontMediumBlack>
        )}
        <TouchableOpacity
          onPress={() => {
            onPressViewAll();
          }}>
          {!title && <H9fontMediumBlack>{i18n.translate("viewAll")}</H9fontMediumBlack>}
        </TouchableOpacity>
      </RowView>

      <ScrollView
        horizontal={true}
        style={[mr10, mt10]}
        showsHorizontalScrollIndicator={false}>
        {menu.map(({name, Img}) => {
          return (
            <TouchableOpacity>
              <View style={[alignItemsCenter, pl15]}>
                <Img height={67} width={67} />
                <View style={mv10}>
                  <H9fontRegularBlack>{name}</H9fontRegularBlack>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default SpecialitiesList;
