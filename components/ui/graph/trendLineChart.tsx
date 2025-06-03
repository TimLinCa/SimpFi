import { View } from 'react-native'
import React, { useEffect } from 'react'
import { LineChart } from "react-native-gifted-charts";
import { Dimensions } from 'react-native';

interface trendLineChartProps {
    chartData: {
        label: string;
        value: number;
    }[],
    chartProps: {
        LineColor: string;
        DotColor: string;
    },
    onSelectedIndexChanged?: (index: number | null) => void,
}

interface LineItemData {
    value: number;
    label: string;
    showStrip: boolean,
    stripHeight?: number,
    customDataPoint?: () => JSX.Element;
}

const TrendLineChart = ({ chartData, chartProps, onSelectedIndexChanged }: trendLineChartProps) => {
    const customDataPoint = () => {
        return (
            <View
                style={{
                    width: 7,
                    height: 7,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderRadius: 5,
                    borderColor: '#07BAD1',
                }}
            />
        );
    };

    const [yAxisOffset, setYAxisOffset] = React.useState(0);
    const formatValue = (value: string) => {
        let parsedValue = parseFloat(value);
        if (parsedValue === 0) return "0";
        if (parsedValue >= 1000) {
            return (parsedValue / 1000).toFixed(1) + "K";
        }
        return value.toString();
    };

    const windowWidth = Dimensions.get('window').width;
    const [lineData, setLineData] = React.useState<LineItemData[]>([]);
    const noOfSections = 5;

    React.useEffect(() => {
        const mappedData = chartData.map((item, index) => ({
            value: item.value,
            label: item.label,
            customDataPoint: customDataPoint,
            showStrip: false,
            stripHeight: 200,
        }));
        setLineData(mappedData);
        const minValue = Math.min(...mappedData.map(item => item.value));
        if (minValue < 0) {
            setYAxisOffset(minValue * 2);
        }

    }, []);


    const onBackgroundPress = (event: any) => {
        const touchX = event.nativeEvent.locationX;
        const windowWidth = Dimensions.get('window').width;
        const chartWidth = windowWidth * 0.692;
        const dataPoints = lineData.length;

        // Calculate which data point is closest based on X position
        const pointIndex = Math.round((touchX / chartWidth) * (dataPoints - 1));
        const clampedIndex = Math.max(0, Math.min(pointIndex, dataPoints - 1));
        if (clampedIndex !== null) {
            lineData.forEach((line, i) => {
                line.showStrip = i === clampedIndex;
            });
            setLineData([...lineData]);
            if (onSelectedIndexChanged) {
                onSelectedIndexChanged(clampedIndex);
            }
        }
    };


    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LineChart
                yAxisTextStyle={{
                    color: 'black',
                    fontSize: 12,
                }}
                color={chartProps.LineColor}
                showFractionalValues
                formatYLabel={(value: string) => formatValue(value)}
                noOfSections={noOfSections}
                onBackgroundPress={onBackgroundPress}
                endSpacing={0}
                yAxisThickness={0}
                width={windowWidth * 0.754}
                yAxisOffset={yAxisOffset}
                xAxisColor={'lightgray'}
                stripStrokeDashArray={[4, 4]}
                data={lineData}
                dataPointsHeight={7}
                dataPointsWidth={7}
            />
        </View >
    )
}

export default TrendLineChart;
