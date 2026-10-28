import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    type StyleProp,
    type TextInputProps,
    type TextProps,
    type TextStyle,
    type ViewStyle,
} from "react-native";

import { colors, fonts, radius, space, TOUCH } from "@/constants/theme";
import { SEVERITY_LABEL, STATUS_LABEL } from "@/lib/format";
import type { Severity, Status } from "@/types";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export function Icon({
  name,
  size = 18,
  color = colors.ink,
}: {
  name: IconName;
  size?: number;
  color?: ComponentProps<typeof Ionicons>["color"];
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

/* ---------------- Text ---------------- */

type Variant =
  | "display"
  | "title"
  | "heading"
  | "body"
  | "label"
  | "small"
  | "caption"
  | "mono";

const textStyles: Record<Variant, TextStyle> = {
  display: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 31,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 21,
    lineHeight: 26,
    color: colors.ink,
  },
  heading: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    lineHeight: 16,
    color: colors.ink2,
  },
  small: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.ink3,
  },
  caption: {
    fontFamily: fonts.semibold,
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.ink3,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink3,
  },
};

export function T({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  return <Text {...props} style={[textStyles[variant], style]} />;
}

/* ---------------- Button ---------------- */

type ButtonProps = {
  label: string;
  onPress?: () => void;
  kind?: "primary" | "outline" | "ghost" | "danger";
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  kind = "primary",
  icon,
  loading,
  disabled,
  style,
}: ButtonProps) {
  const off = disabled || loading;
  const fg = kind === "primary" || kind === "danger" ? "#fff" : colors.green8;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      onPress={off ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        kind === "primary" && styles.btnPrimary,
        kind === "outline" && styles.btnOutline,
        kind === "ghost" && styles.btnGhost,
        kind === "danger" && { backgroundColor: colors.red },
        off && { opacity: 0.5 },
        pressed && !off && { opacity: 0.85 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : icon ? (
        <Icon name={icon} color={fg} />
      ) : null}
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------------- Field ---------------- */

type FieldProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string | null;
  prefix?: string;
  right?: ReactNode;
};

export function Field({
  label,
  hint,
  error,
  prefix,
  right,
  style,
  ...input
}: FieldProps) {
  return (
    <View style={{ marginTop: space.md }}>
      <Text style={styles.fieldLabel}>
        {label}
        {hint ? <Text style={styles.fieldHint}> {hint}</Text> : null}
      </Text>
      <View style={[styles.input, !!error && { borderColor: colors.red }]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          placeholderTextColor={colors.ink3}
          accessibilityLabel={label}
          style={[styles.inputText, style]}
          {...input}
        />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

/* ---------------- Card ---------------- */

export function Card({
  children,
  tint,
  style,
}: {
  children: ReactNode;
  tint?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, tint && styles.cardTint, style]}>
      {children}
    </View>
  );
}

/* ---------------- Status chip ---------------- */

const STATUS_COLORS: Record<Status, [string, string]> = {
  submitted: [colors.neutral, colors.neutralBg],
  assigned: [colors.blue, colors.blueBg],
  under_review: [colors.violet, colors.violetBg],
  in_progress: [colors.amber, colors.amberBg],
  resolved: [colors.green7, colors.green1],
  closed: [colors.green7, colors.green1],
  rejected: [colors.red, colors.redBg],
};

export function StatusChip({ status }: { status: Status }) {
  const [fg, bg] = STATUS_COLORS[status];
  return <Chip label={STATUS_LABEL[status]} fg={fg} bg={bg} dot />;
}

export function Chip({
  label,
  fg,
  bg,
  dot,
}: {
  label: string;
  fg: string;
  bg: string;
  dot?: boolean;
}) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      {dot ? <View style={[styles.chipDot, { backgroundColor: fg }]} /> : null}
      <Text style={[styles.chipText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const SEVERITY_COLOR: Record<Severity, string> = {
  low: "#9AA59F",
  medium: "#6E7E76",
  high: "#C98A10",
  critical: colors.red,
};

export function SeverityTag({ severity }: { severity: Severity }) {
  const c = SEVERITY_COLOR[severity];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          backgroundColor: c,
          transform: [{ rotate: "45deg" }],
        }}
      />
      <Text
        style={{
          fontFamily: fonts.semibold,
          fontSize: 12,
          color: severity === "critical" ? colors.red : colors.ink2,
        }}
      >
        {SEVERITY_LABEL[severity]}
      </Text>
    </View>
  );
}

/* ---------------- Top bar + back ---------------- */

export function TopBar({
  title,
  right,
  onBack,
}: {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <View style={styles.topbar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={
          onBack ??
          (() => (router.canGoBack() ? router.back() : router.replace("/")))
        }
        style={styles.back}
      >
        <Icon name="chevron-back" size={18} />
      </Pressable>
      {title ? (
        <T variant="heading" style={{ flex: 1 }} numberOfLines={1}>
          {title}
        </T>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right}
    </View>
  );
}

/* ---------------- Stepper (Photo · Details · Review) ---------------- */

export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Photo", "Details", "Review"];
  return (
    <View
      style={styles.stepper}
      accessibilityLabel={`Step ${step} of 3: ${steps[step - 1]}`}
    >
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < step;
        const on = n === step;
        return (
          <View
            key={s}
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: n < 3 ? 1 : 0,
              gap: 6,
            }}
          >
            <View
              style={[
                styles.stepDot,
                done && styles.stepDone,
                on && styles.stepOn,
              ]}
            >
              {done ? (
                <Icon name="checkmark" size={12} color={colors.green7} />
              ) : (
                <Text style={[styles.stepNum, on && { color: "#fff" }]}>
                  {n}
                </Text>
              )}
            </View>
            <Text
              style={[styles.stepLabel, (on || done) && { color: colors.ink }]}
            >
              {s}
            </Text>
            {n < 3 ? (
              <View
                style={[
                  styles.stepLine,
                  done && { backgroundColor: colors.green5 },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

/* ---------------- Notice (inline banner) ---------------- */

export function Notice({
  tone = "info",
  icon,
  children,
}: {
  tone?: "info" | "warn" | "danger";
  icon?: IconName;
  children: ReactNode;
}) {
  const palette = {
    info: [colors.green8, colors.green1, colors.green2],
    warn: ["#5C3D00", colors.amberBg, "#EED7A6"],
    danger: [colors.red, colors.redBg, "#F1C2BC"],
  }[tone];
  return (
    <View
      style={[
        styles.notice,
        { backgroundColor: palette[1], borderColor: palette[2] },
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={palette[0]} /> : null}
      <Text style={[styles.noticeText, { color: palette[0] }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    paddingHorizontal: space.lg,
  },
  btnPrimary: { backgroundColor: colors.green7 },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: colors.green2,
  },
  btnGhost: { backgroundColor: "transparent", minHeight: TOUCH },
  btnText: { fontFamily: fonts.semibold, fontSize: 15 },

  fieldLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.ink2,
    marginBottom: 6,
  },
  fieldHint: { fontFamily: fonts.regular, color: colors.ink3 },
  input: {
    minHeight: TOUCH,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.md,
    backgroundColor: "#fff",
  },
  inputText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14.5,
    color: colors.ink,
    paddingVertical: 10,
  },
  prefix: {
    fontFamily: fonts.semibold,
    color: colors.ink2,
    paddingRight: space.sm,
    marginRight: space.sm,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  error: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.red,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: space.md,
  },
  cardTint: { backgroundColor: colors.green1, borderColor: colors.green2 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 24,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontFamily: fonts.semibold, fontSize: 11.5 },

  topbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    minHeight: TOUCH,
    marginBottom: space.xs,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },

  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: space.md,
    gap: 6,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  stepOn: { backgroundColor: colors.green7, borderColor: colors.green7 },
  stepDone: { backgroundColor: colors.green1, borderColor: colors.green2 },
  stepNum: { fontFamily: fonts.monoBold, fontSize: 11, color: colors.ink3 },
  stepLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.ink3 },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.line,
    marginHorizontal: 2,
  },

  notice: {
    flexDirection: "row",
    gap: space.sm,
    alignItems: "flex-start",
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    lineHeight: 18,
  },
});
