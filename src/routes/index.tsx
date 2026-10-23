import { createFileRoute } from "@tanstack/react-router";
import { LarderApp } from "@/components/larder/LarderApp";

export const Route = createFileRoute("/")({ component: LarderApp });
