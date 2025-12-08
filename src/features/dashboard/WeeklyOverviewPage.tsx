import { sampleWeeks } from "../../data/sample-data/sampleWeek";
import { computeTrendMetrics } from "../../domain/weekTrend";

export function WeeklyOverviewPage() {
  const trend = computeTrendMetrics(sampleWeeks);
  return (
    <main>
      <h1>Weekly Fitness Overview</h1>

      <ul>
        {trend.map((week) => (
          <li key={week.id}>
            <h2>Week of {week.weekOf}</h2>
            <div>
              <div> Avg weight: {week.avgWeightKg?.toFixed(1)}kg</div>
              <div>
                {" "}
                Min / Max: {week.minWeightKg?.toFixed(1)}kg /{" "}
                {week.maxWeightKg?.toFixed(1)}kg
              </div>
              <div>Avg calories: {week.avgCalories?.toFixed(0)} kcal</div>
              <div>Avg protein: {week.avgProteinG?.toFixed(0)} g</div>
              <div>
                Avg protein per kg: {week.avgProteinPerKg?.toFixed(2)} g/kg
              </div>
              <div>
                Avg steps:{" "}
                {sampleWeeks.find((w) => w.id === week.id)?.avgStepsPerDay}
              </div>
              <div>
                Δ weight vs prev:{" "}
                {week.weightChangeVsPrevKg
                  ? `${week.weightChangeVsPrevKg.toFixed(
                      1
                    )} kg (${week.weightChangeVsPrevPercent?.toFixed(1)}%)`
                  : "n/a"}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
