import LoginForm from "@/features/auth/components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Login to your account to access our platform and start using our services.",
  // openGraph: {
  //   title: "About Us",
  //   description: "Learn more about our mission and team.",
  //   images: ["/images/og-about.png"],
  // },
};
const LoginPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <LoginForm />
    </main>
  );
};

export default LoginPage;
