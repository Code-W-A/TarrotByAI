import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { flex1, mh10, ml10, mv15, ph10 } from "../common/commonStyles";
import { colors } from "../utils/colors";
import { H8fontRegularBlack } from "./commonText";
import { RowView } from "./commonViews";

interface SegmentProps {
  tabs: Array<string>;
  flexible?: boolean;
  defaultTab: string;
  onTabChanged: CallableFunction;
  newTab?: string;
}
export type SegmentRef = { focus: CallableFunction };

export const SegmentControl = React.forwardRef(
  (
    { tabs, flexible, defaultTab, onTabChanged, newTab }: SegmentProps,
    ref?
  ) => {
    const [selectedTab, setSelectedTab] = useState<string>(defaultTab);
    useImperativeHandle(ref, () => ({
      focus: () => {
        // input.focus();
      },
    }));
    return (
      <RowView style={[mv15, mh10, { borderRadius: 5, padding: 7 }]}>
        {tabs.map((name, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedTab(name);
                onTabChanged(name);
              }}
              style={{
                backgroundColor:
                  defaultTab == name ? colors.facebook : colors.background,
                flex: flexible ? undefined : 1,
                height: 36,
                // width: 140,
                borderRadius: 30,
                // alignItems: 'center',
                // justifyContent: 'center',
                padding: 7,
                paddingHorizontal: 15,
                marginHorizontal: 2,
                // paddingLeft: 10
              }}
            >
              <H8fontRegularBlack
                numberOfLines={1}
                style={{
                  color: defaultTab == name ? colors.white : colors.black,
                }}
              >
                {name}
              </H8fontRegularBlack>
            </TouchableOpacity>
          );
        })}
      </RowView>
    );
  }
);
