import React from 'react';
import { Path, Skia } from '@shopify/react-native-skia';
import {
  SharedValue,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  strokeWidth: number;
  outerStrokeWidth: number;
  gap: number;
  radius: number;
  color: string;
  decimals: SharedValue<number[]>;
  index: number;
};

const DonutPath = ({
  radius,
  gap,
  strokeWidth,
  outerStrokeWidth,
  color,
  decimals,
  index,
}: Props) => {
  const innerRadius = radius - outerStrokeWidth / 2;

  const path = Skia.Path.Make();
  path.addCircle(radius, radius, innerRadius);

  const start = useDerivedValue(() => {
    const currentDecimals = decimals.value;

    // Handle empty array case
    if (!currentDecimals || currentDecimals.length === 0) {
      return 0;
    }

    if (index === 0) {
      return withTiming(0, { duration: 1000 }); // Start from 0 for first segment
    }

    // Calculate the total space available for segments (1 - total gaps)
    const totalGaps = currentDecimals.length * gap; // One gap per segment
    const availableSpace = 1 - totalGaps;

    // Calculate sum of previous segments as proportion of available space
    const previousSegments = currentDecimals.slice(0, index);
    const sumPercentage = previousSegments.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    // Convert to actual position: (percentage * available space) + gaps before this segment
    const segmentPosition = (sumPercentage / 100) * availableSpace;
    const gapsBefore = gap * index;

    return withTiming(segmentPosition + gapsBefore, {
      duration: 1000,
    });
  }, [decimals]);

  const end = useDerivedValue(() => {
    const currentDecimals = decimals.value;

    // Handle empty array case
    if (!currentDecimals || currentDecimals.length === 0) {
      return 0;
    }

    // Handle case where index is out of bounds
    if (index >= currentDecimals.length) {
      return 0;
    }

    // Calculate the total space available for segments (1 - total gaps)
    const totalGaps = currentDecimals.length * gap; // One gap per segment
    const availableSpace = 1 - totalGaps;

    // Calculate sum including current segment as proportion of available space
    const segmentsIncludingCurrent = currentDecimals.slice(0, index + 1);
    const sumPercentage = segmentsIncludingCurrent.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0,
    );

    // Convert to actual position: (percentage * available space) + gaps before this segment
    const segmentPosition = (sumPercentage / 100) * availableSpace;
    const gapsBefore = gap * index;

    return withTiming(segmentPosition + gapsBefore, {
      duration: 1000,
    });
  }, [decimals]);

  return (
    <Path
      path={path}
      color={color}
      style="stroke"
      strokeJoin="round"
      strokeWidth={strokeWidth}
      strokeCap="round"
      start={start}
      end={end}
    />
  );
};

export default DonutPath;