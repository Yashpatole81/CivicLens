import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Logo } from "@/components/logo";
import { Button, Field, Notice, T } from "@/components/ui";
import { colors, fonts, space } from "@/constants/theme";
import { useApp } from "@/store/app-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Welcome() {
  const { signIn, pendingEmail } = useApp();
  const [email, setEmail] = useState(pendingEmail ?? "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      return setError("Enter a valid email address.");
    }
    if (password.length < 1) {
      return setError("Enter your password.");
    }
    setError(null);
    setLoading(true);

    const res = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    router.replace("/home");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.green9 }}>
      <SafeAreaView edges={["top"]} style={styles.hero}>
        <View style={styles.brand}>
          <View style={styles.mark}>
            <Logo size={24} />
          </View>
          <Text style={styles.brandText}>CivicLens</Text>
        </View>
        <Text style={styles.tagline}>
          Turn a photo into action.{"\n"}Make your city better.
        </Text>
        <Skyline />
      </SafeAreaView>

      <SafeAreaView edges={["bottom"]} style={styles.sheet}>
        <T variant="heading" style={{ fontSize: 19 }}>
          Welcome back
        </T>
        {pendingEmail ? (
          <View style={{ marginTop: space.md }}>
            <Notice icon="mail-outline">
              Verify your email first, then log in with {pendingEmail}.
            </Notice>
          </View>
        ) : null}
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry={!showPw}
          autoComplete="password"
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPw ? "Hide password" : "Show password"}
              onPress={() => setShowPw((s) => !s)}
              hitSlop={10}
            >
              <Text style={styles.link}>{showPw ? "Hide" : "Show"}</Text>
            </Pressable>
          }
        />
        <Link href="/forgot-password" asChild>
          <Pressable
            accessibilityRole="link"
            style={{ alignSelf: "flex-end", paddingVertical: space.sm }}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </Link>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label="Log in"
          onPress={onLogin}
          loading={loading}
          style={{ marginTop: space.sm }}
        />
        <View style={styles.signup}>
          <T variant="small">New to CivicLens? </T>
          <Link href="/register" asChild>
            <Pressable accessibilityRole="link" hitSlop={8}>
              <Text style={styles.link}>Create account</Text>
            </Pressable>
          </Link>
        </View>
        <Text style={styles.foot}>
          CIVICLENS ENTERPRISE · MUNICIPAL SAAS PLATFORM
        </Text>
      </SafeAreaView>
    </View>
  );
}

/** Simple flat skyline, no specific city (India-first decision). */
function Skyline() {
  const blocks = [
    [0, 38, 30],
    [32, 52, 22],
    [58, 44, 34],
    [96, 66, 18],
    [118, 30, 40],
    [162, 48, 26],
    [192, 36, 34],
    [230, 58, 24],
    [258, 42, 40],
    [302, 50, 30],
    [336, 34, 40],
  ];
  return (
    <View style={styles.skyline} pointerEvents="none">
      {blocks.map(([left, h, w]) => (
        <View
          key={left}
          style={{
            position: "absolute",
            left,
            bottom: 0,
            width: w,
            height: h,
            backgroundColor: colors.green8,
          }}
        />
      ))}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 14,
          backgroundColor: colors.green7,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    height: 260,
    overflow: "hidden",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    marginTop: space.md,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.green5,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontFamily: fonts.displayBold, fontSize: 28, color: "#fff" },
  tagline: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 25,
    color: "#E3F1E9",
    marginTop: space.lg,
  },
  skyline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 28,
    height: 70,
  },
  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -28,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
  },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.green7 },
  error: {
    fontFamily: fonts.medium,
    fontSize: 12.5,
    color: colors.red,
    marginBottom: space.xs,
  },
  signup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: space.lg,
  },
  foot: {
    marginTop: "auto",
    paddingVertical: space.md,
    textAlign: "center",
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.ink3,
  },
});
