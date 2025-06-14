import { View } from 'react-native'
import React, { useEffect, useMemo } from 'react'
import { BarChart } from "react-native-gifted-charts";
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
  onSelectedIndexChanged?: (index: number | null) => void,
}

interface BarItemData {
  value: number;
  label: string;
  frontColor: string;
}

const TrendBarChart = ({ chartData, chartProps, onSelectedIndexChanged }: trendBarChartProps) => {
  const windowWidth = Dimensions.get('window').width;
  const [barData, setBarData] = React.useState<BarItemData[]>([]);
  const noOfSections = 5;

  const formatValue = (value: string) => {
    let parsedValue = parseFloat(value);
    if (parsedValue === 0) return "0";
    if (parsedValue >= 1000) {
      return (parsedValue / 1000).toFixed(1) + "K";
    }
    return value.toString();
  };

  useEffect(() => {
    const mappedData = chartData.map((item, index) => ({
      value: item.value,
      label: item.label,
      frontColor: chartProps.unSelectedBarColor,
    }));
    setBarData(mappedData);
  }, [chartData]);


  const onBarPress = (item: any, index: number) => {
    barData.forEach((bar, i) => {
      if (i !== index) {
        bar.frontColor = chartProps.unSelectedBarColor;
      } else {
        bar.frontColor = chartProps.selectedBarColor;
      }
    });
    if (onSelectedIndexChanged) {
      onSelectedIndexChanged(index);
    }
    setBarData([...barData]);
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
        noOfSections={noOfSections}
        endSpacing={0}
        formatYLabel={(value: string) => formatValue(value)}
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
