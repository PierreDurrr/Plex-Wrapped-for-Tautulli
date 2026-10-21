import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { KineticText } from "@/components/motion/KineticText";
import { useMagnetic } from "@/hooks/use-magnetic";
import { fireConfetti } from "@/lib/confetti";
import { EASE_OUT_EXPO, VIEWPORT } from "@/lib/motion";
import { t } from "@/lib/i18n";

interface FinaleProps {
  name: string | null;
  showExport: boolean;
  isExporting: boolean;
  onExport: () => void;
}

export const Finale = ({ name, showExport, isExporting, onExport }: FinaleProps) => {
  const headlineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headlineRef, { once: true, amount: 0.6 });
  const magnet = useMagnetic(10);

  useEffect(() => {
    if (!inView) return;
    const timer = window.setTimeout(() => {
      const rect = headlineRef.current?.getBoundingClientRect();
      if (!rect) return;
      fireConfetti({ x: rect.left + rect.width * 0.15, y: rect.top + rect.height / 2 }, { angle: 65, spread: 50, count: 70 });
      fireConfetti({ x: rect.left + rect.width * 0.85, y: rect.top + rect.height / 2 }, { angle: 115, spread: 50, count: 70 });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [inView]);

  return (
    <footer className="relative text-center px-4 pt-16 pb-24">
      <div ref={headlineRef}>
        <KineticText
          as="h2"
          text={t("app.finaleWrap")}
          gradient
          className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter leading-none"
        />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ delay: 0.5, duration: 0.8, ease: EASE_OUT_EXPO }}
          className="mt-5 text-lg md:text-xl text-muted-foreground"
        >
          {name ? t("app.finaleNextYear", { name }) : t("app.finaleNextYearGeneric")}
        </motion.p>
      </div>

      {showExport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ delay: 0.7, duration: 0.8, ease: EASE_OUT_EXPO }}
          className="mt-12"
        >
          <motion.button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            style={magnet.style}
            {...magnet.handlers}
            className="group relative inline-flex overflow-hidden rounded-full p-[2px] shadow-[0_10px_40px_-10px_hsl(var(--purple)/0.8)] outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span
              aria-hidden
              className="absolute -inset-full animate-spin-slow"
              style={{
                animationDuration: "4s",
                background: "conic-gradient(from 0deg, hsl(var(--cyan)), hsl(var(--purple)), hsl(var(--pink)), hsl(var(--cyan)))",
              }}
            />
            <span className="shine relative flex items-center gap-2 rounded-full bg-background/90 px-8 py-4 text-lg font-semibold text-foreground transition-colors group-hover:bg-background/75">
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("app.exportingSlides")}
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
                  {t("app.exportSlides")}
                </>
              )}
            </span>
          </motion.button>
          <p className="text-sm text-muted-foreground mt-4">{t("app.downloadWrapped")}</p>
        </motion.div>
      )}

      <p className="text-sm text-muted-foreground/50 mt-14">{t("app.poweredByTautulli")}</p>
    </footer>
  );
};
