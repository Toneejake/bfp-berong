// app/adult/simulation/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import SimulationCanvas from "@/components/simulation-canvas";
import SimulationDashboard from "@/components/simulation-dashboard";

// Define the structure of our simulation results
interface SimulationResult {
  dashboard: { total_agents: number; escaped: number; burned: number };
  animation_data: {
    exits: [number, number][];
    history: {
      fire_map: [number, number][];
      agents: [[number, number], string][];
    }[];
    grid_shape: [number, number];
  };
}

export default function SimulationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "complete" | "failed">("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Auth check
  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  if (!user?.permissions.accessAdult) {
    router.push("/");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const pollStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${backendUrl}/api/v1/status/${id}`);
        const data = await res.json();

        if (data.status === "complete") {
          clearInterval(interval);
          setStatus("complete");
          setResult(data.result);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setStatus("failed");
          console.error("Simulation failed:", data.error);
        }
      } catch (error) {
        clearInterval(interval);
        setStatus("failed");
        console.error("Polling error:", error);
      }
    }, 3000); // Check every 3 seconds
  };

  const handleRunSimulation = async () => {
    if (!file) return;

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${backendUrl}/api/v1/simulate`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (data.job_id) {
        setStatus("processing");
        setJobId(data.job_id);
        pollStatus(data.job_id);
      } else {
        throw new Error("No job_id received from server");
      }

    } catch (error) {
      setStatus("failed");
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Fire Spread & Evacuation Simulator</h1>
      
      {status !== "complete" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Floor Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
            <Button onClick={handleRunSimulation} disabled={!file || status === "processing" || status === "uploading"}>
              {(status === "processing" || status === "uploading") && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {status === "processing" ? "Simulating..." : "Run Simulation"}
            </Button>
             {status === "processing" && <p className="text-sm text-muted-foreground">This may take a minute. The AI is running thousands of calculations...</p>}
          </CardContent>
        </Card>
      )}

      {status === "complete" && result && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <SimulationCanvas animationData={result.animation_data} />
          </div>
          <div>
            <SimulationDashboard dashboardData={result.dashboard} />
          </div>
        </div>
      )}
      {status === "failed" && <p className="text-destructive mt-4">An error occurred. Please try again.</p>}
      </div>
    </div>
  );
}
