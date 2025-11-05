import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

interface TypingIndicatorProps {
  visible: boolean;
  userName?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  visible, 
  userName = 'AI 顧問' 
}) => {
  const dot1Animation = useRef(new Animated.Value(0)).current;
  const dot2Animation = useRef(new Animated.Value(0)).current;
  const dot3Animation = useRef(new Animated.Value(0)).current;
  const containerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 顯示容器
      Animated.timing(containerAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // 開始點點動畫
      const createDotAnimation = (animatedValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const dot1Anim = createDotAnimation(dot1Animation, 0);
      const dot2Anim = createDotAnimation(dot2Animation, 200);
      const dot3Anim = createDotAnimation(dot3Animation, 400);

      dot1Anim.start();
      dot2Anim.start();
      dot3Anim.start();

      return () => {
        dot1Anim.stop();
        dot2Anim.stop();
        dot3Anim.stop();
      };
    } else {
      // 隱藏容器
      Animated.timing(containerAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // 重置動畫
      dot1Animation.setValue(0);
      dot2Animation.setValue(0);
      dot3Animation.setValue(0);
    }
  }, [visible, dot1Animation, dot2Animation, dot3Animation, containerAnimation]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerAnimation,
          transform: [{
            translateY: containerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <View style={styles.bubble}>
        <Text style={styles.userName}>{userName} 正在輸入</Text>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot1Animation,
                transform: [{
                  scale: dot1Animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot2Animation,
                transform: [{
                  scale: dot2Animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot3Animation,
                transform: [{
                  scale: dot3Animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                }],
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginVertical: 4,
    marginHorizontal: 16,
    maxWidth: '80%',
  },
  bubble: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userName: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#95a5a6',
    marginHorizontal: 2,
  },
});

export default TypingIndicator;