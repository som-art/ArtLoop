import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";

import { useNavigate } from "react-router-dom";
import { app } from "../firebase";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function OAuth() {
  const auth = getAuth(app);

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async () => {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });

        // Initiate Google sign-in
        const resultsFromGoogle = await signInWithPopup(auth, provider);
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: resultsFromGoogle.user.displayName,
            email: resultsFromGoogle.user.email,
            googlePhotoUrl: resultsFromGoogle.user.photoURL,
          }),
        });
        const data = await res.json();

        // Check for errors
        if (!res.ok) throw new Error(data.error || "Google Sign-in failed");

        return data;
      } catch (error) {
        console.error(error);
        throw error; // Ensure error is thrown to trigger onError
      }
    },
    onSuccess: (data) => {
      //dispatch(signInSuccess(data));
      toast.success("Signed in successfully");
      // navigate("/"); // Uncomment if navigation is needed
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Sign-in failed");
    },
  });

  const handleGoogleClick = () => {
    mutate();
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className="btn rounded-full btn-primary text-white btn-outline w-full"
    >
      <AiFillGoogleCircle className="w-6 h-6 mr-2" />
      Continue with Google
    </button>
  );
}
