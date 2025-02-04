import React, { useState } from "react";
import { Button, Menu, Divider, Provider } from "react-native-paper";

export default function DatePicker() {
  const [visible, setVisible] = useState({
    day: false,
    month: false,
    year: false,
  });
  const [date, setDate] = useState({
    day: "1",
    month: "January",
    year: "2020",
  });

  const openMenu = (type) => setVisible({ ...visible, [type]: true });
  const closeMenu = (type) => setVisible({ ...visible, [type]: false });

  const setField = (field, value) => {
    setDate({ ...date, [field]: value });
    closeMenu(field);
  };

  return (
    <Provider>
      <Menu
        visible={visible.day}
        onDismiss={() => closeMenu("day")}
        anchor={<Button onPress={() => openMenu("day")}>{date.day}</Button>}
      >
        {Array.from({ length: 31 }, (_, i) => `${i + 1}`).map((day) => (
          <Menu.Item
            onPress={() => setField("day", day)}
            key={day}
            title={day}
          />
        ))}
      </Menu>
      <Menu
        visible={visible.month}
        onDismiss={() => closeMenu("month")}
        anchor={<Button onPress={() => openMenu("month")}>{date.month}</Button>}
      >
        {[
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].map((month) => (
          <Menu.Item
            onPress={() => setCField("month", month)}
            key={month}
            title={month}
          />
        ))}
      </Menu>
      <Menu
        visible={visible.year}
        onDismiss={() => closeMenu("year")}
        anchor={<Button onPress={() => openMenu("year")}>{date.year}</Button>}
      >
        {Array.from({ length: 50 }, (_, i) => `${2022 - i}`).map((year) => (
          <Menu.Item
            onPress={() => setField("year", year)}
            key={year}
            title={year}
          />
        ))}
      </Menu>
    </Provider>
  );
}
