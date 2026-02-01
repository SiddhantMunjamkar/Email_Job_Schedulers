export function googleLogin() {
  window.location.href =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      redirect_uri: "http://localhost:4000/api/v1/auth/google/callback",
      response_type: "code",
      scope: "openid email profile",
    });
}
