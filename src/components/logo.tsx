import { View } from 'react-native';

import { Icon } from '@/components/ui';
import { colors } from '@/constants/theme';

/** Brand mark: location pin with a lens. Built from an icon to avoid an SVG dependency. */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="location" size={size} color="#fff" />
      <View
        style={{
          position: 'absolute',
          top: size * 0.2,
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: size,
          borderWidth: Math.max(2, size * 0.08),
          borderColor: colors.green5,
          backgroundColor: '#fff',
        }}
      />
    </View>
  );
}
