// Minimal react-router-dom compatibility shim over @tanstack/react-router.
// Lets us reuse code originally written for react-router-dom v6.
import * as React from "react";
import {
  Link as TLink,
  Navigate as TNavigate,
  useNavigate as useTNavigate,
  useLocation as useTLocation,
} from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type AnyProps = Record<string, unknown>;

export const Link = React.forwardRef<HTMLAnchorElement, AnyProps>(function Link(
  { to, replace, state, children, ...rest },
  ref,
) {
  return (
    // @ts-expect-error TanStack Link accepts string `to` for static paths.
    <TLink ref={ref} to={to as string} replace={replace as boolean | undefined} {...rest}>
      {children as React.ReactNode}
    </TLink>
  );
});

interface NavLinkCompatProps {
  to: string;
  end?: boolean;
  replace?: boolean;
  className?: string | ((p: { isActive: boolean; isPending: boolean }) => string);
  style?: React.CSSProperties;
  children?: React.ReactNode | ((p: { isActive: boolean; isPending: boolean }) => React.ReactNode);
  activeClassName?: string;
  pendingClassName?: string;
  [key: string]: unknown;
}

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkCompatProps>(function NavLink(
  { to, end, className, activeClassName, pendingClassName, children, ...rest },
  ref,
) {
  return (
    // @ts-expect-error
    <TLink
      ref={ref}
      to={to}
      activeOptions={{ exact: !!end }}
      {...rest}
      className={(state: { isActive: boolean }) => {
        const ctx = { isActive: state.isActive, isPending: false };
        const base = typeof className === "function" ? className(ctx) : className;
        return cn(base, ctx.isActive && activeClassName, ctx.isPending && pendingClassName);
      }}
    >
      {typeof children === "function"
        ? (state: { isActive: boolean }) =>
            (children as (p: { isActive: boolean; isPending: boolean }) => React.ReactNode)({
              isActive: state.isActive,
              isPending: false,
            })
        : children}
    </TLink>
  );
});

export function useNavigate() {
  const navigate = useTNavigate();
  return React.useCallback(
    (to: string | number, opts?: { replace?: boolean; state?: unknown }) => {
      if (typeof to === "number") {
        if (typeof window !== "undefined") window.history.go(to);
        return;
      }
      navigate({ to, replace: opts?.replace });
    },
    [navigate],
  );
}

export function useLocation() {
  return useTLocation();
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  // @ts-expect-error
  return <TNavigate to={to} replace={replace} />;
}
