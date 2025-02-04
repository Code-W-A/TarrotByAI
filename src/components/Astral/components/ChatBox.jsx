import React, { useState } from "react";
import {
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
} from "react-native";
import { Button, Text, Card } from "react-native-paper";

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const fetchChatResponse = async (userInput) => {
    const url = "https://chat-gpt26.p.rapidapi.com/";
    const options = {
      method: "POST",
      headers: {
        "x-rapidapi-key": "fdb30fac7dmshee22c632d48569ap1d9819jsna577a39fffd6",
        "x-rapidapi-host": "chat-gpt26.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: userInput,
          },
        ],
      }),
    };

    try {
      const response = await fetch(url, options);
      console.log("response...", response);
      const result = await response.json();
      console.log("response...", result);
      console.log("response...", result.choices[0].message.content);
      return result.choices[0].message.content;
    } catch (error) {
      console.error(error);
      return "There was an error processing your request.";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage = { role: "user", content: input };
    setMessages((prevMessages) => [
      ...prevWithCurrentMessage(prevMessages, newMessage),
    ]);

    const responseMessage = await fetchChatResponse(input);
    console.log("response...", responseMessage);
    if (responseMessage) {
      const botMessage = { role: "bot", content: responseMessage };
      setMessages((prevMessages) => [
        ...prevWithCurrentMessage(prevMessages, botMessage),
      ]);
    }
    setInput("");
  };

  const prevWithCurrentMessage = (prevMessages, message) => [
    ...prevMessages,
    message,
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={msg.role === "user" ? styles.userMessage : styles.botMessage}
          >
            <Card style={styles.cardStyle}>
              <Card.Content>
                <Text>{msg.content}</Text>
              </Card.Content>
            </Card>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
        />
        <Button mode="contained" onPress={handleSend} style={styles.sendButton}>
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: "30%",
    marginBottom: "10%",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    marginVertical: 4,
  },
  botMessage: {
    alignSelf: "flex-start",
    marginVertical: 4,
  },
  cardStyle: {
    maxWidth: "80%",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    borderRadius: 20,
  },
});

export default ChatComponent;
