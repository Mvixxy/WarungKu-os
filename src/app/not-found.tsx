import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <span className="font-heading text-3xl font-bold text-primary">404</span>
          </div>
        </div>
        <div>
          <h1 className="font-heading text-xl font-semibold">Halaman tidak ditemukan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Halaman yang kamu cari tidak ada atau sudah dipindahkan.
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="rounded-lg">Kembali ke Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
