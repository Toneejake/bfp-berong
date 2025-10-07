import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardData {
  total_agents: number;
  escaped: number;
  burned: number;
}

export default function SimulationDashboard({ dashboardData }: { dashboardData: DashboardData }) {
  const { total_agents, escaped, burned } = dashboardData;
  const survivalRate = total_agents > 0 ? (escaped / total_agents) * 100 : 0;
  
  let riskLevel = "LOW";
  if (survivalRate < 50) riskLevel = "CRITICAL";
  else if (survivalRate < 80) riskLevel = "HIGH";
  else if (survivalRate < 100) riskLevel = "MEDIUM";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Evacuation Outcome</h3>
          <p>Total Agents: {total_agents}</p>
          <p>Escaped: {escaped} ({survivalRate.toFixed(1)}%)</p>
          <p>Burned: {burned}</p>
        </div>
        <div>
          <h3 className="font-semibold">Calculated Risk Level</h3>
          <p className={`font-bold ${riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'text-destructive' : 'text-primary'}`}>
            {riskLevel}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
