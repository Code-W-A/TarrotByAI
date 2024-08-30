import React from 'react';
import {View} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import { H6fontRegularBlack, H9fontMediumBlue } from './commonText';

export default function CustomLoader({isLoading, opacity, backgroundColor,backgroundSet, text}) {
  return (
    <>
      {isLoading && (
        <>
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: backgroundColor ? backgroundColor : 'grey',
              opacity: opacity ? opacity : 0.3,
              zIndex: 2,
            }}></View>
            <View  style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4,
              
         
            }}>
              <View style={{backgroundColor:"rgba(239, 239, 240, 0.9)" , borderRadius:25, width:200, height:100, alignItems: 'center',
              justifyContent: 'center',}}>
                {text &&
              <H6fontRegularBlack>
                {text}
              </H6fontRegularBlack>
              }
          <ActivityIndicator
            style={{marginTop:10}}
            size="large"
            
          />
            </View>
          </View>
        </>
      )}
    </>
  );
}
