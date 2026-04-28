import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Separator } from "@repo/ui/separator";

export default function Home() {
  return (
    <main className="dark min-h-svh bg-background px-6 py-10 text-foreground md:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-border bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))] p-8 shadow-card">
          <span className="font-medium text-muted-foreground text-xs uppercase tracking-[0.28em]">
            apps/admin verification
          </span>
          <h1 className="mt-6 text-balance font-semibold text-4xl tracking-[-0.04em] md:text-5xl">
            Admin console now consumes shared shadcn/ui components.
          </h1>
          <Separator className="my-8" />
          <p className="text-muted-foreground">
            This screen validates the same Button, Card, Input, Label, and
            Separator exports under a dark admin surface.
          </p>
        </div>

        <Card className="border-border bg-card/90 shadow-card">
          <CardHeader>
            <CardTitle>Agent Controls</CardTitle>
            <CardDescription>
              Shared primitives keep the internal workflow consistent with the
              public app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="admin-model">Model alias</Label>
                <Input defaultValue="support-router" id="admin-model" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-owner">Owner</Label>
                <Input defaultValue="Operations" id="admin-owner" />
              </div>
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Latency", "128 ms"],
                ["Handoffs", "42"],
                ["Coverage", "98%"],
              ].map(([label, value]) => (
                <div
                  className="rounded-lg border border-border bg-muted/40 p-4"
                  key={label}
                >
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                    {label}
                  </p>
                  <p className="mt-2 font-semibold text-2xl">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="button" variant="secondary">
              Save config
            </Button>
            <Button type="button" variant="ghost">
              View audit log
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
