import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@styles/Colors";
import CustomText from "@components/Shared/CustomText";
import { sw } from "@libs/responsive.lib";

type ModalGameProps = {
  visible: boolean;
};

export default function ModalGame(props: ModalGameProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [circles, setCircles] = useState<any>([]);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (props.visible) {
      setScore(0);
      setCircles([]);
      setLives(3);
      setGameOver(false);
    }
  }, [props.visible]);

  useEffect(() => {
    if (gameOver) return; // Stop spawning circles if game over

    const interval = setInterval(() => {
      const newCircle = {
        id: Math.random().toString(),
        x: Math.random() * 300,
        y: Math.random() * 600,
        color: Math.random() < 0.2 ? "red" : "green", // 20% red, 80% green
      };

      setCircles((prev: any) => [...prev, newCircle]);

      // Remove the circle after 3 seconds
      setTimeout(() => {
        setCircles((prev: any) =>
          prev.filter((c: any) => c.id !== newCircle.id)
        );

        if (newCircle.color === "green") {
          setLives((prev) => prev - 1);
        }
      }, 3000);
    }, 1000); // A new circle every second

    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true);
    }
  }, [lives]);

  const handleTap = (id: any, color: string) => {
    if (color === "red") {
      setGameOver(true);
      return;
    }

    setCircles((prev: any) => prev.filter((circle: any) => circle.id !== id));
    setScore((prev) => prev + 1);
  };

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setCircles([]);
    setLives(3);
  };

  return (
    <Modal animationType="slide" visible={isVisible}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: Colors.matterhorn,
            padding: sw(15),
          }}
        >
          <CustomText
            size="medium"
            label="Loading..."
            textStyle={{ color: Colors.white }}
          />
        </View>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.container}>
            {gameOver ? (
              <View style={styles.gameOverContainer}>
                <Text style={styles.gameOverText}>Game Over!</Text>
                <Text style={styles.score}>Score: {score}</Text>
                <TouchableOpacity
                  style={styles.restartButton}
                  onPress={restartGame}
                >
                  <Text style={styles.restartText}>Restart</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Lives Indicator */}
                <Text style={styles.lives}>Lives: {"❤️".repeat(lives)}</Text>
                <Text style={styles.score}>Score: {score}</Text>

                {/* Circles */}
                {circles.map((circle: any) => (
                  <TouchableOpacity
                    key={circle.id}
                    style={[
                      styles.circle,
                      {
                        top: circle.y,
                        left: circle.x,
                        backgroundColor: circle.color,
                      },
                    ]}
                    onPress={() => handleTap(circle.id, circle.color)}
                  />
                ))}
              </>
            )}
          </View>
        </GestureHandlerRootView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  score: { fontSize: 24, marginTop: 20 },
  lives: { fontSize: 24, marginTop: 10, color: "red" },
  circle: { width: 50, height: 50, borderRadius: 25, position: "absolute" },
  gameOverContainer: { justifyContent: "center", alignItems: "center" },
  gameOverText: { fontSize: 32, fontWeight: "bold", color: "red" },
  restartButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 10,
  },
  restartText: { color: "white", fontSize: 18 },
});
