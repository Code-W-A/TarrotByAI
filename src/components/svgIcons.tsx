import React, {Component} from 'react';
import {SvgCss} from 'react-native-svg';
import {colors} from '../utils/colors';

interface IconProps {
  width: number;
  height: number;
  color?: string;
}

export const BackArrow = (props: IconProps) => {
  const color = props.color ? props.color : colors.black;
  return (
    <SvgCss
      xml={`
        <svg width="${props.width}" height="${props.height}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `}
    />
  );
};
