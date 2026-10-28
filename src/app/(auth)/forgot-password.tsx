import { router } from "expo-router";
import { useState } from "react";

import { Screen } from "@/components/screen";
import { Button, Field, Notice, T, TopBar } from "@/components/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSend = () => {
    if (!EMAIL_RE.test(email.trim()))
      return setError("Enter a valid email address.");
    setError(null);
    // Same message whether or not the account exists (no account enumeration).
    setSent(true);
  };

  return (
    <Screen
      footer={
        sent ? (
          <Button
            label="Back to login"
            onPress={() => router.replace("/welcome")}
          />
        ) : (
          <Button label="Send reset link" onPress={onSend} />
        )
      }
    >
      <TopBar />
      <T variant="display">Reset your password</T>
      <T variant="small" style={{ marginTop: 4 }}>
        We’ll email you a link to set a new password.
      </T>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
        editable={!sent}
      />
      {sent ? (
        <Notice icon="mail-outline">
          If an account exists for {email.trim()}, a reset link is on its way.
          Check your inbox.
        </Notice>
      ) : null}
    </Screen>
  );
}
