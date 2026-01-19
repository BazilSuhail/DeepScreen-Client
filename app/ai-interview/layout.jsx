"use client";

import { AvatarProvider } from "@/context/AvatarContext";

export default function AIInterviewLayout({ children }) {
    return (
        <AvatarProvider>
            {children}
        </AvatarProvider>
    );
}
