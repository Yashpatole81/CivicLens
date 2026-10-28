/**
 * CivicLens design tokens. Values mirror REFERENCE/mockup/civiclens-mockup.html.
 */

export const colors = {
  paper: '#F3EFE6',
  paper2: '#E9E3D5',
  card: '#FFFFFF',
  ink: '#15211B',
  ink2: '#47544D',
  ink3: '#77827C',
  line: '#DFD9CB',
  line2: '#ECE7DC',

  green9: '#0C3A2B',
  green8: '#11503B',
  green7: '#16624A',
  green5: '#1E8A5E',
  green2: '#CFE6D8',
  green1: '#E6F2EA',
  greenOnDark: '#B7D7C5',

  amber: '#8A5A00',
  amberBg: '#FFF0D2',
  blue: '#1F4F99',
  blueBg: '#E3EBF8',
  violet: '#5B3E96',
  violetBg: '#ECE6F7',
  red: '#A3241C',
  redBg: '#FBE4E0',
  neutral: '#3E4943',
  neutralBg: '#EEF0EE',
} as const;

/** Font family names, as registered with useFonts in the root layout. */
export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  regular: 'PublicSans_400Regular',
  medium: 'PublicSans_500Medium',
  semibold: 'PublicSans_600SemiBold',
  bold: 'PublicSans_700Bold',
  mono: 'IBMPlexMono_500Medium',
  monoBold: 'IBMPlexMono_600SemiBold',
} as const;

export const radius = { sm: 8, md: 12, lg: 18, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Minimum touch target (pt), per NFR-A11Y-001. */
export const TOUCH = 44;
