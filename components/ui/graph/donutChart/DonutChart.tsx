import { StyleSheet, View } from 'react-native';
import React from 'react';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';
import { Canvas, Path, SkFont, Skia, Text } from '@shopify/react-native-skia';
import DonutPath from './DonutPath';

type Props = {
  gap: number;
  radius: number;
  strokeWidth: number;
  outerStrokeWidth: number;
  decimals: SharedValue<number[]>;
  colors: string[];
  totalValue: SharedValue<number>;
  font: SkFont;
  smallFont: SkFont;
  totalText: string;
};

const DonutChart = ({
  gap,
  decimals,
  colors,
  totalValue,
  strokeWidth,
  outerStrokeWidth,
  radius,
  font,
  smallFont,
  totalText
}: Props) => {
  const array = Array.from({ length: colors.length });
  const innerRadius = radius - outerStrokeWidth / 2;
  const path = Skia.Path.Make();
  path.addCircle(radius, radius, innerRadius);

  const targetText = useDerivedValue(
    () => `$${Math.round(totalValue.value)}`,
    [],
  );

  // Dynamic font size calculation based on inner circle space
  const dynamicFontSize = useDerivedValue(() => {
    // Calculate the inner circle diameter (available space for text)
    const innerCircleDiameter = (innerRadius * 2) * 0.8; // Use 80% of inner circle for safety margin
    const maxTextWidth = innerCircleDiameter * 0.9; // 90% of available width

    // Start with a reasonable base font size
    let fontSize = Math.min(innerRadius / 3, 50); // Start with radius/3 or max 50px

    // Test and adjust font size to fit within the inner circle
    font.setSize(fontSize);
    let textMeasurement = font.measureText(targetText.value);

    // Reduce font size until text fits within the available width
    while (textMeasurement.width > maxTextWidth && fontSize > 12) {
      fontSize -= 1;
      font.setSize(fontSize);
      textMeasurement = font.measureText(targetText.value);
    }

    // Also check if text height fits (consider both "Total Spent" and amount)
    const totalTextHeight = textMeasurement.height + smallFont.measureText(`Total ${totalText}`).height + 8; // 8px gap
    const maxTextHeight = innerCircleDiameter * 0.8;

    // Further reduce if total height doesn't fit
    while (totalTextHeight > maxTextHeight && fontSize > 12) {
      fontSize -= 1;
      font.setSize(fontSize);
      textMeasurement = font.measureText(targetText.value);
    }

    return fontSize;
  }, []);

  // Set the font size dynamically
  const adjustedFont = useDerivedValue(() => {
    font.setSize(dynamicFontSize.value);
    return font;
  }, []);

  const fontSize = useDerivedValue(() => {
    return adjustedFont.value.measureText(targetText.value);
  }, []);

  const smallFontSize = useDerivedValue(() => {
    return smallFont.measureText(`Total ${totalText}`);
  }, []);

  // Calculate centered positions for both texts
  const smallTextX = useDerivedValue(() => {
    return radius - smallFontSize.value.width / 2;
  }, []);

  const mainTextX = useDerivedValue(() => {
    return radius - fontSize.value.width / 2;
  }, []);

  // Calculate Y positions to center both texts vertically in the chart
  const totalTextHeight = useDerivedValue(() => {
    return smallFontSize.value.height + fontSize.value.height + 8; // 8px gap between texts
  }, []);

  const smallTextY = useDerivedValue(() => {
    return radius - totalTextHeight.value / 2 + smallFontSize.value.height;
  }, []);

  const mainTextY = useDerivedValue(() => {
    return radius + totalTextHeight.value / 2 - fontSize.value.height / 4; // Adjust for baseline
  }, []);

  return (
    <View style={styles.container}>
      <Canvas style={styles.container}>
        <Path
          path={path}
          color="#f4f7fc"
          style="stroke"
          strokeJoin="round"
          strokeWidth={outerStrokeWidth}
          strokeCap="round"
          start={0}
          end={1}
        />
        {array.map((_, index) => {
          return (
            <DonutPath
              key={index}
              radius={radius}
              strokeWidth={strokeWidth}
              outerStrokeWidth={outerStrokeWidth}
              color={colors[index]}
              decimals={decimals}
              index={index}
              gap={gap}
            />
          );
        })}
        <>
          <Text
            x={smallTextX}
            y={smallTextY}
            text={`Total ${totalText}`}
            font={smallFont}
            color="black"
          />
          <Text
            x={mainTextX}
            y={mainTextY}
            text={targetText}
            font={adjustedFont}
            color="black"
          />
        </>

      </Canvas>
    </View>
  );
};

export default DonutChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});