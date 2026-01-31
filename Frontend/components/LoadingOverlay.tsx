"use client";
import { useState, createContext, useContext } from "react";
import Spinner from "@/components/ui/Spinner";

const LoadingContext = createContext({
  show: false,
  setShow: (_: boolean) => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <LoadingContext.Provider value={{ show, setShow }}>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Spinner />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}
