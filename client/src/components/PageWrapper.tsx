import React from "react";
import { Box } from "@mui/material";

const bgColors: Record<string, string> = {
  userHome: "#e6f7f1",      // Mint Cream
  therapistHome: "#e3f0fb", // Powder Blue
  progress: "#fffbe6",      // Lemon Chiffon
  games: "#f6f0fa",         // Lavender Blush
  other: "#f5f8fa",         // Mist Blue
};

export const PageWrapper = ({
  children,
  variant = "other",
}: {
  children: React.ReactNode;
  variant?: "userHome" | "therapistHome" | "progress" | "games" | "other";
}) => (
  <Box
    sx={{
      minHeight: "100vh",
      backgroundColor: bgColors[variant],
      fontFamily: "Inter, sans-serif",
      width: "100%",
    }}
  >
    {children}
  </Box>
); 