import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/use-auth";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/spinner";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || "/" });
    }
  },
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [logginIn, setLogginIn] = useState(false);
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: search.redirect || "/" });
    }
  }, [isAuthenticated, navigate, search.redirect]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!account || !password) {
      return;
    }

    setLogginIn(true);
    try {
      await login(account, password);
    } catch (error) {
      // TODO: Replace with a user-friendly toast notification
      console.error("Login failed:", error);
      setLogginIn(false);
    }
  };

  return (
    <div className="flex h-screen font-inter">
      {/* Left Section - Background Image */}
      <div className="flex-[525] min-w-0 bg-no-repeat relative bg-[url('/login_bg.jpg')] bg-[length:134%_auto] bg-top-left">
        <div
          className="absolute inset-y-0 left-0 w-[40%] bg-[var(--color-surface-100)] opacity-60"
          style={{
            clipPath: "polygon(0 0, 100% 0, 35% 100%, 0 100%)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-[24%] bg-surface-400"
          style={{
            clipPath: "polygon(67% 0,100% 0, 100% 100%, 0 100%)",
          }}
        />

        <div
          className="absolute inset-y-0 right-0 w-[32%] bg-primary-300 opacity-65"
          style={{
            clipPath: "polygon(0% 0,100% 0, 50% 100%)",
          }}
        />

        <div
          className="absolute inset-y-0 right-0 w-[16%] bg-secondary-800"
          style={{
            clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          }}
        />
        <img src="/logo-with-name.png" className="relative top-20 left-16" />
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-[310] min-w-0 flex items-center  p-16 bg-secondary-800">
        <div className="w-full max-w-xs">
          <h1 className="text-header-xl text-white font-bold">登入</h1>
          <h1 className="text-title-md text-surface-200 font-semibold mb-16">
            歡迎登入!
          </h1>

          <form onSubmit={handleLogin}>
            <div
              className={cn(
                "mb-6 w-96 flex items-center gap-3 flex-row-reverse p-3 border-b relative",
                "has-[:valid]:bg-primary-50 has-[:valid]:border-primary-300 has-[:user-invalid]:border-danger-300",
                logginIn
                  ? "bg-primary-50 border-primary-300"
                  : "border-surface-400"
              )}
            >
              <input
                id="account"
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className={cn(
                  "flex-1 relative outline-0 caret-white peer",
                  "placeholder:text-surface-300 valid:text-secondary-800 valid:caret-secondary-800",
                  "user-invalid:text-danger-300 user-invalid:placeholder:text-danger-300",
                  logginIn && "text-secondary-800 caret-secondary-800"
                )}
                placeholder="請輸入帳號"
                required
                disabled={logginIn}
              />
              <div
                className={cn(
                  "w-px h-6",
                  logginIn
                    ? "bg-surface-400"
                    : "bg-surface-200 peer-valid:bg-surface-400"
                )}
              />
              <label
                htmlFor="account"
                className={cn(
                  "peer-valid:hidden peer-user-invalid:hidden",
                  logginIn && "hidden"
                )}
              >
                <img src="/user.png" />
              </label>
              <label
                htmlFor="account"
                className={cn("hidden peer-valid:block", logginIn && "block")}
              >
                <img src="/user-yellow.png" />
              </label>
              <label
                htmlFor="account"
                className={cn(
                  "hidden peer-user-invalid:block",
                  logginIn && "hidden"
                )}
              >
                <img src="/user-red.png" />
              </label>
              <span className="hidden text-xs text-danger-200 peer-user-invalid:block peer-user-invalid:absolute -bottom-1 left-[60px] translate-y-full">
                帳號為必填
              </span>
            </div>

            <div
              className={cn(
                "mb-6 w-96 flex items-center gap-3 flex-row-reverse p-3 border-b relative",
                "has-[:valid]:bg-primary-50 has-[:valid]:border-primary-300 has-[:user-invalid]:border-danger-300",
                logginIn
                  ? "bg-primary-50 border-primary-300"
                  : "border-surface-400"
              )}
            >
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "flex-1 relative outline-0 caret-white peer",
                  "placeholder:text-surface-300 valid:text-secondary-800 valid:caret-secondary-800",
                  "user-invalid:text-danger-300 user-invalid:placeholder:text-danger-300",
                  logginIn && "text-secondary-800 caret-secondary-800"
                )}
                placeholder="請輸入密碼"
                required
                disabled={logginIn}
              />
              <div
                className={cn(
                  "w-px h-6",
                  logginIn
                    ? "bg-surface-400"
                    : "bg-surface-200 peer-valid:bg-surface-400"
                )}
              />
              <label
                htmlFor="account"
                className={cn(
                  "peer-valid:hidden peer-user-invalid:hidden",
                  logginIn && "hidden"
                )}
              >
                <img src="/lock.png" />
              </label>
              <label
                htmlFor="account"
                className={cn("hidden peer-valid:block", logginIn && "block")}
              >
                <img src="/lock-yellow.png" />
              </label>
              <label
                htmlFor="account"
                className={cn(
                  "hidden peer-user-invalid:block",
                  logginIn && "hidden"
                )}
              >
                <img src="/lock-red.png" />
              </label>
              <span className="hidden text-xs text-danger-200 peer-user-invalid:block peer-user-invalid:absolute -bottom-1 left-[60px] translate-y-full">
                密碼為必填
              </span>
            </div>

            <Label className="mb-16 text-white">
              <Checkbox
                className="data-[state=checked]:bg-primary-300 size-6 "
                iconClassName="size-5"
                disabled={logginIn}
              />
              記住帳號密碼
            </Label>

            <button
              className="text-button-md w-96 flex items-center justify-center gap-2 py-4.5 bg-primary-300 text-white"
              disabled={logginIn}
            >
              登入
              {logginIn && <Spinner />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
