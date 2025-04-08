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
import { sfont, sh, sw } from "@libs/responsive.lib";
import LoadingCircle from "@components/Shared/LoadingCircle";
import SizedBox from "@components/Shared/SizedBox";
import ContainerLayout from "@components/Layout/ContainerLayout";

type ModalGameProps = {
  visible: boolean;
};

export default function ModalGame(props: ModalGameProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [circles, setCircles] = useState<
    {
      id: string;
      x: number;
      y: number;
      color: string;
      tapped: boolean;
    }[]
  >([]);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (props.visible) {
      setScore(0);
      setCircles([]);
      setLives(3);
      setGameOver(false);
    }
    setIsVisible(props.visible);
  }, [props.visible]);

  useEffect(() => {
    if (gameOver) return; // Stop spawning if game is over

    const interval = setInterval(() => {
      const newCircle = {
        id: Math.random().toString(),
        x: Math.random() * 300,
        y: 150 + Math.random() * 450, // Ensures circles spawn below the score
        color: Math.random() < 0.2 ? "red" : "green", // 20% chance red, 80% green
        tapped: false, // NEW: Track if tapped
      };

      setCircles((prev) => [...prev, newCircle]);

      // Remove the circle after 3 seconds and deduct life only if not tapped
      setTimeout(() => {
        setCircles((prev) => {
          const circle = prev.find((c) => c.id === newCircle.id);
          if (circle && circle.color === "green" && !circle.tapped) {
            setLives((prevLives) => prevLives - 1);
          }
          return prev.filter((c) => c.id !== newCircle.id);
        });
      }, 1500);
    }, 600); // A new circle every second

    return () => clearInterval(interval);
  }, [gameOver]);

  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true);
    }
  }, [lives]);

  const handleTap = (id: string, color: string) => {
    if (color === "red") {
      setGameOver(true);
      return;
    }

    // Mark the circle as tapped
    setCircles((prev) =>
      prev.map((circle) =>
        circle.id === id ? { ...circle, tapped: true } : circle
      )
    );

    setCircles((prev) => prev.filter((circle) => circle.id !== id));
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
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ContainerLayout>
            <View style={styles.container}>
              <View
                style={{
                  flexDirection: "row",
                  position: "absolute",
                  zIndex: 10,
                  right: sw(15),
                  gap: sw(10),
                  padding: sw(10),
                }}
              >
                <CustomText size="medium" label="Please wait...." />
                <LoadingCircle visible={true} size="small" />
              </View>
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
                  <CustomText
                    size="big"
                    label={`LIFE  ${"❤️ ".repeat(lives)}`}
                  />
                  <SizedBox height={sh(10)} />
                  <CustomText size="big" label={`SCORE  ${score}`} />
                  {circles.map((circle) => (
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
          </ContainerLayout>
        </GestureHandlerRootView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: sw(15) },
  score: { fontSize: sfont(18), marginTop: sh(20) },
  circle: {
    width: sw(50),
    height: sw(50),
    borderRadius: sw(100),
    position: "absolute",
  },
  gameOverContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  gameOverText: { fontSize: sfont(24), fontWeight: "bold", color: "red" },
  restartButton: {
    marginTop: sh(20),
    padding: sw(10),
    backgroundColor: Colors.primary,
    borderRadius: sw(10),
  },
  restartText: { color: "white", fontSize: sfont(14) },
});
