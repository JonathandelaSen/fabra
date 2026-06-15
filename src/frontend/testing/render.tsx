import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderOptions,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement, ReactNode } from "react";
import { DEFAULT_INTERFACE_LANGUAGE, type InterfaceLanguage } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  locale?: InterfaceLanguage;
  queryClient?: QueryClient;
}

interface RenderHookWithProvidersOptions<Props>
  extends Omit<RenderHookOptions<Props>, "wrapper"> {
  locale?: InterfaceLanguage;
  queryClient?: QueryClient;
}

import { ConfirmProvider } from "@/components/shared/confirm-provider";

function createProviderWrapper(locale: InterfaceLanguage, queryClient: QueryClient) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider
        locale={locale}
        messages={getMessages(locale)}
        timeZone="Europe/Madrid"
      >
        <QueryClientProvider client={queryClient}>
          <ConfirmProvider>{children}</ConfirmProvider>
        </QueryClientProvider>
      </NextIntlClientProvider>
    );
  }

  return Wrapper;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    locale = DEFAULT_INTERFACE_LANGUAGE,
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const Wrapper = createProviderWrapper(locale, queryClient);

  return {
    queryClient,
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export function renderHookWithProviders<Result, Props>(
  hook: (initialProps: Props) => Result,
  {
    locale = DEFAULT_INTERFACE_LANGUAGE,
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: RenderHookWithProvidersOptions<Props> = {},
) {
  const Wrapper = createProviderWrapper(locale, queryClient);

  return {
    queryClient,
    ...renderHook(hook, { wrapper: Wrapper, ...renderOptions }),
  };
}
