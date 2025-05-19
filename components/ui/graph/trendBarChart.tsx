import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { DashPathEffect, useFont } from '@shopify/react-native-skia';
import { BarChart } from "react-native-gifted-charts";
import { Inter_500Medium } from "@expo-google-fonts/inter";
import { configureReanimatedLogger, ReanimatedLogLevel, useAnimatedProps, useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { Dimensions } from 'react-native';

interface trendBarChartProps {
  chartData: {
    label: string;
    value: number;
  }[],
  chartProps: {
    unSelectedBarColor: string;
    selectedBarColor: string;
  },
  setSelectedMonth: (month: string | null) => void,
}

interface BarItemData {
  value: number;
  label: string;
  frontColor: string;
}

const TrendBarChart = ({ chartData, chartProps, setSelectedMonth }: trendBarChartProps) => {
  const windowWidth = Dimensions.get('window').width;
  const [barData, setBarData] = React.useState<BarItemData[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const mappedData = chartData.map((item, index) => ({
      value: item.value,
      label: item.label,
      frontColor: chartProps.unSelectedBarColor,
    }));
    setBarData(mappedData);
  }, [chartData, chartProps]);

  useEffect(() => {
    if (selectedIndex) {
      barData.forEach((bar, i) => {
        if (i !== selectedIndex) {
          bar.frontColor = chartProps.unSelectedBarColor;
        } else {
          bar.frontColor = chartProps.selectedBarColor;
        }
      });
      setBarData([...barData]);
    }
  }, [selectedIndex]);

  const onBarPress = (item: any, index: number) => {
    setSelectedMonth(item.label);
    setSelectedIndex(index);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <BarChart
        yAxisTextStyle={{
          color: 'black',
          fontSize: 12,
        }}
        barBorderTopLeftRadius={10}
        barBorderTopRightRadius={10}
        barWidth={35}
        showFractionalValues
        spacing={15}
        noOfSections={5}
        endSpacing={0}
        yAxisThickness={0}
        width={windowWidth - 100}
        xAxisColor={'lightgray'}
        onPress={(item: any, index: number) => onBarPress(item, index)}
        data={barData}>
      </BarChart>
    </View>
  )
}

export default TrendBarChart
