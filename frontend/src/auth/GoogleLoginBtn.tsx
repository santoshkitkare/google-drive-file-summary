import { useGoogleLogin } from "@react-oauth/google";

function LoginButton({ onAuthCode }: { onAuthCode: (code: string) => void }) {
  const login = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/drive.readonly",
    onSuccess: (codeResponse) => {
      onAuthCode(codeResponse.code);
    },
    onError: () => {
      alert("Google login failed");
    },
  });

  return (
    <button className="google-login-btn" onClick={() => login()}>
      <img src="/GoogleLogin.png" alt="Google" />
      <span>Continue with Google</span>
    </button>
  );
}

export default function GoogleLoginBtn({
  onAuthCode,
}: {
  onAuthCode: (code: string) => void;
}) {
  return <LoginButton onAuthCode={onAuthCode} />;
}
