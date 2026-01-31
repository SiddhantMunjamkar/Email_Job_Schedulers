import { AuthInput } from "@/components/ui/auth-input";
import { Button } from "@/components/ui/button";

export function EmailLoginForm() {
  return (
    <>
      <div className="space-y-4">
        <AuthInput placeholder=" Email Id" />
        <AuthInput type="password" placeholder="Password" />
      </div>

      {/* Submit Button */}
      <div>
        <Button variant="login" size="login" className="mb-5 mt-6">
          Login
        </Button>
      </div>
    </>
  );
}
