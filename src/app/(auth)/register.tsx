import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/components/screen";
import { Select } from "@/components/select";
import { Button, Field, Icon, T, TopBar } from "@/components/ui";
import { colors, fonts, radius, space } from "@/constants/theme";
import {
  CITIES,
  PHONE_PREFIX,
  STATES,
  getCitiesByState,
  getWardsForCity,
} from "@/data/locations";
import { useApp } from "@/store/app-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 10;

type Errors = Partial<
  Record<
    "name" | "email" | "password" | "confirm" | "city" | "terms" | "submit",
    string
  >
>;

export default function Register() {
  const { register } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [ward, setWard] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const selectedStateObj = STATES.find((s) => s.id === state);
  const stateCities = selectedStateObj
    ? getCitiesByState(selectedStateObj.name)
    : [];
  const cityWards = city ? getWardsForCity(city) : [];

  const stateOptions = STATES.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const cityOptions = stateCities.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const wardOptions = cityWards.map((w) => ({
    value: w.id,
    label: `Ward ${w.wardNumber}: ${w.name}`,
  }));

  const onSubmit = async () => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "Enter your full name.";
    if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address.";
    if (password.length < MIN_PASSWORD)
      e.password = `Use at least ${MIN_PASSWORD} characters.`;
    if (confirm !== password) e.confirm = "Passwords don't match.";
    if (!state || !city) e.city = "Choose your state and city.";
    if (!terms) e.terms = "Please accept the Terms and Privacy Policy.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    const cityRow = CITIES.find((c) => c.id === city)!;
    const wardRow = cityWards.find((w) => w.id === ward);

    const res = await register(
      {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        country: "IN",
        state: selectedStateObj?.name ?? "Maharashtra",
        city: cityRow.name,
        cityId: cityRow.id,
        ward: wardRow ? wardRow.name : null,
        wardId: wardRow ? wardRow.id : null,
        phone: phone.trim() ? phone.trim() : null,
      },
      password,
    );

    setLoading(false);

    if (!res.ok) {
      setErrors({ submit: res.error });
      return;
    }

    router.replace("/verify");
  };

  return (
    <Screen
      footer={
        <Button label="Create account" onPress={onSubmit} loading={loading} />
      }
    >
      <TopBar />
      <T variant="display">Create your account</T>
      <T variant="small" style={{ marginTop: 4 }}>
        {"Your complaints reach your city's municipal corporation & ward office."}
      </T>

      {errors.submit ? (
        <Text style={[styles.error, { marginTop: space.sm, fontSize: 13 }]}>
          {errors.submit}
        </Text>
      ) : null}

      <Field
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        autoComplete="name"
        error={errors.name}
      />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
      />
      <Field
        label="Phone"
        hint="(optional)"
        prefix={PHONE_PREFIX}
        value={phone}
        onChangeText={setPhone}
        placeholder="98XXX XXXXX"
        keyboardType="phone-pad"
        autoComplete="tel"
      />
      <Field
        label="Password"
        hint={`(min ${MIN_PASSWORD} characters)`}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        error={errors.password}
      />
      <Field
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoComplete="new-password"
        error={errors.confirm}
      />

      <View style={styles.loc}>
        <View style={styles.locHead}>
          <Icon name="location-outline" size={15} color={colors.green8} />
          <Text style={styles.locTitle}>Your Location (State ➔ City ➔ Ward)</Text>
        </View>
        <View style={{ gap: space.sm }}>
          <Select
            step={1}
            placeholder="State / UT"
            value={state}
            options={stateOptions}
            onChange={(v) => {
              setState(v);
              setCity(null);
              setWard(null);
            }}
          />
          <Select
            step={2}
            placeholder="City / Municipality"
            value={city}
            options={cityOptions}
            disabled={!state}
            onChange={(v) => {
              setCity(v);
              setWard(null);
            }}
          />
          <Select
            step={3}
            placeholder="Municipal Ward / Prabhag (optional)"
            value={ward}
            options={wardOptions}
            disabled={!city || wardOptions.length === 0}
            onChange={setWard}
          />
        </View>
        {errors.city ? <Text style={styles.error}>{errors.city}</Text> : null}
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: terms }}
        onPress={() => setTerms((t) => !t)}
        style={styles.terms}
      >
        <View style={[styles.box, terms && styles.boxOn]}>
          {terms ? <Icon name="checkmark" size={14} color="#fff" /> : null}
        </View>
        <Text style={styles.termsText}>
          I agree to the <Text style={styles.link}>Terms</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>.
        </Text>
      </Pressable>
      {errors.terms ? <Text style={styles.error}>{errors.terms}</Text> : null}

      <View style={styles.login}>
        <T variant="small">Already have an account? </T>
        <Link href="/welcome" asChild>
          <Pressable accessibilityRole="link" hitSlop={8}>
            <Text style={styles.link}>Log in</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loc: {
    marginTop: space.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.green2,
    backgroundColor: colors.green1,
    borderRadius: radius.md,
    padding: space.md,
  },
  locHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: space.sm,
  },
  locTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    color: colors.green8,
  },
  terms: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginTop: space.lg,
    minHeight: 44,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: { backgroundColor: colors.green7, borderColor: colors.green7 },
  termsText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.ink2,
  },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: colors.green7 },
  error: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.red,
    marginTop: 6,
  },
  login: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: space.md,
  },
});
