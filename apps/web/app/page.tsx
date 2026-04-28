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
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_34%),linear-gradient(135deg,#fff7ed,#f8fafc_54%,#eef2ff)] px-6 py-10 text-foreground md:px-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex rounded-full border border-primary/10 bg-background/70 px-3 py-1 font-medium text-muted-foreground text-xs uppercase tracking-[0.24em] shadow-sm">
            apps/web verification
          </span>
          <h1 className="text-balance font-semibold text-4xl tracking-[-0.04em] md:text-6xl">
            Shared shadcn/ui primitives are rendering from @repo/ui.
          </h1>
          <p className="text-lg text-muted-foreground">
            Button, Card, Input, Label, and Separator are imported from the
            shared UI package and styled through the shared Tailwind v4 theme.
          </p>
        </div>

        <Card className="border-white/70 bg-background/80 shadow-card backdrop-blur">
          <CardHeader>
            <CardTitle>Launch Brief</CardTitle>
            <CardDescription>
              A compact form uses the first shadcn/ui component batch end to
              end.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-[1fr_1fr]">
            <div className="space-y-2">
              <Label htmlFor="web-project">Project</Label>
              <Input defaultValue="Customer-facing AI agent" id="web-project" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="web-channel">Channel</Label>
              <Input defaultValue="Public web app" id="web-channel" />
            </div>
            <Separator className="md:col-span-2" />
            <div className="rounded-lg border bg-muted/50 p-4 md:col-span-2">
              <p className="font-medium text-sm">Validation surface</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Components are resolved through `@repo/ui/*`, while classes are
                discovered through the package-level `@source` rule.
              </p>
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="button">Primary action</Button>
            <Button type="button" variant="outline">
              Secondary action
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
