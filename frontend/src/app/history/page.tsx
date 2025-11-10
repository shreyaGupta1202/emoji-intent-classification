"use client";
import Navbar from "@/components/landing/Navbar";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ClassificationDetail from "./ClassificationDetail";

interface ClassificationRecord {
  record_id: string;
  user_email: string;
  input_chat: any; // eslint-disable-line
  output_analysis: any; // eslint-disable-line
  created_at: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ClassificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] =
    useState<ClassificationRecord | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("classification_history")
        .select("*")
        .eq("user_email", user.email)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
        setError("Failed to load history.");
      } else {
        setHistory(data || []);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Classification History</h1>
        {loading && <p>Loading history...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && history.length === 0 && (
          <p>No classification history found.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.map((record) => (
            <Card key={record.record_id}>
              <CardHeader>
                <CardTitle>
                  Record from {new Date(record.created_at).toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  User: {record.user_email}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setSelectedRecord(record)}>
                      View Details
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
        {selectedRecord && (
          <Dialog
            open={!!selectedRecord}
            onOpenChange={() => setSelectedRecord(null)}
          >
            <DialogContent className="max-w-[90%] max-h-[90%] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Classification Details from{" "}
                  {new Date(selectedRecord.created_at).toLocaleString()}
                </DialogTitle>
              </DialogHeader>
              <ClassificationDetail
                inputChat={selectedRecord.input_chat}
                outputAnalysis={selectedRecord.output_analysis}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
