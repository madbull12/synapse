import RegisterForm from "@/features/auth/components/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register for an account to access our platform and start using our services.",
  // openGraph: {
  //   title: "About Us",
  //   description: "Learn more about our mission and team.",
  //   images: ["/images/og-about.png"],
  // },
};
const RegisterPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <RegisterForm />
    </main>
  );
};

export default RegisterPage;
