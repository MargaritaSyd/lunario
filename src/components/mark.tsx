import Svg, { Circle, Ellipse, G } from 'react-native-svg';

import { theme } from '../theme';

const PETALS = [0, 45, 90, 135, 180, 225, 270, 315];

/** The margarita from the personal site, without the side chevrons. */
export function Mark({ size = 64, color = theme.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="18 10 44 44" accessible={false}>
      {PETALS.map((deg) => (
        <G key={deg} rotation={deg} origin="40, 32">
          <Ellipse cx={40} cy={21} rx={4.5} ry={8.4} stroke={color} strokeWidth={1.8} fill="none" />
        </G>
      ))}
      <Circle cx={40} cy={32} r={4.6} fill={theme.bg} />
      <Circle cx={40} cy={32} r={5.4} stroke={color} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}
