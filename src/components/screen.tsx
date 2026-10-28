import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { space } from '@/constants/theme';

type Props = {
  children: ReactNode;
  /** Pinned content below the scroll area (e.g. the main action button). */
  footer?: ReactNode;
  scroll?: boolean;
  background?: string;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
};

/** Safe-area screen wrapper with optional scroll and a pinned footer. */
export function Screen({ children, footer, scroll = true, background = '#fff', edges = ['top', 'bottom'], contentStyle }: Props) {
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }} edges={edges}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {body}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.lg + 2, paddingTop: space.sm, paddingBottom: space.xl, flexGrow: 1 },
  footer: { paddingHorizontal: space.lg + 2, paddingTop: space.sm, paddingBottom: space.md, gap: space.xs },
});
