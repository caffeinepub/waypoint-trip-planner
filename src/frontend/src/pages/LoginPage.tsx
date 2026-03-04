import { Button } from "@/components/ui/button";
import { Camera, Compass, Globe, Loader2, MapIcon } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/generated/hero-bg.dim_1400x400.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          opacity: 0.25,
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.97 0.01 75 / 0.1) 0%, oklch(0.97 0.01 75 / 0.85) 60%, oklch(0.97 0.01 75) 100%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-8 pt-8">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-teal" strokeWidth={1.5} />
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            Waypoint
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-5xl font-light tracking-tight text-foreground mb-3 leading-tight">
              Your journeys,
              <br />
              <em className="text-teal not-italic">beautifully kept.</em>
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Organise trip memories into folders, plan future adventures with
              checklists, itineraries, and budgets — all in one private space.
            </p>
          </motion.div>

          {/* Feature icons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="flex justify-center gap-8 mb-10"
          >
            {[
              { icon: Camera, label: "Memories" },
              { icon: MapIcon, label: "Planning" },
              { icon: Globe, label: "Adventures" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-xl bg-primary/8 border border-border flex items-center justify-center">
                  <Icon className="w-5 h-5 text-teal" strokeWidth={1.5} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          >
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-medium rounded-xl shadow-teal"
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in to continue"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              Secured with Internet Identity — no passwords required
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
