import * as React from "react";

import Alert from "@mui/material/Alert";

import { logger } from "@/lib/default-logger";
import { useUser } from "@/hooks/use-user";
import { paths } from "@/utils/paths";
import { useNavigate } from "react-router";
import { getLocalStorage } from "@/utils/auth";

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({
  children,
}: AuthGuardProps): React.JSX.Element | null {
  // const { company } = useParams() as { company: string };

  // const router = useRouter();
  const navigate = useNavigate();

  const { user, error, isLoading } = useUser();

  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  const checkPermissions = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    if (error) {
      setIsChecking(false);
      return;
    }

    if (!user) {
      logger.debug(
        "[AuthGuard]: User is not logged in, redirecting to sign in"
      );
      // router.replace(paths.auth.signIn);
      // router.replace(paths.auth.newLogin(company));
      // router.replace(paths.auth.newLogin(company == 'intuityfe' ? '' : company));
      const aliasUser: any = getLocalStorage("alias-details");

      navigate(paths.auth.newLogin(aliasUser?.alias ?? ""));

      return;
    }

    setIsChecking(false);
  };

  React.useEffect(() => {
    checkPermissions().catch(() => {
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, [user, error, isLoading]);

  if (isChecking) {
    return null;
  }

  if (error) {
    return <Alert color="error">{error}</Alert>;
  }

  return <React.Fragment>{children}</React.Fragment>;
}
