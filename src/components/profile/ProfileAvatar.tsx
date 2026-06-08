import { View, Image, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../../constants/theme";

interface ProfileAvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  editable?: boolean;
  onImagePicked?: (uri: string) => void;
}

export function ProfileAvatar({
  uri,
  name = "U",
  size = 40,
  editable,
  onImagePicked,
}: ProfileAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Photo library access is required.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      onImagePicked?.(res.assets[0].uri);
    }
  };

  const content = uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );

  if (editable) {
    return (
      <TouchableOpacity onPress={pickImage} style={styles.editableWrap}>
        {content}
        <View style={[styles.editBadge, { right: 0, bottom: 0 }]}>
          <Ionicons name="camera" size={12} color={colors.onPrimary} />
        </View>
      </TouchableOpacity>
    );
  }

  return <View>{content}</View>;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.cardElevated,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { color: colors.primary, fontWeight: "800" },
  editableWrap: { position: "relative" },
  editBadge: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
});
