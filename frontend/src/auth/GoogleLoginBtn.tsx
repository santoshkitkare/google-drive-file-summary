import { useGoogleLogin } from "@react-oauth/google";

type Props = {
  onAuthCode: (code: string) => void;
};

export default function GoogleLoginBtn({ onAuthCode }: Props) {
  const login = useGoogleLogin({
    flow: "auth-code",
    scope:
      "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.readonly",
    onSuccess: (response) => {
      console.log("OAuth SUCCESS:", response);
      onAuthCode(response.code);
    },
    onError: (error) => {
      console.error("OAuth ERROR:", error);
    },
  });

  return (
    <button onClick={() => login()}>
      🔐 Login with Google
    </button>
  );
}
