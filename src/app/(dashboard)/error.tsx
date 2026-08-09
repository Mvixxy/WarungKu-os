"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-sm text-center">
        <CardHeader>
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="font-heading text-lg">Terjadi kesalahan</CardTitle>
          <CardDescription className="text-sm">
            Gagal memuat halaman. Coba muat ulang atau kembali ke dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-2">
          <Button variant="outline" className="rounded-lg" onClick={() => reset()}>
            Muat Ulang
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
