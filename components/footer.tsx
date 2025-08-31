import Link from "next/link";
import { Wrench } from "lucide-react";

export function Footer() {
  return (
   <footer className="border-t py-6">
  <div className="w-full flex justify-center items-center gap-6 px-4 md:px-6">
    <p className="text-sm text-muted-foreground text-center">
      © 2025 IneerEase All rights reserved.
    </p>
    <p className="text-sm text-muted-foreground text-center">
      Made with 🤍 by Adhishthatri Singh
    </p>
    <p className="text-sm text-muted-foreground text-center">
      singhadhishthatri@gmail.com
    </p>
  </div>
</footer>



  );
}