import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Text,
    Dimensions,
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
const { width, height } = Dimensions.get('window');

const FloatingButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    // Create separate background opacity animation
    const backgroundOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // When component unmounts, clean up animations
        return () => {
            animation.setValue(0);
            backgroundOpacity.setValue(0);
        };
    }, []);

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;

        // Animate both the buttons and background opacity
        Animated.parallel([
            Animated.spring(animation, {
                toValue,
                friction: 6,
                useNativeDriver: true,
            }),
            Animated.timing(backgroundOpacity, {
                toValue: isOpen ? 0 : 0.5,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        setIsOpen(!isOpen);
    };

    const handleBackgroundPress = () => {
        if (isOpen) {
            toggleMenu();
        }
    };

    const incomeStyle = {
        transform: [
            { scale: animation },
            {
                translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -180],
                }),
            },
        ],
        opacity: animation,
    };

    const expenseStyle = {
        transform: [
            { scale: animation },
            {
                translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -120],
                }),
            },
        ],
        opacity: animation,
    };

    const transactionStyle = {
        transform: [
            { scale: animation },
            {
                translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -60],
                }),
            },
        ],
        opacity: animation,
    };

    const rotation = {
        transform: [
            {
                rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                }),
            },
        ],
    };

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Background overlay */}
            <Animated.View
                style={[
                    styles.background,
                    { opacity: backgroundOpacity }
                ]}
                pointerEvents={isOpen ? "auto" : "none"}
            >
                <TouchableOpacity
                    style={styles.backgroundTouchable}
                    activeOpacity={1}
                    onPress={handleBackgroundPress}
                />
            </Animated.View>

            {/* Buttons - kept separate from background */}
            <View style={styles.buttonContainer} pointerEvents="box-none">
                {/* Add Income Button */}
                <Animated.View style={[styles.buttonWrapper, incomeStyle]}>
                    <TouchableOpacity
                        style={styles.incomeButton}
                        activeOpacity={1}
                        onPress={() => {
                            toggleMenu();
                            router.push('/(app)/(page)/(addIncome)/addIncome');
                        }}
                    >
                        <MaterialIcons name="attach-money" size={24} color="#2196F3" />
                        <View style={styles.labelContainer}>
                            <Text style={styles.buttonLabel}>Add Income</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Add Expense Button */}
                <Animated.View style={[styles.buttonWrapper, expenseStyle]}>
                    <TouchableOpacity
                        style={styles.expenseButton}
                        activeOpacity={0.8}
                        onPress={() => {
                            toggleMenu();
                            router.push('/(app)/(page)/(addExpense)/addExpense');
                        }}
                    >
                        <MaterialCommunityIcons name="cart-outline" size={24} color="#2196F3" />
                        <View style={styles.labelContainer}>
                            <Text style={styles.buttonLabel}>Add Expense</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Add Transaction Button */}
                <Animated.View style={[styles.buttonWrapper, transactionStyle]}>
                    <TouchableOpacity
                        style={styles.expenseButton}
                        activeOpacity={0.8}
                        onPress={() => {
                            toggleMenu();
                            router.push('/(app)/(page)/(addTransaction)/addTransaction');
                        }}
                    >
                        <MaterialCommunityIcons name="cart-outline" size={24} color="#2196F3" />
                        <View style={styles.labelContainer}>
                            <Text style={styles.buttonLabel}>Add Transaction</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Main Button */}
                <Animated.View style={rotation}>
                    <TouchableOpacity
                        style={styles.mainButton}
                        onPress={toggleMenu}
                        activeOpacity={0.7}
                    >
                        <Feather name="plus" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
    },
    backgroundTouchable: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonWrapper: {
        position: 'absolute',
    },
    incomeButton: {
        width: 45,
        height: 45,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    expenseButton: {
        width: 45,
        height: 45,
        borderColor: '2196F3',
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mainButton: {
        width: 45,
        height: 45,
        borderRadius: 32,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    labelContainer: {
        alignItems: 'flex-end',
        width: 130,
        position: 'absolute',
        left: -140,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    buttonLabel: {
        color: 'black',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default FloatingButton;