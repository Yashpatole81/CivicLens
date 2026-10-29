import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button, Card, Icon, Notice, Stepper, T, TopBar } from '@/components/ui';
import { colors, fonts, radius, space } from '@/constants/theme';
import { formatDateTime } from '@/lib/format';
import { getComplaintLocation, type LocationResult } from '@/lib/location';
import { useApp } from '@/store/app-store';

type LocState = 'idle' | 'loading' | 'done' | Extract<LocationResult, { ok: false }>['reason'];
type CamState = 'idle' | 'denied' | 'blocked' | 'error';

const LOW_ACCURACY_M = 50;

const LOCATION_MESSAGES: Record<Exclude<LocState, 'idle' | 'loading' | 'done'>, string> = {
  denied: 'Location is needed so the city can find the issue. Please allow it to continue.',
  blocked: 'Location permission is turned off for CivicLens. Turn it on in Settings to continue.',
  disabled: 'Location services are off. Turn on location on your phone, then retry.',
  timeout: "We couldn't get a GPS fix in time. Move to an open area and retry.",
  error: "Something went wrong getting your location. Please retry.",
};

export default function NewComplaint() {
  const { draft, updateDraft } = useApp();
  const [cam, setCam] = useState<CamState>('idle');
  const [loc, setLoc] = useState<LocState>(draft.location ? 'done' : 'idle');
  const [capturedAt, setCapturedAt] = useState<Date | null>(draft.photoUri ? new Date() : null);

  const fetchLocation = async () => {
    setLoc('loading');
    const result = await getComplaintLocation();
    if (result.ok) {
      updateDraft({ location: result.location });
      setLoc('done');
    } else {
      updateDraft({ location: null });
      setLoc(result.reason);
    }
  };

  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return setCam(perm.canAskAgain ? 'denied' : 'blocked');
      setCam('idle');
      const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, exif: false });
      if (result.canceled) return;
      updateDraft({ photoUri: result.assets[0].uri });
      setCapturedAt(new Date());
      if (!draft.location) fetchLocation();
    } catch {
      setCam('error');
    }
  };

  const location = draft.location;
  const lowAccuracy = location?.accuracyM != null && location.accuracyM > LOW_ACCURACY_M;
  const canContinue = !!draft.photoUri && loc === 'done' && !!location;

  return (
    <Screen
      footer={<Button label="Continue" disabled={!canContinue} onPress={() => router.push('/complaint/describe')} />}>
      <TopBar title="New complaint" />
      <Stepper step={1} />

      {draft.photoUri ? (
        <View style={styles.viewfinder}>
          <Image source={{ uri: draft.photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="Captured photo" />
          <Corners />
          {capturedAt ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>CAPTURED · {formatDateTime(capturedAt).toUpperCase()}</Text>
            </View>
          ) : null}
          <Pressable accessibilityRole="button" accessibilityLabel="Retake photo" onPress={takePhoto} style={styles.retake}>
            <Icon name="refresh" size={15} color="#fff" />
            <Text style={styles.retakeText}>Retake</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel="Open camera" onPress={takePhoto} style={[styles.viewfinder, styles.empty]}>
          <Corners dark />
          <View style={styles.camCircle}>
            <Icon name="camera-outline" size={30} color="#fff" />
          </View>
          <T variant="heading" style={{ marginTop: space.md }}>Take a photo of the issue</T>
          <T variant="small" style={{ textAlign: 'center', marginTop: 4, paddingHorizontal: space.xl }}>
            {"We use your camera to capture it. Gallery photos aren't accepted."}
          </T>
        </Pressable>
      )}

      {cam === 'denied' || cam === 'blocked' ? (
        <View style={{ marginTop: space.md, gap: space.sm }}>
          <Notice tone="warn" icon="camera-outline">
            {cam === 'blocked'
              ? 'Camera access is turned off for CivicLens. Turn it on in Settings to report an issue.'
              : 'CivicLens needs the camera to photograph the issue. Please allow it to continue.'}
          </Notice>
          <Button kind="outline" label={cam === 'blocked' ? 'Open settings' : 'Try again'} onPress={cam === 'blocked' ? () => Linking.openSettings() : takePhoto} />
        </View>
      ) : null}
      {cam === 'error' ? (
        <View style={{ marginTop: space.md }}>
          <Notice tone="danger" icon="alert-circle-outline">{"The camera couldn't open. Please try again."}</Notice>
        </View>
      ) : null}

      {draft.photoUri ? (
        <LocationCard
          state={loc}
          location={location}
          lowAccuracy={lowAccuracy}
          onRetry={fetchLocation}
        />
      ) : null}

      <View style={styles.hint}>
        <Icon name="eye-outline" size={14} color={colors.ink3} />
        <T variant="small" style={{ flex: 1, fontSize: 12 }}>Try to keep faces and number plates out of the photo.</T>
      </View>
    </Screen>
  );
}

function LocationCard({
  state,
  location,
  lowAccuracy,
  onRetry,
}: {
  state: LocState;
  location: ReturnType<typeof useApp>['draft']['location'];
  lowAccuracy: boolean;
  onRetry: () => void;
}) {
  if (state === 'idle' || state === 'loading') {
    return (
      <Card tint style={styles.locCard}>
        <ActivityIndicator color={colors.green7} />
        <T variant="label" style={{ color: colors.green8 }}>Getting your location...</T>
      </Card>
    );
  }

  if (state !== 'done' || !location) {
    return (
      <View style={{ marginTop: space.md, gap: space.sm }}>
        <Notice tone="warn" icon="location-outline">{LOCATION_MESSAGES[state as keyof typeof LOCATION_MESSAGES]}</Notice>
        <Button
          kind="outline"
          label={state === 'blocked' ? 'Open settings' : 'Retry location'}
          onPress={state === 'blocked' ? () => Linking.openSettings() : onRetry}
        />
      </View>
    );
  }

  return (
    <View>
      <Card tint style={[styles.locCard, { alignItems: 'flex-start' }]}>
        <View style={styles.pin}>
          <Icon name="location" size={20} color={colors.green7} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="locate-outline" size={15} color={colors.green8} />
            <Text style={styles.locTitle}>Location captured</Text>
          </View>
          <Text style={styles.address}>{location.address ?? 'Address not available'}</Text>
          {location.locality ? <T variant="small" style={{ fontSize: 12, color: colors.ink2 }}>{location.locality}</T> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <T variant="small" style={{ fontSize: 12 }}>
              {location.accuracyM != null ? `Accurate to ±${location.accuracyM} m · ` : ''}
            </T>
            <Pressable accessibilityRole="button" accessibilityLabel="Retry location" onPress={onRetry} hitSlop={10}>
              <Text style={styles.retry}>Retry</Text>
            </Pressable>
          </View>
        </View>
      </Card>
      {lowAccuracy ? (
        <View style={{ marginTop: space.sm }}>
          <Notice tone="warn" icon="warning-outline">
            GPS accuracy is low (±{location.accuracyM} m). You can retry outdoors, or continue anyway.
          </Notice>
        </View>
      ) : null}
    </View>
  );
}

function Corners({ dark }: { dark?: boolean }) {
  const c = dark ? colors.ink3 : '#fff';
  return (
    <>
      <View style={[styles.corner, { top: 14, left: 14, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8, borderColor: c }]} />
      <View style={[styles.corner, { top: 14, right: 14, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8, borderColor: c }]} />
      <View style={[styles.corner, { bottom: 14, left: 14, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8, borderColor: c }]} />
      <View style={[styles.corner, { bottom: 14, right: 14, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8, borderColor: c }]} />
    </>
  );
}

const styles = StyleSheet.create({
  viewfinder: { height: 270, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#000' },
  empty: { backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  camCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.green7, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 26, height: 26, borderWidth: 3 },
  tag: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: { fontFamily: fonts.monoBold, fontSize: 10.5, color: colors.green8 },
  retake: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(17,24,20,0.78)',
  },
  retakeText: { fontFamily: fonts.semibold, fontSize: 13, color: '#fff' },
  locCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
  pin: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.green2 },
  locTitle: { fontFamily: fonts.semibold, fontSize: 13.5, color: colors.green8 },
  address: { fontFamily: fonts.semibold, fontSize: 13.5, lineHeight: 18, color: colors.ink, marginTop: 4 },
  retry: { fontFamily: fonts.semibold, fontSize: 12, color: colors.green7 },
  hint: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginTop: space.md },
});
