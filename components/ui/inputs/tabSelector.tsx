import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, LayoutChangeEvent } from 'react-native';

interface TabSelectorProps {
    tabs: string[];
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onActiveTabChange?: (tab: string) => void;
}

const TabSelector = ({ tabs, activeTab, setActiveTab, onActiveTabChange }: TabSelectorProps) => {
    // Create animated value for the translateX (in pixels)
    const translateX = useRef(new Animated.Value(0)).current;
    // Store container width to calculate positions
    const containerWidthRef = useRef(0);

    // Function to handle tab press
    const handleTabPress = (index: number) => {
        if (containerWidthRef.current === 0) return;

        // Calculate the pixel position based on container width
        const tabWidth = containerWidthRef.current / tabs.length;
        const newPosition = index * tabWidth;

        // Animate to the position
        Animated.spring(translateX, {
            toValue: newPosition,
            useNativeDriver: true,
            friction: 8,
            tension: 20
        }).start();

        setActiveTab(tabs[index]);
        if (onActiveTabChange) {
            onActiveTabChange(tabs[index]);
        }
    };

    // Function to handle container layout and measure its width
    const handleLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        containerWidthRef.current = width;

        // Set initial position if active tab is not the first one
        const activeIndex = tabs.indexOf(activeTab);
        if (activeIndex > 0) {
            const tabWidth = width / tabs.length;
            translateX.setValue(activeIndex * tabWidth);
        }
    };

    return (
        <View
            className="flex-row bg-gray-100 rounded-full p-1 relative"
            onLayout={handleLayout}
        >
            {/* Animated background */}
            <Animated.View
                className="absolute top-1 bottom-1 rounded-full bg-white z-11"
                style={{
                    width: `${100 / tabs.length}%`,
                    transform: [{ translateX }],
                    elevation: 1,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.5,
                }}
            />

            {/* Tab buttons */}
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={index}
                    className="flex-1 py-2 px-4 items-center rounded-full z-10"
                    onPress={() => handleTabPress(index)}
                    activeOpacity={0.7}
                >
                    <Text
                        className={`font-semibold text-sm ${activeTab === tab ? 'text-black' : 'text-gray-500'}`}
                    >
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default TabSelector;