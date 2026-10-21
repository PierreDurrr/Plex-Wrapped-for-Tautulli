import { useCallback, useEffect, useState } from "react";
import { WrappedReport } from "@/components/WrappedReport";
import { BackgroundMusic } from "@/components/BackgroundMusic";
import { AdminPanel } from "@/components/AdminPanel";
import { PlexLogin } from "@/components/PlexLogin";
import { plexLoginErrorMessage, waitForPlexPin } from "@/lib/plexAuth";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles } from "lucide-react";
import { loadPublicConfig } from "@/lib/serverConfig";
import { audioUrl } from "@/lib/audio";
import { api } from "@/lib/api";
import { AmbientBackground } from "@/components/motion/AmbientBackground";
import { KineticText } from "@/components/motion/KineticText";
import type { PublicConfig, SessionInfo } from "@/types/api";
import { t } from "@/lib/i18n";

const NO_SESSION: SessionInfo = { viewer: null, isAdmin: false, canViewAnyone: false };

export default function Index() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [session, setSession] = useState<SessionInfo>(NO_SESSION);
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pinPending, setPinPending] = useState(false);

  const refresh = useCallback(async () => {
    const [nextConfig, nextSession] = await Promise.all([loadPublicConfig(), api.session().catch(() => NO_SESSION)]);
    setConfig(nextConfig);
    setSession(nextSession);
  }, []);

  useEffect(() => {
    const init = async () => {
      await refresh();
      setLoading(false);

      const params = new URLSearchParams(window.location.search);
      const pin = Number(params.get("plexPin"));
      if (!pin) return;
      params.delete("plexPin");
      const query = params.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);

      setPinPending(true);
      try {
        const result = await waitForPlexPin(pin, () => false);
        if (result === "ok") await refresh();
        else setLoginError("The Plex sign-in expired. Please try again.");
      } catch (error) {
        setLoginError(plexLoginErrorMessage(error));
      } finally {
        setPinPending(false);
      }
    };
    init();
  }, [refresh]);

  const adminPanel = (
    <AdminPanel
      isOpen={showAdminPanel}
      onClose={() => {
        setShowAdminPanel(false);
        refresh();
      }}
    />
  );

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AmbientBackground />
        <span className="font-display text-xl font-semibold shimmer-text">{t("app.loading")}</span>
      </div>
    );
  }

  const music = (
    <BackgroundMusic
      src={config.settings.musicEnabled ? audioUrl("music", config.customAudioVersions.music) : null}
      startUnmuted={config.settings.musicStartUnmuted}
    />
  );

  if (!config.configured) {
    return (
      <>
        {music}
        <div className="min-h-screen flex items-center justify-center p-4">
          <AmbientBackground />

          <div className="text-center max-w-md relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-bg mb-6 glow">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>

            <KineticText
              as="h1"
              text="Plex Wrapped"
              gradient
              trigger="mount"
              delay={0.1}
              className="font-display text-5xl md:text-6xl font-extrabold tracking-tighter mb-3"
            />

            <p className="text-muted-foreground text-lg mb-8">{t("app.notConfigured")}</p>

            <Button
              size="lg"
              onClick={() => setShowAdminPanel(true)}
              className="bg-gradient-to-r from-cyan to-pink hover:opacity-90 transition-opacity"
            >
              <Shield className="w-5 h-5 mr-2" />
              {t("app.openAdmin")}
            </Button>

            <p className="text-sm text-muted-foreground mt-6">{t("app.serverAdministrators")}</p>
          </div>
        </div>

        {adminPanel}
      </>
    );
  }

  if (config.settings.accessMode === "plex" && !session.viewer && !session.isAdmin) {
    return (
      <>
        {music}
        <PlexLogin
          serverName={config.plexServerName}
          initialError={loginError}
          pending={pinPending}
          onSignedIn={refresh}
          onOpenAdmin={() => setShowAdminPanel(true)}
        />
        {adminPanel}
      </>
    );
  }

  const reportKey = [config.settings.accessMode, session.viewer?.kind, session.viewer?.userId, session.isAdmin, session.canViewAnyone].join(":");

  return (
    <>
      {music}
      <WrappedReport key={reportKey} publicConfig={config} session={session} onRefresh={refresh} />
    </>
  );
}
