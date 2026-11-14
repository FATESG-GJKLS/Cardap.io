import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { uiStyles } from './uiStyles';

export function Photo({
  url,
  emoji,
  style,
}: {
  url?: string;
  emoji?: string;
  style?: object;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) {
    return (
      <View style={[uiStyles.imageFallback, style]}>
        <Text style={uiStyles.fallbackEmoji}>{emoji || '🍽️'}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={[uiStyles.image, style]}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

type ButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'dark' | 'outline' | 'ghost';
  disabled?: boolean;
  testID?: string;
  small?: boolean;
  style?: object;
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  testID,
  small = false,
  style,
}: ButtonProps) {
  const backgroundColor =
    variant === 'primary'
      ? '#FF6835'
      : variant === 'dark'
        ? '#221C18'
        : variant === 'outline'
          ? '#FFFFFF'
          : 'transparent';
  const textColor =
    variant === 'primary' || variant === 'dark' ? '#FFFFFF' : '#221C18';

  return (
    <Pressable
      accessibilityRole="button"
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        uiStyles.button,
        {
          backgroundColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: '#EDE7DF',
          paddingVertical: small ? 10 : 14,
          opacity: disabled ? 0.42 : pressed ? 0.82 : 1,
        },
        style,
      ]}
    >
      <Text style={[uiStyles.buttonText, { color: textColor, fontSize: small ? 13 : 15 }]}>
        {children}
      </Text>
    </Pressable>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  secure?: boolean;
  testID?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
};

export function Field({
  label,
  value,
  onChange,
  placeholder,
  secure = false,
  testID,
  multiline = false,
  keyboardType = 'default',
}: FieldProps) {
  return (
    <View style={uiStyles.field}>
      <Text style={uiStyles.inputLabel}>{label}</Text>
      <TextInput
        testID={testID}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        autoCorrect={false}
        style={[uiStyles.input, multiline && uiStyles.multilineInput]}
        placeholderTextColor="#AAA19A"
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

export function TitleRow({
  kicker,
  title,
  subtitle,
  action,
  onAction,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={uiStyles.sectionHead}>
      <View style={uiStyles.titleContent}>
        {kicker ? <Text style={uiStyles.eyebrow}>{kicker}</Text> : null}
        <Text style={uiStyles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={uiStyles.subTitle}>{subtitle}</Text> : null}
      </View>
      {action && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={uiStyles.sectionAction}>{action}  ↗</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
