import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, type ViewStyle } from 'react-native';

import { Screen } from '../components/screen';
import { useLunario } from '../context/lunario';
import { cycleLengthLabel, dateLocale, lateLabel, messages } from '../i18n';
import { addMonthsKey, formatDateKey, todayKey, type DateKey } from '../domain/dates';
import { monthGrid } from '../domain/month';
import { markDay, predict, type DayMark } from '../domain/predict';
import { theme } from '../theme';

export default function CalendarScreen() {
  const { settings, cycles, setShowFertileWindow } = useLunario();
  const [today, setToday] = useState(todayKey);
  const [month, setMonth] = useState(() => `${todayKey().slice(0, 7)}-01`);

  useFocusEffect(
    useCallback(() => {
      setToday(todayKey());
    }, []),
  );

  if (!settings?.onboardingComplete) return <Redirect href="/onboarding" />;

  const prediction = predict(cycles, settings, today);
  const cells = monthGrid(month);
  const showingCurrentMonth = month.slice(0, 7) === today.slice(0, 7);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthNav}>
          <Pressable accessibilityLabel={messages.previousMonth} onPress={() => setMonth(addMonthsKey(month, -1))} style={styles.navButton}>
            <Text style={styles.navLabel}>‹</Text>
          </Pressable>
          <Text style={styles.month}>{formatDateKey(month, messages.monthYear, dateLocale)}</Text>
          <Pressable accessibilityLabel={messages.nextMonth} onPress={() => setMonth(addMonthsKey(month, 1))} style={styles.navButton}>
            <Text style={styles.navLabel}>›</Text>
          </Pressable>
        </View>
        {showingCurrentMonth ? null : (
          <Pressable accessibilityRole="button" onPress={() => setMonth(`${today.slice(0, 7)}-01`)} style={styles.todayButton}>
            <Text style={styles.todayLabel}>{messages.today}</Text>
          </Pressable>
        )}
        <View style={styles.weekdays}>
          {messages.weekdays.map((day) => (
            <Text key={day} style={styles.weekday}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((date, index) =>
            date ? (
              <DayCell
                key={date}
                date={date}
                today={today}
                mark={markDay(cycles, settings, today, date)}
                onPress={() => router.push({ pathname: '/day/[date]', params: { date } })}
              />
            ) : (
              <View key={`blank-${index}`} style={styles.slot} />
            ),
          )}
        </View>
        <View style={styles.legend}>
          <Legend swatch={styles.periodSwatch} label={messages.period} />
          <Legend swatch={styles.predictedSwatch} label={messages.predicted} />
          <Legend swatch={styles.ovulationSwatch} label={messages.ovulation} />
          {settings.showFertileWindow ? <Legend swatch={styles.fertileSwatch} label={messages.fertileWindow} /> : null}
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{messages.fertileWindow}</Text>
          <Switch
            accessibilityLabel={messages.fertileWindow}
            value={settings.showFertileWindow}
            onValueChange={(value) => void setShowFertileWindow(value)}
            trackColor={{ false: theme.border, true: theme.fertile }}
            thumbColor={theme.surface}
          />
        </View>
        <View style={styles.summary}>
          {prediction ? (
            <>
              <SummaryRow
                label={messages.nextPeriod}
                value={
                  prediction.late
                    ? `${formatDateKey(prediction.nextStart, messages.dateWithYear, dateLocale)} · ${lateLabel(prediction.daysLate)}`
                    : formatDateKey(prediction.nextStart, messages.dateWithYear, dateLocale)
                }
              />
              <SummaryRow label={messages.ovulation} value={formatDateKey(prediction.ovulation, messages.dateWithYear, dateLocale)} />
              {settings.showFertileWindow ? (
                <SummaryRow
                  label={messages.fertileWindow}
                  value={`${formatDateKey(prediction.fertileStart, messages.monthDay, dateLocale)} – ${formatDateKey(prediction.fertileEnd, messages.dateWithYear, dateLocale)}`}
                />
              ) : null}
              <SummaryRow label={messages.cycleLength} value={cycleLengthLabel(prediction.cycleLength)} />
            </>
          ) : (
            <Text style={styles.empty}>{messages.emptyPrediction}</Text>
          )}
        </View>
        <Text style={styles.disclaimer}>{messages.disclaimer}</Text>
      </ScrollView>
    </Screen>
  );
}

function DayCell({
  date,
  today,
  mark,
  onPress,
}: {
  date: DateKey;
  today: DateKey;
  mark: DayMark;
  onPress: () => void;
}) {
  const details = [
    mark.period ? messages.period : null,
    mark.predicted ? messages.predictedPeriod : null,
    mark.ovulation ? messages.ovulation : null,
    mark.fertile ? messages.fertileWindow : null,
  ].filter((part): part is string => part !== null);

  return (
    <View style={styles.slot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[formatDateKey(date, messages.dateWithYear, dateLocale), ...details].join(', ')}
        onPress={onPress}
        style={[
          styles.cell,
          mark.period ? styles.periodCell : null,
          !mark.period && mark.predicted ? styles.predictedCell : null,
          !mark.period && !mark.predicted && mark.ovulation ? styles.ovulationCell : null,
          !mark.period && !mark.predicted && !mark.ovulation && mark.fertile ? styles.fertileCell : null,
          date === today ? styles.todayCell : null,
        ]}
      >
        <Text style={[styles.dayNumber, mark.period ? styles.periodNumber : null]}>{Number(date.slice(-2))}</Text>
      </Pressable>
    </View>
  );
}

function Legend({ swatch, label }: { swatch: ViewStyle; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, swatch]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  navLabel: { color: theme.text, fontSize: 32, lineHeight: 36 },
  month: { color: theme.text, fontSize: 20, fontWeight: '600' },
  todayButton: { alignSelf: 'center' },
  todayLabel: { color: theme.focus, fontSize: 14, fontWeight: '600' },
  weekdays: { flexDirection: 'row' },
  weekday: { width: `${100 / 7}%`, textAlign: 'center', color: theme.muted, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  slot: { width: `${100 / 7}%`, padding: 2 },
  cell: {
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: theme.surface,
  },
  periodCell: { backgroundColor: theme.period },
  predictedCell: { backgroundColor: theme.predicted, borderColor: theme.period },
  fertileCell: { backgroundColor: theme.fertileWash },
  ovulationCell: { backgroundColor: theme.accent },
  todayCell: { borderColor: theme.focus },
  dayNumber: { color: theme.text, fontSize: 14 },
  periodNumber: { color: theme.onAccent, fontWeight: '600' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 12, height: 12, borderRadius: 4 },
  periodSwatch: { backgroundColor: theme.period },
  predictedSwatch: { backgroundColor: theme.predicted, borderWidth: 1, borderColor: theme.period },
  ovulationSwatch: { backgroundColor: theme.accent },
  fertileSwatch: { backgroundColor: theme.fertileWash },
  legendLabel: { color: theme.muted, fontSize: 13 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  switchLabel: { color: theme.text, fontSize: 16 },
  summary: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, gap: 10 },
  summaryRow: { gap: 2 },
  summaryLabel: { color: theme.muted, fontSize: 13 },
  summaryValue: { color: theme.text, fontSize: 16 },
  empty: { color: theme.text, fontSize: 16 },
  disclaimer: { color: theme.muted, fontSize: 14, lineHeight: 20 },
});
