/**
 * E2E-style tests for the password recovery flow on /reset-password.
 *
 * These tests simulate the four target environments by overriding
 * navigator.userAgent and the recovery URL shape that each email client
 * typically forwards:
 *
 *   - Android Chrome  → ?code=...           (PKCE)
 *   - iPhone Safari   → #access_token&refresh_token&type=recovery (implicit)
 *   - Gmail app       → ?error=access_denied&error_code=otp_expired (expired)
 *   - Outlook app     → ?code=... but link already consumed
 *
 * The Supabase client is mocked so we can assert which API is called
 * and verify the Arabic UI states (checking / ready form / specific errors).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ---- Supabase mock --------------------------------------------------------
const exchangeCodeForSession = vi.fn();
const setSession = vi.fn();
const getSession = vi.fn();
const updateUser = vi.fn();
const getUser = vi.fn();
const onAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: (...a: unknown[]) => exchangeCodeForSession(...a),
      setSession: (...a: unknown[]) => setSession(...a),
      getSession: (...a: unknown[]) => getSession(...a),
      updateUser: (...a: unknown[]) => updateUser(...a),
      getUser: (...a: unknown[]) => getUser(...a),
      onAuthStateChange: (...a: unknown[]) => onAuthStateChange(...a),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }),
        }),
      }),
    }),
  },
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import ResetPassword from "../ResetPassword";

// ---- Helpers --------------------------------------------------------------
function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
}

function setUrl(search: string, hash: string) {
  // jsdom does not allow direct window.location assignment, but replaceState works.
  window.history.replaceState({}, "", `/reset-password${search}${hash}`);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ResetPassword />
    </MemoryRouter>
  );
}

const UA = {
  androidChrome:
    "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  gmail:
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 GSA/300.0",
  outlook:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Outlook-iOS/2.0",
};

beforeEach(() => {
  exchangeCodeForSession.mockReset();
  setSession.mockReset();
  getSession.mockReset();
  updateUser.mockReset();
  getUser.mockReset();
  onAuthStateChange.mockClear();
  getSession.mockResolvedValue({ data: { session: null }, error: null });
});

afterEach(() => {
  cleanup();
  setUrl("", "");
});

// ---------------------------------------------------------------------------
describe("Password recovery — Android Chrome (PKCE ?code=)", () => {
  it("exchanges code for session and shows the new-password form", async () => {
    setUserAgent(UA.androidChrome);
    setUrl("?code=valid-code-123", "");
    exchangeCodeForSession.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
      error: null,
    });

    renderPage();

    await waitFor(() => {
      expect(exchangeCodeForSession).toHaveBeenCalledWith("valid-code-123");
    });
    expect(
      await screen.findByRole("heading", { name: /تعيين كلمة مرور جديدة/ })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/كلمة المرور الجديدة/)).toBeInTheDocument();
    // URL should be cleaned
    expect(window.location.search).toBe("");
  });
});

describe("Password recovery — iPhone Safari (implicit hash)", () => {
  it("calls setSession with hash tokens and shows the form", async () => {
    setUserAgent(UA.iphoneSafari);
    setUrl(
      "",
      "#access_token=AT-iphone&refresh_token=RT-iphone&type=recovery&expires_in=3600"
    );
    setSession.mockResolvedValue({
      data: { session: { user: { id: "u2" } } },
      error: null,
    });

    renderPage();

    await waitFor(() => {
      expect(setSession).toHaveBeenCalledWith({
        access_token: "AT-iphone",
        refresh_token: "RT-iphone",
      });
    });
    expect(
      await screen.findByLabelText(/تأكيد كلمة المرور/)
    ).toBeInTheDocument();
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("");
  });
});

describe("Password recovery — Gmail app (expired link)", () => {
  it("shows Arabic expired-link message and a 'request new link' button", async () => {
    setUserAgent(UA.gmail);
    setUrl(
      "?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired",
      ""
    );

    renderPage();

    expect(
      await screen.findByText("انتهت صلاحية الرابط، اطلب رابطاً جديداً.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /طلب رابط جديد/ })
    ).toBeInTheDocument();
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(setSession).not.toHaveBeenCalled();
  });

  it("also handles expired errors delivered in the hash fragment", async () => {
    setUserAgent(UA.gmail);
    setUrl(
      "",
      "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired"
    );

    renderPage();

    expect(
      await screen.findByText("انتهت صلاحية الرابط، اطلب رابطاً جديداً.")
    ).toBeInTheDocument();
  });
});

describe("Password recovery — Outlook app (consumed link)", () => {
  it("shows the 'already used' Arabic message when Supabase rejects the code", async () => {
    setUserAgent(UA.outlook);
    setUrl("?code=already-used-code", "");
    exchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { message: "Auth code already used / consumed" },
    });

    renderPage();

    expect(
      await screen.findByText("تم استخدام رابط الاستعادة مسبقاً.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /طلب رابط جديد/ })
    ).toBeInTheDocument();
  });
});

describe("Password recovery — generic invalid token", () => {
  it("shows the Arabic 'invalid link' message", async () => {
    setUserAgent(UA.androidChrome);
    setUrl("?code=bad", "");
    exchangeCodeForSession.mockResolvedValue({
      data: { session: null },
      error: { message: "Invalid token" },
    });

    renderPage();

    expect(await screen.findByText("الرابط غير صالح.")).toBeInTheDocument();
  });

  it("shows fallback message when no recovery params are present", async () => {
    setUserAgent(UA.androidChrome);
    setUrl("", "");

    renderPage();

    expect(
      await screen.findByText(
        "لم يتم العثور على رابط استعادة صالح. أعد فتح الرابط من البريد."
      )
    ).toBeInTheDocument();
  });
});
