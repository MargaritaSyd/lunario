import Svg, { Circle, Path } from 'react-native-svg';

import type { MoonPhase } from '../domain/moon';
import { theme } from '../theme';

/** Southern hemisphere: waxing is lit on the left, waning on the right. */
export function MoonIcon({
  phase,
  size = 11,
  color = theme.text,
}: {
  phase: MoonPhase;
  size?: number;
  color?: string;
}) {
  const half = phase === 'waxing' ? 'M6 1.6A4.4 4.4 0 0 0 6 10.4Z' : 'M6 1.6A4.4 4.4 0 0 1 6 10.4Z';

  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" accessible={false}>
      {phase === 'full' ? <Circle cx={6} cy={6} r={4.5} fill={color} /> : null}
      {phase === 'new' ? (
        <Circle cx={6} cy={6} r={4.1} stroke={color} strokeWidth={1.3} fill="none" />
      ) : null}
      {phase === 'waxing' || phase === 'waning' ? (
        <>
          <Circle cx={6} cy={6} r={4.1} stroke={color} strokeWidth={1.2} fill="none" />
          <Path d={half} fill={color} />
        </>
      ) : null}
    </Svg>
  );
}
